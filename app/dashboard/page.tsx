'use client';

import { useState, useEffect, useMemo } from 'react';
import { Header } from '@/components/header';
import { Container } from '@/components/ui/container';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/firebase';
import {
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
} from 'firebase/firestore';
import { BusinessCard } from '@/components/business-card';
import { BusinessCardSkeleton } from '@/components/business-card-skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import {
  Bookmark,
  MessageSquare,
  Star,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Camera,
  Award,
  Activity,
  Hash,
  ChevronRight,
  Heart,
  Tag,
} from 'lucide-react';
import { DEALS_BY_ID, type Deal } from '@/lib/deals-data';

interface UserActivity {
  checkinCount: number;
  ratingCount: number;
  checkedInPlaces: string[];
  ratedPlaces: string[];
  placeTypes: Record<string, number>;
}

interface BookmarkedBusiness {
  place_id: string;
  name: string;
  formatted_address: string;
  rating?: number;
  user_ratings_total?: number;
  opening_hours?: { open_now: boolean };
  photos?: { photo_reference: string }[];
  price_level?: number;
  types: string[];
  geometry: { location: { lat: number; lng: number } };
}

const SKIP_TYPES = new Set([
  'point_of_interest', 'establishment', 'food', 'premise', 'political',
  'locality', 'sublocality', 'route', 'country',
  'administrative_area_level_1', 'administrative_area_level_2',
]);

const TYPE_LABELS: Record<string, string> = {
  restaurant: 'Restaurant', cafe: 'Café', bar: 'Bar', bakery: 'Bakery',
  store: 'Store', shopping_mall: 'Mall', supermarket: 'Supermarket',
  bank: 'Bank', gym: 'Gym', pharmacy: 'Pharmacy', hospital: 'Hospital',
  movie_theater: 'Cinema', park: 'Park', entertainment: 'Entertainment',
  lodging: 'Hotel', spa: 'Spa', beauty_salon: 'Salon', night_club: 'Night Club',
  amusement_park: 'Amusement Park', tourist_attraction: 'Attraction', museum: 'Museum',
};

