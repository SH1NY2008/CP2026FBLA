'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Container } from '@/components/ui/container';
import { Header } from '@/components/header';
import { BusinessMap } from '@/components/business-map';
import { BusinessCardSkeleton } from '@/components/business-card-skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { PhotoLightbox } from '@/components/photo-lightbox';
import { LocationEnvPanel } from '@/components/location-env-panel';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertCircle,
  Clock,
  Phone,
  Globe,
  MapPin,
  Bookmark,
  PencilLine,
  ExternalLink,
  Navigation,
  Share2,
  Images,
  Camera,
  CheckCircle2,
  Sparkles,
  Loader2,
  Users,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment,
  addDoc,
  collection,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/firebase';
import { Button } from '@/components/ui/button';
import { CommentSection } from '@/components/comment-section';
import { ReviewForm } from '@/components/review-form';
import { StarRating } from '@/components/star-rating';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Photo {
  photo_reference: string;
  width: number;
  height: number;
}

interface OpeningHours {
  open_now: boolean;
  periods: {
    open: { day: number; time: string };
    close?: { day: number; time: string };
  }[];
  weekday_text: string[];
}

interface BusinessDetails {
  name: string;
  formatted_address: string;
  geometry: { location: { lat: number; lng: number } };
  rating: number;
  user_ratings_total: number;
  photos: Photo[];
  opening_hours: OpeningHours;
  formatted_phone_number: string;
  website: string;
  types: string[];
  price_level: number;
  summary?: { overview: string; language: string };
}

interface CommunityPhoto {
  id: string;
  url: string;
  author: string;
  authorId: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  restaurant: 'Restaurant', cafe: 'Café', bar: 'Bar', bakery: 'Bakery',
  store: 'Store', shopping_mall: 'Shopping Mall', supermarket: 'Supermarket',
  bank: 'Bank', gym: 'Gym', pharmacy: 'Pharmacy',
  hospital: 'Hospital', movie_theater: 'Cinema', park: 'Park',
  entertainment: 'Entertainment', lodging: 'Hotel', spa: 'Spa',
  beauty_salon: 'Salon', night_club: 'Night Club',
};

const PRICE_DISPLAY: Record<number, string> = { 1: '$', 2: '$$', 3: '$$$', 4: '$$$$' };
const PRICE_TOOLTIP: Record<number, string> = {
  1: 'Inexpensive · Under $10',
  2: 'Moderate · $11–$30',
  3: 'Pricey · $31–$60',
  4: 'Ultra-high end · Over $60',
};

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// ── Helpers ───────────────────────────────────────────────────────────────────

function getRatingLabel(r: number) {
  if (r >= 4.5) return 'Excellent';
  if (r >= 4.0) return 'Very Good';
  if (r >= 3.0) return 'Good';
  if (r >= 2.0) return 'Average';
  return 'Poor';
}

function readableType(type: string) {
  return TYPE_LABELS[type] ?? type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function displayTypes(types: string[]): string[] {
  const skipList = new Set([
    'point_of_interest', 'establishment', 'food', 'premise', 'political',
    'locality', 'sublocality', 'route', 'country',
    'administrative_area_level_1', 'administrative_area_level_2',
  ]);
  return types.filter((t) => !skipList.has(t)).slice(0, 3).map(readableType);
}

function fmt24to12(hhmm: string): string {
  const h = parseInt(hhmm.slice(0, 2));
  const m = parseInt(hhmm.slice(2));
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: m > 0 ? '2-digit' : undefined,
    hour12: true,
  });
}

