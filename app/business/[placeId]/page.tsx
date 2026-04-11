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
  ShieldCheck,
  Megaphone,
  CalendarDays,
  Tag,
  Utensils,
  DollarSign,
  Mail,
  Send,
  ChevronRight,
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
import { COLLECTIONS, placeDataDoc, userDataDoc } from '@/lib/firestore/schema';

// Writes activity to userActivity/{uid} so the dashboard can read metrics
async function trackUserCheckin(uid: string, placeId: string, types: string[]) {
  const ref = userDataDoc(db, 'userActivity', uid);
  const snap = await getDoc(ref);
  const typeMap: Record<string, number> = {};
  types.forEach(t => { typeMap[t] = increment(1) as unknown as number; });

  if (snap.exists()) {
    await updateDoc(ref, {
      checkinCount: increment(1),
      checkedInPlaces: arrayUnion(placeId),
      ...Object.fromEntries(
        types.map(t => [`placeTypes.${t}`, increment(1)])
      ),
    });
  } else {
    const initialTypes: Record<string, number> = {};
    types.forEach(t => { initialTypes[t] = 1; });
    await setDoc(ref, {
      checkinCount: 1,
      checkedInPlaces: [placeId],
      ratingCount: 0,
      placeTypes: initialTypes,
    });
  }
}