function formatType(t: string) {
  return TYPE_LABELS[t] ?? t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

const STAT_COLORS = [
  'from-violet-500/20 to-violet-500/5 border-violet-500/30 text-violet-400',
  'from-blue-500/20 to-blue-500/5 border-blue-500/30 text-blue-400',
  'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30 text-emerald-400',
  'from-amber-500/20 to-amber-500/5 border-amber-500/30 text-amber-400',
  'from-rose-500/20 to-rose-500/5 border-rose-500/30 text-rose-400',
  'from-cyan-500/20 to-cyan-500/5 border-cyan-500/30 text-cyan-400',
];

function StatCard({
  icon: Icon,
  label,
  value,
  colorClass,
  sublabel,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  colorClass: string;
  sublabel?: string;
}) {
  return (
    <div className={`rounded-xl border bg-gradient-to-br p-5 ${colorClass}`}>
      <div className="flex items-start justify-between mb-3">
        <Icon className="h-5 w-5 shrink-0" />
      </div>
      <p className="text-3xl font-bold text-foreground tabular-nums">{value}</p>
      <p className="text-sm font-medium text-foreground mt-1">{label}</p>
      {sublabel && <p className="text-xs text-muted-foreground mt-0.5">{sublabel}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();

  const [activity, setActivity] = useState<UserActivity | null>(null);
  const [commentCount, setCommentCount] = useState(0);
  const [photoCount, setPhotoCount] = useState(0);
  const [bookmarkedBusinesses, setBookmarkedBusinesses] = useState<BookmarkedBusiness[]>([]);
  const [bookmarkIds, setBookmarkIds] = useState<string[]>([]);
  const [savedDeals, setSavedDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookmarksLoading, setBookmarksLoading] = useState(false);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    const load = async () => {
      setLoading(true);
      try {
        const [actSnap, bookmarkSnap, savedDealsSnap] = await Promise.all([
          getDoc(doc(db, 'userActivity', user.uid)),
          getDoc(doc(db, 'bookmarks', user.uid)),
          getDoc(doc(db, 'savedDeals', user.uid)),
        ]);

        if (actSnap.exists()) setActivity(actSnap.data() as UserActivity);

        const ids: string[] = bookmarkSnap.exists() ? (bookmarkSnap.data().placeIds ?? []) : [];
        setBookmarkIds(ids);

        const dealIds: string[] = savedDealsSnap.exists() ? (savedDealsSnap.data().dealIds ?? []) : [];
        setSavedDeals(dealIds.map((id) => DEALS_BY_ID[id]).filter(Boolean) as Deal[]);

        const [commentsSnap, photosSnap] = await Promise.all([
          getDocs(query(collection(db, 'comments'), where('authorId', '==', user.uid))),
          getDocs(query(collection(db, 'communityPhotos'), where('authorId', '==', user.uid))),
        ]);
        setCommentCount(commentsSnap.size);
        setPhotoCount(photosSnap.size);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  // Load bookmark details separately
  useEffect(() => {
    if (bookmarkIds.length === 0) return;
    setBookmarksLoading(true);

    const fetchAll = async () => {
      try {
        const results = await Promise.all(
          bookmarkIds.map(async (id) => {
            const res = await fetch(`/api/places/details?placeId=${id}`);
            const data = await res.json();
            return data.result ?? null;
          })
        );
        setBookmarkedBusinesses(results.filter(Boolean) as BookmarkedBusiness[]);
      } catch (e) {
        console.error(e);
      } finally {
        setBookmarksLoading(false);
      }
    };

    fetchAll();
  }, [bookmarkIds]);

  const topTypes = useMemo(() => {
    if (!activity?.placeTypes) return [];
    return Object.entries(activity.placeTypes)
      .filter(([t]) => !SKIP_TYPES.has(t))
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8);
  }, [activity]);

  const totalPlacesVisited = activity?.checkedInPlaces?.length ?? 0;
  const checkinCount = activity?.checkinCount ?? 0;
  const ratingCount = activity?.ratingCount ?? 0;

  // Level/badge based on activity
  const totalActions = commentCount + checkinCount + ratingCount + photoCount + bookmarkIds.length;
  const level = totalActions === 0 ? 'Newcomer' :
    totalActions < 5 ? 'Explorer' :
    totalActions < 15 ? 'Regular' :
    totalActions < 30 ? 'Enthusiast' :
    totalActions < 60 ? 'Connoisseur' : 'Legend';

  const levelColor = {
    Newcomer: 'text-muted-foreground',
    Explorer: 'text-blue-400',
    Regular: 'text-emerald-400',
    Enthusiast: 'text-amber-400',
    Connoisseur: 'text-violet-400',
    Legend: 'text-rose-400',
  }[level];

  if (!user && !loading) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <Container className="max-w-4xl pt-32 pb-16 text-center">
          <div className="p-5 rounded-full bg-muted w-fit mx-auto mb-4">
            <Activity className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-bold mb-3">Your Dashboard</h1>
          <p className="text-muted-foreground mb-6">Sign in to view your activity, bookmarks, and stats.</p>
          <Link href="/login" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-opacity">
            Sign In
          </Link>
        </Container>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <Container className="max-w-6xl pt-28 pb-16">

        {/* Profile banner */}
        <div className="flex items-center gap-5 mb-10 p-6 rounded-2xl border border-border bg-card">
          <Avatar className="h-16 w-16 shrink-0">
            <AvatarImage src={user?.photoURL || ''} />
            <AvatarFallback className="text-xl font-bold">
              {user?.email?.[0]?.toUpperCase() ?? 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-foreground truncate">
              {user?.displayName || user?.email?.split('@')[0] || 'Explorer'}
            </h1>
            <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className={`flex items-center gap-1.5 text-sm font-bold ${levelColor}`}>
              <Award className="h-4 w-4" />
              {level}
            </span>
            <p className="text-xs text-muted-foreground">{totalActions} total actions</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Stats grid */}
            <section className="mb-10">
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5" />
                Your Activity
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <StatCard
                  icon={CheckCircle2}
                  label="Check-ins"
                  value={checkinCount}
                  sublabel={`${totalPlacesVisited} unique places`}
                  colorClass={STAT_COLORS[0]}
                />
                <StatCard
                  icon={Star}
                  label="Ratings Given"
                  value={ratingCount}
                  sublabel="Reviews submitted"
                  colorClass={STAT_COLORS[1]}
                />
                <StatCard
                  icon={MessageSquare}
                  label="Comments"
                  value={commentCount}
                  sublabel="Posted to businesses"
                  colorClass={STAT_COLORS[2]}
                />
                <StatCard
                  icon={Bookmark}
                  label="Saved Places"
                  value={bookmarkIds.length}
                  sublabel="In your collection"
                  colorClass={STAT_COLORS[3]}
                />
                <StatCard
                  icon={Camera}
                  label="Photos Shared"
                  value={photoCount}
                  sublabel="Community uploads"
                  colorClass={STAT_COLORS[4]}
                />
                <StatCard
                  icon={MapPin}
                  label="Places Visited"
                  value={totalPlacesVisited}
                  sublabel="Unique check-ins"
                  colorClass={STAT_COLORS[5]}
                />
              </div>
            </section>

            {/* Place type breakdown */}
            {topTypes.length > 0 && (
              <section className="mb-10">
                <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                  <Hash className="h-3.5 w-3.5" />
                  Your Venue Breakdown
                </h2>
                <div className="rounded-xl border border-border bg-card p-5">
                  <div className="space-y-3">
                    {topTypes.map(([type, count], idx) => {
                      const max = topTypes[0][1];
                      const pct = Math.round((count / max) * 100);
                      return (
                        <div key={type} className="flex items-center gap-3">
                          <span className="text-xs font-medium text-muted-foreground w-5 text-right shrink-0">
                            {idx + 1}
                          </span>
                          <span className="text-sm font-medium text-foreground w-28 shrink-0 truncate">
                            {formatType(type)}
                          </span>
                          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-accent transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-foreground w-6 text-right shrink-0">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}

            {/* Progress to next level */}
            <section className="mb-10">
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                <Award className="h-3.5 w-3.5" />
                Explorer Progress
              </h2>
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { label: 'First Check-in', done: checkinCount >= 1, target: 'Check in to any place' },
                    { label: 'Regular Visitor', done: checkinCount >= 5, target: '5 check-ins' },
                    { label: 'Social Butterfly', done: commentCount >= 3, target: '3 comments' },
                    { label: 'Critic', done: ratingCount >= 5, target: 'Rate 5 places' },
                    { label: 'Curator', done: bookmarkIds.length >= 10, target: 'Save 10 places' },
                    { label: 'Photographer', done: photoCount >= 1, target: 'Upload 1 photo' },
                  ].map(({ label, done, target }) => (
                    <div key={label} className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                      done ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-border bg-muted/30'
                    }`}>
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                        done ? 'bg-emerald-500/20' : 'bg-muted'
                      }`}>
                        {done
                          ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          : <div className="h-3 w-3 rounded-full border-2 border-muted-foreground/30" />
                        }
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm font-semibold truncate ${done ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {label}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{target}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        {/* Bookmarks section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Bookmark className="h-3.5 w-3.5" />
              Saved Places
              {bookmarkIds.length > 0 && (
                <span className="ml-1 text-foreground">{bookmarkIds.length}</span>
              )}
            </h2>
            <Link
              href="/browse"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Explore more
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {bookmarksLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(3)].map((_, i) => <BusinessCardSkeleton key={i} />)}
            </div>
          )}

          {!bookmarksLoading && bookmarkedBusinesses.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {bookmarkedBusinesses.map((b, i) => (
                <BusinessCard
                  key={b.place_id ?? i}
                  placeId={b.place_id}
                  name={b.name}
                  address={b.formatted_address}
                  rating={b.rating}
                  ratingCount={b.user_ratings_total}
                  isOpen={b.opening_hours?.open_now}
                  photoUrl={
                    b.photos?.[0]?.photo_reference
                      ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${b.photos[0].photo_reference}&key=${apiKey}`
                      : null
                  }
                  priceLevel={b.price_level}
                  types={b.types}
                  lat={b.geometry.location.lat}
                  lng={b.geometry.location.lng}
                />
              ))}
            </div>
          )}

          {!bookmarksLoading && !loading && bookmarkedBusinesses.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border rounded-xl">
              <div className="p-4 rounded-full bg-muted mb-3">
                <Bookmark className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="font-semibold text-foreground mb-1">No saved places yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Start exploring and tap Save on any business.
              </p>
              <Link
                href="/browse"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Browse Places
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </section>

        {/* Saved Deals section */}
        {!loading && (
          <section className="mt-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Heart className="h-3.5 w-3.5" />
                Saved Deals
                {savedDeals.length > 0 && (
                  <span className="ml-1 text-foreground">{savedDeals.length}</span>
                )}
              </h2>
              <Link
                href="/deals"
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Browse deals
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {savedDeals.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {savedDeals.map((deal) => {
                  const pct = Math.round((1 - deal.salePrice / deal.originalPrice) * 100);
                  const fmt = (p: number) => p % 1 === 0 ? `$${p}` : `$${p.toFixed(2)}`;
                  return (
                    <div key={deal.id} className="bg-card rounded-2xl overflow-hidden border border-border flex flex-col hover:shadow-md transition-shadow">
                      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                        <img src={deal.imageUrl} alt={deal.title} className="w-full h-full object-cover" />
                        {deal.isPopularGift && (
                          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white text-gray-800 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
                            🎁 Popular Gift
                          </div>
                        )}
                        <div className="absolute top-3 right-3 h-7 w-7 flex items-center justify-center rounded-full bg-red-500 shadow-sm">
                          <Heart className="h-3.5 w-3.5 fill-white text-white" />
                        </div>
                      </div>
                      <div className="p-3 flex flex-col gap-1.5 flex-1">
                        <p className="text-xs text-muted-foreground font-medium">{deal.business}</p>
                        <p className="text-sm font-bold text-foreground leading-snug line-clamp-2">{deal.title}</p>
                        <div className="mt-auto pt-1 flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-muted-foreground line-through">{fmt(deal.originalPrice)}</span>
                          <span className="text-sm font-bold text-foreground">{fmt(deal.salePrice)}</span>
                          <span className="text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">-{pct}%</span>
                        </div>
                        {deal.promoPrice && deal.promoCode && (
                          <div className="flex items-center gap-1 text-xs text-purple-500 font-semibold">
                            <Tag className="h-3 w-3" />
                            {fmt(deal.promoPrice)} with code <span className="uppercase">{deal.promoCode}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border rounded-xl">
                <div className="p-4 rounded-full bg-muted mb-3">
                  <Heart className="h-7 w-7 text-muted-foreground" />
                </div>
                <p className="font-semibold text-foreground mb-1">No saved deals yet</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Heart any deal to save it here for easy access.
                </p>
                <Link
                  href="/deals"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  Browse Deals
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </section>
        )}

      </Container>
    </main>
  );
}