function getOpenUntilText(hours: OpeningHours): string {
  if (!hours.periods?.length) return hours.open_now ? 'Open now' : 'Closed';
  const today = new Date().getDay();
  const currentTime = new Date().getHours() * 100 + new Date().getMinutes();

  if (hours.open_now) {
    const period = hours.periods.find((p) => p.close && p.open.day === today);
    if (period?.close) return `Open · Closes ${fmt24to12(period.close.time)}`;
    return 'Open now';
  }

  // Find next opening
  for (let offset = 0; offset < 7; offset++) {
    const checkDay = (today + offset) % 7;
    const candidates = hours.periods.filter((p) => p.open.day === checkDay);
    for (const p of candidates) {
      const openT = parseInt(p.open.time);
      if (offset === 0 && openT <= currentTime) continue;
      const timeStr = fmt24to12(p.open.time);
      const label =
        offset === 0 ? 'later today' :
        offset === 1 ? 'tomorrow' :
        DAY_NAMES[checkDay];
      return `Closed · Opens ${timeStr} ${label}`;
    }
  }
  return 'Closed';
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BusinessDetailsPage() {
  const params = useParams();
  const placeId = params.placeId as string;

  // Core data
  const [business, setBusiness] = useState<BusinessDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [distance, setDistance] = useState<number | null>(null);

  // Auth & bookmark
  const { user } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Ratings
  const [displayRating, setDisplayRating] = useState<number | null>(null);
  const [displayRatingCount, setDisplayRatingCount] = useState<number | null>(null);
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false);

  // Lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // AI summary
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Check-in
  const [checkinCount, setCheckinCount] = useState(0);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);

  // Community photos
  const [communityPhotos, setCommunityPhotos] = useState<CommunityPhoto[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
  const todayIdx = new Date().getDay();

  // ── Effects ──────────────────────────────────────────────────────────────

  useEffect(() => {
    if (user && placeId) {
      getDoc(doc(db, 'bookmarks', user.uid)).then((snap) => {
        if (snap.exists() && snap.data().placeIds?.includes(placeId)) setIsBookmarked(true);
      });
    }
  }, [user, placeId]);

  useEffect(() => {
    if (!placeId) return;
    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/places/details?placeId=${placeId}`);
        if (!res.ok) throw new Error('Failed to fetch business details');
        const data = await res.json();
        if (data.status !== 'OK') throw new Error(data.error_message || 'Failed to fetch');
        const { editorial_summary: summary, ...rest } = data.result;
        setBusiness({ ...rest, summary });

        let rating = data.result.rating;
        let count = data.result.user_ratings_total;
        const ratingSnap = await getDoc(doc(db, 'businessRatings', placeId));
        if (ratingSnap.exists()) {
          const d = ratingSnap.data();
          if (d.rating && d.ratingCount) { rating = d.rating; count = d.ratingCount; }
        }
        setDisplayRating(rating);
        setDisplayRatingCount(count);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch business details');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [placeId]);

  // Distance
  useEffect(() => {
    if (!business) return;
    navigator.geolocation?.getCurrentPosition((pos) => {
      const R = 3958.8;
      const dLat = ((business.geometry.location.lat - pos.coords.latitude) * Math.PI) / 180;
      const dLng = ((business.geometry.location.lng - pos.coords.longitude) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((pos.coords.latitude * Math.PI) / 180) *
          Math.cos((business.geometry.location.lat * Math.PI) / 180) *
          Math.sin(dLng / 2) ** 2;
      setDistance(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
    });
  }, [business]);

  // Lazy-load AI summary when no editorial summary exists
  useEffect(() => {
    if (!business || business.summary) return;
    setAiLoading(true);
    fetch('/api/ai-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: business.name,
        types: business.types,
        rating: displayRating ?? business.rating,
        ratingCount: displayRatingCount ?? business.user_ratings_total,
        address: business.formatted_address,
      }),
    })
      .then((r) => r.json())
      .then((d) => { if (d.summary) setAiSummary(d.summary); })
      .catch(() => {})
      .finally(() => setAiLoading(false));
  }, [business, displayRating, displayRatingCount]);

  // Check-in data
  useEffect(() => {
    if (!placeId) return;
    getDoc(doc(db, 'checkins', placeId)).then((snap) => {
      if (snap.exists()) {
        setCheckinCount(snap.data().count ?? 0);
        if (user) setHasCheckedIn(snap.data().userIds?.includes(user.uid) ?? false);
      }
    });
  }, [placeId, user]);

  // Community photos — real-time
  useEffect(() => {
    if (!placeId) return;
    const q = query(collection(db, 'communityPhotos'), where('placeId', '==', placeId));
    const unsub = onSnapshot(q, (snap) => {
      const photos: CommunityPhoto[] = [];
      snap.forEach((d) => photos.push({ id: d.id, ...d.data() } as CommunityPhoto));
      photos.sort((a, b) => (a as any).timestamp?.seconds - (b as any).timestamp?.seconds);
      setCommunityPhotos(photos);
    });
    return () => unsub();
  }, [placeId]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleBookmark = async () => {
    if (!user) return;
    const ref = doc(db, 'bookmarks', user.uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      await updateDoc(ref, { placeIds: isBookmarked ? arrayRemove(placeId) : arrayUnion(placeId) });
    } else {
      await setDoc(ref, { placeIds: [placeId] });
    }
    setIsBookmarked(!isBookmarked);
    toast(isBookmarked ? 'Removed from saved' : 'Saved!');
  };

  const handleReviewSuccess = async (newRating: number) => {
    const cur = displayRating ?? 0;
    const cnt = displayRatingCount ?? 0;
    const avg = (cur * cnt + newRating) / (cnt + 1);
    try {
      await setDoc(doc(db, 'businessRatings', placeId), { rating: avg, ratingCount: cnt + 1 });
    } catch (e) { console.error(e); }
    setDisplayRating(avg);
    setDisplayRatingCount(cnt + 1);
    setIsRatingDialogOpen(false);
    toast.success('Rating submitted!');
  };

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try { await navigator.share({ title: business?.name, url }); return; } catch {}
    }
    await navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  }, [business?.name]);

  const handleCheckin = async () => {
    if (!user) { toast.error('Sign in to check in'); return; }
    if (hasCheckedIn) return;
    const ref = doc(db, 'checkins', placeId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      await updateDoc(ref, { count: increment(1), userIds: arrayUnion(user.uid) });
    } else {
      await setDoc(ref, { count: 1, userIds: [user.uid] });
    }
    setCheckinCount((c) => c + 1);
    setHasCheckedIn(true);
    toast.success("Checked in! You've been here.");
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) { toast.error('Sign in to upload photos'); return; }
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }

    const fileRef = storageRef(storage, `communityPhotos/${placeId}/${Date.now()}_${file.name}`);
    const task = uploadBytesResumable(fileRef, file);

    task.on(
      'state_changed',
      (snap) => setUploadProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      (err) => { console.error(err); toast.error('Upload failed'); setUploadProgress(null); },
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        await addDoc(collection(db, 'communityPhotos'), {
          placeId,
          url,
          authorId: user.uid,
          author: user.displayName ?? 'Anonymous',
          avatarUrl: user.photoURL ?? '',
          timestamp: serverTimestamp(),
        });
        setUploadProgress(null);
        toast.success('Photo uploaded!');
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    );
  };

  const openPhoto = (i: number) => { setLightboxIndex(i); setLightboxOpen(true); };

  const rating = displayRating ?? business?.rating ?? 0;
  const ratingCount = displayRatingCount ?? business?.user_ratings_total ?? 0;
  const directionsUrl = business
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(business.formatted_address)}&destination_place_id=${placeId}`
    : '#';

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />

      {loading && <Container className="max-w-6xl pt-28"><BusinessCardSkeleton /></Container>}
      {error && (
        <Container className="max-w-6xl pt-28">
          <Alert variant="destructive" className="bg-destructive/10 border-destructive/30">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive">{error}</AlertDescription>
          </Alert>
        </Container>
      )}

      {business && (
        <>
          {/* ── Photo Gallery ─────────────────────────────────────────────── */}
          <div className="pt-20">
            <Container className="max-w-6xl pt-4">
              <div className="relative grid grid-cols-4 grid-rows-2 gap-1.5 h-[400px] overflow-hidden rounded-xl">
                {business.photos?.slice(0, 5).map((photo, i) => (
                  <button
                    key={photo.photo_reference}
                    onClick={() => openPhoto(i)}
                    className={`relative overflow-hidden bg-muted group focus:outline-none ${
                      i === 0 ? 'col-span-2 row-span-2' : ''
                    }`}
                  >
                    <Image
                      src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photoreference=${photo.photo_reference}&key=${apiKey}`}
                      alt={`${business.name} photo ${i + 1}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* "See all N photos" badge on last tile */}
                    {i === 4 && (
                      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Images className="h-5 w-5 text-white" />
                        <span className="text-white text-xs font-semibold">
                          See all {business.photos.length} photos
                        </span>
                      </div>
                    )}
                    {/* Hover dim on non-last tiles */}
                    {i !== 4 && (
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                    )}
                  </button>
                ))}

                {/* Photo count badge (bottom-right corner of grid) */}
                {business.photos?.length > 0 && (
                  <button
                    onClick={() => openPhoto(0)}
                    className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 rounded-lg bg-black/60 backdrop-blur-sm px-2.5 py-1.5 text-white text-xs font-medium hover:bg-black/80 transition-colors"
                  >
                    <Images className="h-3.5 w-3.5" />
                    {business.photos.length} photos
                  </button>
                )}

                {(!business.photos || business.photos.length === 0) && (
                  <div className="col-span-4 row-span-2 flex items-center justify-center bg-muted text-muted-foreground">
                    <MapPin className="h-12 w-12 opacity-30" />
                  </div>
                )}
              </div>
            </Container>
          </div>

          <Container className="max-w-6xl py-8">

            {/* ── Business Header ───────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-4xl font-bold text-foreground leading-tight mb-3">
                  {business.name}
                </h1>

                {/* Rating row */}
                <Dialog open={isRatingDialogOpen} onOpenChange={setIsRatingDialogOpen}>
                  <DialogTrigger asChild>
                    <button className="flex items-center gap-2.5 mb-3 group">
                      <StarRating rating={rating} size="md" />
                      <span className="text-lg font-bold text-foreground">{rating.toFixed(1)}</span>
                      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                        ({ratingCount.toLocaleString()} {ratingCount === 1 ? 'review' : 'reviews'})
                      </span>
                      <span className="text-sm font-medium text-muted-foreground">
                        · {getRatingLabel(rating)}
                      </span>
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Leave a Rating</DialogTitle></DialogHeader>
                    <ReviewForm businessId={placeId} onSuccess={handleReviewSuccess} />
                  </DialogContent>
                </Dialog>

                {/* Meta chips */}
                <div className="flex items-center gap-2 flex-wrap">
                  {displayTypes(business.types).map((t) => (
                    <span key={t} className="text-xs font-medium px-2.5 py-1 rounded-full border border-border bg-muted text-muted-foreground">
                      {t}
                    </span>
                  ))}

                  {/* Price chip with tooltip */}
                  {business.price_level > 0 && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-default text-xs font-medium px-2.5 py-1 rounded-full border border-border bg-muted text-muted-foreground">
                          {PRICE_DISPLAY[business.price_level]}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        {PRICE_TOOLTIP[business.price_level]}
                      </TooltipContent>
                    </Tooltip>
                  )}

                  {/* Open/closed with "until" time */}
                  {business.opening_hours && (
                    <span
                      className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                        business.opening_hours.open_now
                          ? 'bg-green-500/10 border border-green-500/30 text-green-500'
                          : 'bg-red-500/10 border border-red-500/30 text-red-400'
                      }`}
                    >
                      <Clock className="h-3 w-3 shrink-0" />
                      {getOpenUntilText(business.opening_hours)}
                    </span>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 flex-wrap shrink-0">
                {user && (
                  <Button
                    variant="outline"
                    onClick={handleBookmark}
                    className={`gap-2 ${isBookmarked ? 'border-accent text-accent' : ''}`}
                  >
                    <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-accent' : ''}`} />
                    {isBookmarked ? 'Saved' : 'Save'}
                  </Button>
                )}

                <a href={directionsUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="gap-2">
                    <Navigation className="h-4 w-4" />
                    Directions
                  </Button>
                </a>

                <Button variant="outline" onClick={handleShare} className="gap-2">
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>

                <Dialog open={isRatingDialogOpen} onOpenChange={setIsRatingDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <PencilLine className="h-4 w-4" />
                      Write a review
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Leave a Rating</DialogTitle></DialogHeader>
                    <ReviewForm businessId={placeId} onSuccess={handleReviewSuccess} />
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* ── Check-in strip ─────────────────────────────────────────────── */}
            <div className="flex items-center gap-3 mb-6 py-3 px-4 rounded-xl border border-border bg-card">
              <Users className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm text-muted-foreground flex-1">
                {checkinCount > 0
                  ? <><span className="font-semibold text-foreground">{checkinCount.toLocaleString()}</span> {checkinCount === 1 ? 'person has' : 'people have'} visited this place</>
                  : 'Be the first to check in here!'
                }
                {hasCheckedIn && <span className="ml-2 text-green-500 font-medium">· You've been here ✓</span>}
              </span>
              <button
                onClick={handleCheckin}
                disabled={hasCheckedIn}
                className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-all ${
                  hasCheckedIn
                    ? 'bg-green-500/10 text-green-500 cursor-default'
                    : 'bg-accent text-accent-foreground hover:bg-accent/90'
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {hasCheckedIn ? "Checked in" : "Check in"}
              </button>
            </div>

            {/* ── Weather & Air Quality ──────────────────────────────────────── */}
            <div className="mb-6">
              <LocationEnvPanel
                lat={business.geometry.location.lat}
                lng={business.geometry.location.lng}
              />
            </div>

            {/* ── About / AI Summary ─────────────────────────────────────────── */}
            {(business.summary || aiSummary || aiLoading) && (
              <>
                <section className="mb-8">
                  <h2 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                    {business.summary ? `About ${business.name}` : (
                      <>
                        <Sparkles className="h-4 w-4 text-accent" />
                        AI Insights
                      </>
                    )}
                  </h2>
                  {aiLoading && !business.summary ? (
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating insights…
                    </div>
                  ) : (
                    <p className="text-muted-foreground leading-relaxed max-w-3xl">
                      {business.summary?.overview ?? aiSummary}
                    </p>
                  )}
                </section>
                <Separator className="mb-10" />
              </>
            )}

            {/* ── Reviews ───────────────────────────────────────────────────── */}
            <section className="mb-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">Reviews</h2>
                <Dialog open={isRatingDialogOpen} onOpenChange={setIsRatingDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <PencilLine className="h-4 w-4" />
                      Write a review
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Leave a Rating</DialogTitle></DialogHeader>
                    <ReviewForm businessId={placeId} onSuccess={handleReviewSuccess} />
                  </DialogContent>
                </Dialog>
              </div>

              <div className="flex items-center gap-6 p-5 rounded-xl border border-border bg-card mb-8">
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <span className="text-5xl font-bold text-foreground tabular-nums">
                    {rating.toFixed(1)}
                  </span>
                  <StarRating rating={rating} size="sm" />
                  <span className="text-sm font-medium text-muted-foreground mt-0.5">
                    {getRatingLabel(rating)}
                  </span>
                </div>
                <div className="h-12 w-px bg-border" />
                <p className="text-sm text-muted-foreground">
                  Based on{' '}
                  <span className="font-semibold text-foreground">
                    {ratingCount.toLocaleString()}
                  </span>{' '}
                  {ratingCount === 1 ? 'review' : 'reviews'}
                </p>
              </div>

              <CommentSection placeId={placeId} />
            </section>

            <Separator className="mb-10" />

            {/* ── Community Photos ──────────────────────────────────────────── */}
            <section className="mb-10">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-2xl font-bold text-foreground">
                  Traveler Photos
                  {communityPhotos.length > 0 && (
                    <span className="ml-2 text-base font-normal text-muted-foreground">
                      ({communityPhotos.length})
                    </span>
                  )}
                </h2>
                {user && (
                  <div className="relative">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      onChange={handlePhotoUpload}
                      disabled={uploadProgress !== null}
                    />
                    <Button variant="outline" className="gap-2 pointer-events-none">
                      <Camera className="h-4 w-4" />
                      {uploadProgress !== null ? `Uploading ${uploadProgress}%` : 'Add photo'}
                    </Button>
                  </div>
                )}
              </div>

              {communityPhotos.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {communityPhotos.map((photo) => (
                    <a
                      key={photo.id}
                      href={photo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative aspect-square rounded-lg overflow-hidden bg-muted group"
                    >
                      <Image
                        src={photo.url}
                        alt={`Photo by ${photo.author}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                      <div className="absolute bottom-0 left-0 right-0 px-1.5 py-1 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white text-[10px] truncate">{photo.author}</p>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-border rounded-xl bg-muted/30">
                  <Camera className="h-8 w-8 text-muted-foreground/40 mb-2" />
                  <p className="text-sm font-medium text-muted-foreground">No community photos yet</p>
                  {user ? (
                    <p className="text-xs text-muted-foreground mt-1">Be the first to share a photo!</p>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-1">Sign in to upload photos</p>
                  )}
                </div>
              )}
            </section>

            <Separator className="mb-10" />

            {/* ── Location & Hours ──────────────────────────────────────────── */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-6">The area</h2>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.formatted_address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-foreground hover:underline"
                      >
                        {business.formatted_address}
                      </a>
                      {distance !== null && (
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {distance.toFixed(1)} miles away
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-wrap text-sm">
                    {business.website && (
                      <a href={business.website} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-accent hover:underline font-medium">
                        <Globe className="h-3.5 w-3.5" />
                        Visit website
                        <ExternalLink className="h-3 w-3 opacity-60" />
                      </a>
                    )}
                    {business.formatted_phone_number && (
                      <a href={`tel:${business.formatted_phone_number}`}
                        className="flex items-center gap-1.5 text-accent hover:underline font-medium">
                        <Phone className="h-3.5 w-3.5" />
                        {business.formatted_phone_number}
                      </a>
                    )}
                  </div>

                  <div className="aspect-video rounded-xl overflow-hidden border border-border mt-2">
                    <BusinessMap
                      lat={business.geometry.location.lat}
                      lng={business.geometry.location.lng}
                      className="w-full h-full"
                    />
                  </div>
                </div>

                <div className="lg:col-span-1">
                  {business.opening_hours?.weekday_text && (
                    <div className="rounded-xl border border-border bg-card p-5">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">
                        Hours
                      </h3>
                      <ul className="space-y-2.5">
                        {business.opening_hours.weekday_text.map((dayStr, i) => {
                          const [day, hours] = dayStr.split(': ');
                          const dayOfWeekIdx = (i + 1) % 7;
                          const isToday = dayOfWeekIdx === todayIdx;
                          return (
                            <li key={i} className={`flex justify-between text-sm gap-4 ${isToday ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                              <span className={isToday ? 'text-accent' : ''}>{day}</span>
                              <span className="text-right">{hours ?? '—'}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </section>

          </Container>

          {/* ── Photo Lightbox ─────────────────────────────────────────────── */}
          {business.photos?.length > 0 && (
            <PhotoLightbox
              photos={business.photos}
              startIndex={lightboxIndex}
              open={lightboxOpen}
              onClose={() => setLightboxOpen(false)}
              apiKey={apiKey}
              businessName={business.name}
            />
          )}
        </>
      )}
    </main>
  );
}