async function trackUserRating(uid: string, placeId: string, types: string[]) {
  const ref = userDataDoc(db, 'userActivity', uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    await updateDoc(ref, {
      ratingCount: increment(1),
      ratedPlaces: arrayUnion(placeId),
    });
  } else {
    const initialTypes: Record<string, number> = {};
    types.forEach(t => { initialTypes[t] = 1; });
    await setDoc(ref, {
      checkinCount: 0,
      checkedInPlaces: [],
      ratingCount: 1,
      ratedPlaces: [placeId],
      placeTypes: initialTypes,
    });
  }
}
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
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { SolarPanel } from '@/components/solar-panel';
import { StreetView } from '@/components/street-view';
import { AreaInsights } from '@/components/area-insights';
import { TravelInfo } from '@/components/travel-info';
import {
  getClaimedBusiness,
  getAnnouncementsForBusiness,
  getEventsForBusiness,
  getDealsForBusiness,
  getOwnerRepliesForPlace,
  sendInquiry,
  rsvpToEvent,
  type ClaimedBusiness,
  type BusinessAnnouncement,
  type BusinessEvent,
  type BusinessDeal,
  type OwnerReply,
} from '@/lib/business-portal';

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

  // Business portal data
  const [claimData, setClaimData] = useState<ClaimedBusiness | null>(null);
  const [announcements, setAnnouncements] = useState<BusinessAnnouncement[]>([]);
  const [events, setEvents] = useState<BusinessEvent[]>([]);
  const [ownerDeals, setOwnerDeals] = useState<BusinessDeal[]>([]);
  const [ownerReplies, setOwnerReplies] = useState<Record<string, OwnerReply>>({});
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [inquirySubject, setInquirySubject] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquirySending, setInquirySending] = useState(false);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
  const todayIdx = new Date().getDay();

  // ── Effects ──────────────────────────────────────────────────────────────

  useEffect(() => {
    if (user && placeId) {
      getDoc(userDataDoc(db, 'bookmarks', user.uid)).then((snap) => {
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
        const ratingSnap = await getDoc(placeDataDoc(db, 'businessRatings', placeId));
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
    getDoc(placeDataDoc(db, 'checkins', placeId)).then((snap) => {
      if (snap.exists()) {
        setCheckinCount(snap.data().count ?? 0);
        if (user) setHasCheckedIn(snap.data().userIds?.includes(user.uid) ?? false);
      }
    });
  }, [placeId, user]);

  // Community photos — real-time
  useEffect(() => {
    if (!placeId) return;
    const q = query(collection(db, COLLECTIONS.communityPhotos), where('placeId', '==', placeId));
    const unsub = onSnapshot(q, (snap) => {
      const photos: CommunityPhoto[] = [];
      snap.forEach((d) => photos.push({ id: d.id, ...d.data() } as CommunityPhoto));
      photos.sort((a, b) => (a as any).timestamp?.seconds - (b as any).timestamp?.seconds);
      setCommunityPhotos(photos);
    });
    return () => unsub();
  }, [placeId]);

  // Load business portal data (claimed profile, announcements, events, deals, owner replies)
  useEffect(() => {
    if (!placeId) return;
    const loadPortal = async () => {
      try {
        const claimed = await getClaimedBusiness(placeId);
        setClaimData(claimed);
        if (claimed) {
          const [anns, evts, deals, replies] = await Promise.all([
            getAnnouncementsForBusiness(placeId),
            getEventsForBusiness(placeId),
            getDealsForBusiness(placeId),
            getOwnerRepliesForPlace(placeId),
          ]);
          setAnnouncements(anns);
          setEvents(evts.filter((e) => new Date(e.date + 'T23:59:59') >= new Date()));
          setOwnerDeals(deals.filter((d) => d.active));
          const rMap: Record<string, OwnerReply> = {};
          replies.forEach((r) => { rMap[r.commentId] = r; });
          setOwnerReplies(rMap);
        }
      } catch { /* non-critical */ }
    };
    loadPortal();
  }, [placeId]);

  const handleSendInquiry = async () => {
    if (!user) { toast.error('Sign in to send a message'); return; }
    if (!inquirySubject.trim() || !inquiryMessage.trim()) { toast.error('Fill in all fields'); return; }
    setInquirySending(true);
    try {
      await sendInquiry({
        placeId,
        userId: user.uid,
        userName: user.displayName ?? 'Anonymous',
        userEmail: user.email ?? '',
        subject: inquirySubject.trim(),
        message: inquiryMessage.trim(),
      });
      toast.success('Message sent to the business!');
      setInquirySubject('');
      setInquiryMessage('');
      setInquiryOpen(false);
    } catch { toast.error('Failed to send'); }
    finally { setInquirySending(false); }
  };

  const handleRsvp = async (eventId: string) => {
    if (!user) { toast.error('Sign in to RSVP'); return; }
    try {
      await rsvpToEvent(eventId, user.uid);
      const updated = await getEventsForBusiness(placeId);
      setEvents(updated.filter((e) => new Date(e.date + 'T23:59:59') >= new Date()));
      toast.success('RSVP confirmed!');
    } catch { toast.error('Failed to RSVP'); }
  };

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleBookmark = async () => {
    if (!user) return;
    const ref = userDataDoc(db, 'bookmarks', user.uid);
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
      await setDoc(placeDataDoc(db, 'businessRatings', placeId), { rating: avg, ratingCount: cnt + 1 });
    } catch (e) { console.error(e); }
    setDisplayRating(avg);
    setDisplayRatingCount(cnt + 1);
    setIsRatingDialogOpen(false);
    toast.success('Rating submitted!');
    if (user) {
      try { await trackUserRating(user.uid, placeId, business?.types ?? []); } catch {}
    }
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
    const ref = placeDataDoc(db, 'checkins', placeId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      await updateDoc(ref, { count: increment(1), userIds: arrayUnion(user.uid) });
    } else {
      await setDoc(ref, { count: 1, userIds: [user.uid] });
    }
    setCheckinCount((c) => c + 1);
    setHasCheckedIn(true);
    toast.success("Checked in! You've been here.");
    try { await trackUserCheckin(user.uid, placeId, business?.types ?? []); } catch {}
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
        await addDoc(collection(db, COLLECTIONS.communityPhotos), {
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

  // Shared review dialog (single instance, shared via open/onOpenChange)
  const ReviewDialog = ({ trigger }: { trigger: React.ReactNode }) => (
    <Dialog open={isRatingDialogOpen} onOpenChange={setIsRatingDialogOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Leave a Rating</DialogTitle></DialogHeader>
        <ReviewForm businessId={placeId} onSuccess={handleReviewSuccess} />
      </DialogContent>
    </Dialog>
  );

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
          {/* ── Photo Gallery ─────────────────────────────────────────── */}
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
                    {i === 4 && (
                      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Images className="h-5 w-5 text-white" />
                        <span className="text-white text-xs font-semibold">
                          See all {business.photos.length} photos
                        </span>
                      </div>
                    )}
                    {i !== 4 && (
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                    )}
                  </button>
                ))}
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

            {/* ── Page header: name + rating + chips + actions ──────────── */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8 pb-6 border-b border-border">
              <div className="flex-1 min-w-0">
                <h1 className="text-4xl font-bold text-foreground leading-tight mb-2 flex items-center gap-3">
                  {business.name}
                  {claimData?.verified && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-500 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full shrink-0">
                      <ShieldCheck className="h-3 w-3" />
                      Verified
                    </span>
                  )}
                </h1>

                {/* Clickable rating row */}
                <ReviewDialog trigger={
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
                } />

                {/* Meta chips */}
                <div className="flex items-center gap-2 flex-wrap">
                  {displayTypes(business.types).map((t) => (
                    <span key={t} className="text-xs font-medium px-2.5 py-1 rounded-full border border-border bg-muted text-muted-foreground">
                      {t}
                    </span>
                  ))}
                  {business.price_level > 0 && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-default text-xs font-medium px-2.5 py-1 rounded-full border border-border bg-muted text-muted-foreground">
                          {PRICE_DISPLAY[business.price_level]}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">{PRICE_TOOLTIP[business.price_level]}</TooltipContent>
                    </Tooltip>
                  )}
                  {business.opening_hours && (
                    <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                      business.opening_hours.open_now
                        ? 'bg-green-500/10 border border-green-500/30 text-green-500'
                        : 'bg-red-500/10 border border-red-500/30 text-red-400'
                    }`}>
                      <Clock className="h-3 w-3 shrink-0" />
                      {getOpenUntilText(business.opening_hours)}
                    </span>
                  )}
                </div>

                {/* Travel time from Routes API */}
                <TravelInfo
                  destLat={business.geometry.location.lat}
                  destLng={business.geometry.location.lng}
                />
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 flex-wrap shrink-0">
                {user && (
                  <Button variant="outline" onClick={handleBookmark}
                    className={`gap-2 ${isBookmarked ? 'border-accent text-accent' : ''}`}>
                    <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-accent' : ''}`} />
                    {isBookmarked ? 'Saved' : 'Save'}
                  </Button>
                )}
                <Button variant="outline" onClick={handleShare} className="gap-2">
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
                <ReviewDialog trigger={
                  <Button className="gap-2">
                    <PencilLine className="h-4 w-4" />
                    Write a review
                  </Button>
                } />
              </div>
            </div>

            {/* ── Two-column body ───────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">

              {/* ── Main column ─────────────────────────────────────────── */}
              <div className="lg:col-span-2 space-y-10">

                {/* About / AI Summary */}
                {(business.summary || aiSummary || aiLoading) && (
                  <section>
                    <h2 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                      {business.summary ? `About ${business.name}` : (
                        <><Sparkles className="h-4 w-4 text-accent" />AI Insights</>
                      )}
                    </h2>
                    {aiLoading && !business.summary ? (
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating insights…
                      </div>
                    ) : (
                      <p className="text-muted-foreground leading-relaxed">
                        {business.summary?.overview ?? aiSummary}
                      </p>
                    )}
                  </section>
                )}

                {/* Owner Bio */}
                {claimData?.bio && (
                  <section>
                    <h2 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-500" />
                      From the Owner
                    </h2>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{claimData.bio}</p>
                  </section>
                )}

                {/* Team Members */}
                {claimData?.teamMembers && claimData.teamMembers.length > 0 && (
                  <section>
                    <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      Meet the Team
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {claimData.teamMembers.map((member) => (
                        <div key={member.id} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card">
                          <div className="h-12 w-12 rounded-full bg-muted overflow-hidden shrink-0">
                            {member.photoUrl ? (
                              <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Users className="h-5 w-5 text-muted-foreground/40" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">{member.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{member.role}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Announcements */}
                {announcements.length > 0 && (
                  <section>
                    <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                      <Megaphone className="h-4 w-4 text-muted-foreground" />
                      Latest Updates
                    </h2>
                    <div className="space-y-3">
                      {announcements.slice(0, 3).map((ann) => (
                        <div key={ann.id} className="p-4 rounded-xl border border-border bg-card">
                          <div className="flex items-center gap-2 mb-1.5">
                            <h4 className="text-sm font-bold text-foreground">{ann.title}</h4>
                            {ann.pinned && (
                              <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">Pinned</span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{ann.content}</p>
                          {ann.createdAt && (
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date((ann.createdAt as any).seconds * 1000).toLocaleDateString('en-US', {
                                month: 'short', day: 'numeric',
                              })}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Owner Deals */}
                {ownerDeals.length > 0 && (
                  <section>
                    <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      Exclusive Deals
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {ownerDeals.map((deal) => {
                        const pct = Math.round((1 - deal.salePrice / deal.originalPrice) * 100);
                        return (
                          <div key={deal.id} className="p-4 rounded-xl border border-border bg-card flex gap-3">
                            <div className="h-16 w-16 rounded-lg bg-muted overflow-hidden shrink-0">
                              <img src={deal.imageUrl} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-foreground truncate">{deal.title}</p>
                              {deal.description && (
                                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{deal.description}</p>
                              )}
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className="text-xs line-through text-muted-foreground">${deal.originalPrice}</span>
                                <span className="text-sm font-bold text-foreground">${deal.salePrice}</span>
                                <span className="text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                  -{pct}%
                                </span>
                              </div>
                              {deal.promoCode && (
                                <p className="text-xs text-purple-400 font-semibold mt-1">
                                  Code: <span className="uppercase">{deal.promoCode}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* Events */}
                {events.length > 0 && (
                  <section>
                    <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />
                      Upcoming Events
                    </h2>
                    <div className="space-y-3">
                      {events.slice(0, 4).map((evt) => {
                        const eventDate = new Date(evt.date + 'T00:00:00');
                        const hasRsvpd = user ? evt.rsvpUserIds?.includes(user.uid) : false;
                        return (
                          <div key={evt.id} className="p-4 rounded-xl border border-border bg-card flex gap-4">
                            <div className="text-center shrink-0 w-12">
                              <p className="text-[10px] font-bold text-muted-foreground uppercase">
                                {eventDate.toLocaleDateString('en-US', { month: 'short' })}
                              </p>
                              <p className="text-2xl font-black text-foreground leading-none">{eventDate.getDate()}</p>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-foreground">{evt.title}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{evt.startTime} – {evt.endTime}</p>
                              {evt.description && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{evt.description}</p>
                              )}
                              <div className="flex items-center gap-3 mt-2">
                                <span className="text-xs text-muted-foreground">
                                  {evt.rsvpCount} {evt.rsvpCount === 1 ? 'RSVP' : 'RSVPs'}
                                </span>
                                {hasRsvpd ? (
                                  <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1">
                                    <CheckCircle2 className="h-3 w-3" /> Going
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => evt.id && handleRsvp(evt.id)}
                                    className="text-xs font-semibold text-foreground hover:text-accent transition-colors"
                                  >
                                    RSVP
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* Menu */}
                {claimData?.menuCategories && claimData.menuCategories.length > 0 && (
                  <section>
                    <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                      <Utensils className="h-4 w-4 text-muted-foreground" />
                      Menu & Services
                    </h2>
                    <div className="space-y-5">
                      {claimData.menuCategories.map((cat) => (
                        <div key={cat.id}>
                          <h3 className="text-sm font-bold text-foreground mb-2 uppercase tracking-wider">{cat.name}</h3>
                          <div className="space-y-1.5">
                            {cat.items.map((item) => (
                              <div key={item.id} className="flex items-start justify-between gap-3 py-2 border-b border-border/50 last:border-0">
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-foreground">{item.name}</p>
                                  {item.description && (
                                    <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                                  )}
                                </div>
                                {item.price > 0 && (
                                  <span className="text-sm font-semibold text-foreground shrink-0">
                                    ${item.price.toFixed(2)}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Reviews */}
                <section>
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-2xl font-bold text-foreground">Reviews</h2>
                    <ReviewDialog trigger={
                      <Button variant="outline" size="sm" className="gap-2">
                        <PencilLine className="h-3.5 w-3.5" />
                        Write a review
                      </Button>
                    } />
                  </div>

                  {/* Rating summary */}
                  <div className="flex items-center gap-6 p-5 rounded-xl border border-border bg-card mb-6">
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <span className="text-5xl font-bold text-foreground tabular-nums">
                        {rating.toFixed(1)}
                      </span>
                      <StarRating rating={rating} size="sm" />
                      <span className="text-xs font-medium text-muted-foreground mt-0.5">
                        {getRatingLabel(rating)}
                      </span>
                    </div>
                    <div className="h-12 w-px bg-border" />
                    <p className="text-sm text-muted-foreground">
                      Based on{' '}
                      <span className="font-semibold text-foreground">{ratingCount.toLocaleString()}</span>
                      {' '}{ratingCount === 1 ? 'review' : 'reviews'}
                    </p>
                  </div>

                  <CommentSection placeId={placeId} />
                </section>

                {/* Traveler Photos */}
                <section>
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
                        <Button variant="outline" size="sm" className="gap-2 pointer-events-none">
                          <Camera className="h-3.5 w-3.5" />
                          {uploadProgress !== null ? `Uploading ${uploadProgress}%` : 'Add photo'}
                        </Button>
                      </div>
                    )}
                  </div>

                  {communityPhotos.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {communityPhotos.map((photo) => (
                        <a key={photo.id} href={photo.url} target="_blank" rel="noopener noreferrer"
                          className="relative aspect-square rounded-lg overflow-hidden bg-muted group">
                          <Image src={photo.url} alt={`Photo by ${photo.author}`} fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                          <div className="absolute bottom-0 left-0 right-0 px-1.5 py-1 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-white text-[10px] truncate">{photo.author}</p>
                          </div>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-border rounded-xl bg-muted/30">
                      <Camera className="h-7 w-7 text-muted-foreground/40 mb-2" />
                      <p className="text-sm font-medium text-muted-foreground">No community photos yet</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {user ? 'Be the first to share a photo!' : 'Sign in to upload photos'}
                      </p>
                    </div>
                  )}
                </section>

                {/* Street View */}
                <section>
                  <h2 className="text-xl font-bold text-foreground mb-4">Street View</h2>
                  <StreetView
                    lat={business.geometry.location.lat}
                    lng={business.geometry.location.lng}
                    className="aspect-[2/1]"
                  />
                </section>

                {/* Map — full width at the bottom of main column */}
                <section>
                  <h2 className="text-2xl font-bold text-foreground mb-5">The area</h2>
                  <div className="flex items-start gap-3 mb-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.formatted_address)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="font-medium text-foreground hover:underline"
                      >
                        {business.formatted_address}
                      </a>
                      {distance !== null && (
                        <p className="text-sm text-muted-foreground mt-0.5">{distance.toFixed(1)} miles away</p>
                      )}
                    </div>
                  </div>
                  <div className="aspect-video rounded-xl overflow-hidden border border-border">
                    <BusinessMap
                      lat={business.geometry.location.lat}
                      lng={business.geometry.location.lng}
                      className="w-full h-full"
                    />
                  </div>
                </section>

              </div>

              {/* ── Sticky sidebar ──────────────────────────────────────── */}
              <aside className="lg:col-span-1 space-y-4 lg:sticky lg:top-28">

                {/* Contact & Directions */}
                <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Contact
                  </h3>
                  {business.formatted_phone_number && (
                    <a href={`tel:${business.formatted_phone_number}`}
                      className="flex items-center gap-2.5 text-sm text-foreground hover:text-accent transition-colors">
                      <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                      {business.formatted_phone_number}
                    </a>
                  )}
                  {business.website && (
                    <a href={business.website} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2.5 text-sm text-foreground hover:text-accent transition-colors">
                      <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="truncate">Visit website</span>
                      <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0 ml-auto" />
                    </a>
                  )}
                  <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="block pt-1">
                    <Button variant="outline" className="w-full gap-2">
                      <Navigation className="h-4 w-4" />
                      Get directions
                    </Button>
                  </a>
                </div>

                {/* Hours */}
                {business.opening_hours?.weekday_text && (
                  <div className="rounded-xl border border-border bg-card p-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                      Hours
                    </h3>
                    <ul className="space-y-2">
                      {business.opening_hours.weekday_text.map((dayStr, i) => {
                        const [day, hours] = dayStr.split(': ');
                        const isToday = ((i + 1) % 7) === todayIdx;
                        return (
                          <li key={i} className={`flex justify-between text-sm gap-2 ${
                            isToday ? 'font-semibold text-foreground' : 'text-muted-foreground'
                          }`}>
                            <span className={isToday ? 'text-accent' : ''}>{day}</span>
                            <span className="text-right shrink-0">{hours ?? '—'}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {/* Check-in */}
                <div className="rounded-xl border border-border bg-card p-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                    Visits
                  </h3>
                  <div className="flex items-center gap-3 mb-3">
                    <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm text-muted-foreground flex-1">
                      {checkinCount > 0 ? (
                        <><span className="font-semibold text-foreground">{checkinCount.toLocaleString()}</span>{' '}
                        {checkinCount === 1 ? 'person' : 'people'} visited</>
                      ) : 'No check-ins yet'}
                    </span>
                  </div>
                  {hasCheckedIn ? (
                    <div className="flex items-center gap-2 text-sm font-medium text-green-500 py-1">
                      <CheckCircle2 className="h-4 w-4" />
                      You've been here
                    </div>
                  ) : (
                    <button onClick={handleCheckin}
                      className="w-full flex items-center justify-center gap-2 text-sm font-medium px-3 py-2 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 transition-colors">
                      <CheckCircle2 className="h-4 w-4" />
                      Check in
                    </button>
                  )}
                </div>

                {/* Owner Hours Override */}
                {claimData?.hoursOverride && claimData.hoursOverride.length > 0 && (
                  <div className="rounded-xl border border-emerald-500/20 bg-card p-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-1.5">
                      <ShieldCheck className="h-3 w-3 text-emerald-500" />
                      Owner Hours
                    </h3>
                    <p className="text-[10px] text-emerald-500/70 mb-3">Updated by owner</p>
                    <ul className="space-y-2">
                      {claimData.hoursOverride.map((h, i) => {
                        const dayIdx = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].indexOf(h.day);
                        const jsDay = dayIdx === 6 ? 0 : dayIdx + 1;
                        const isToday = jsDay === todayIdx;
                        return (
                          <li key={i} className={`flex justify-between text-sm gap-2 ${
                            isToday ? 'font-semibold text-foreground' : 'text-muted-foreground'
                          }`}>
                            <span className={isToday ? 'text-accent' : ''}>{h.day}</span>
                            <span className="text-right shrink-0">
                              {h.closed ? 'Closed' : `${h.open} – ${h.close}`}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {/* Message / Inquiry Button */}
                {claimData && (
                  <div className="rounded-xl border border-border bg-card p-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                      Contact Business
                    </h3>
                    {!inquiryOpen ? (
                      <button
                        onClick={() => setInquiryOpen(true)}
                        className="w-full flex items-center justify-center gap-2 text-sm font-medium px-3 py-2.5 rounded-lg border border-border hover:bg-muted transition-colors"
                      >
                        <Mail className="h-4 w-4" />
                        Send a Message
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <Input
                          value={inquirySubject}
                          onChange={(e) => setInquirySubject(e.target.value)}
                          placeholder="Subject"
                          className="text-sm"
                        />
                        <Textarea
                          value={inquiryMessage}
                          onChange={(e) => setInquiryMessage(e.target.value)}
                          rows={3}
                          placeholder="Your message…"
                          className="resize-none text-sm"
                        />
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex-1"
                            onClick={() => { setInquiryOpen(false); setInquirySubject(''); setInquiryMessage(''); }}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1 gap-1.5"
                            onClick={handleSendInquiry}
                            disabled={inquirySending}
                          >
                            {inquirySending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                            Send
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Neighborhood Insights */}
                <div className="rounded-xl border border-border bg-card p-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                    Neighborhood
                  </h3>
                  <AreaInsights
                    lat={business.geometry.location.lat}
                    lng={business.geometry.location.lng}
                    radius={500}
                  />
                </div>

                {/* Solar Potential */}
                <div className="rounded-xl border border-border bg-card p-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                    Solar Potential
                  </h3>
                  <SolarPanel
                    lat={business.geometry.location.lat}
                    lng={business.geometry.location.lng}
                  />
                </div>

                {/* Weather & Air Quality */}
                <div className="rounded-xl border border-border bg-card p-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                    Conditions
                  </h3>
                  <LocationEnvPanel
                    lat={business.geometry.location.lat}
                    lng={business.geometry.location.lng}
                  />
                </div>

              </aside>
            </div>

          </Container>

          {/* ── Photo Lightbox ─────────────────────────────────────────── */}
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
