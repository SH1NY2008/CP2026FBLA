'use client';

/**
 * Curated + mock deals grid; signed-in users can heart deals into Firestore for the dashboard.
 * Categories are client-side filters only — the dataset is small enough not to need server paging.
 */
import { useState, useMemo, useEffect, useCallback } from 'react';
import { Header } from '@/components/header';
import { Container } from '@/components/ui/container';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/firebase';
import { getDoc, setDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { userDataDoc } from '@/lib/firestore/schema';
import { Heart, MapPin, Search, Star, Tag, SlidersHorizontal, LogIn, X } from 'lucide-react';
import { MOCK_DEALS, type Deal } from '@/lib/deals-data';
import Link from 'next/link';

const CATEGORIES = ['All', 'Entertainment', 'Food & Drink', 'Shopping', 'Health & Beauty', 'Auto'];

function formatPrice(price: number) {
  return price % 1 === 0 ? `$${price}` : `$${price.toFixed(2)}`;
}

function discount(original: number, sale: number) {
  return Math.round((1 - sale / original) * 100);
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = rating >= star;
        const half = !filled && rating >= star - 0.5;
        return (
          <Star
            key={star}
            className={`h-3.5 w-3.5 ${filled || half ? 'text-orange-400 fill-orange-400' : 'text-gray-300'}`}
          />
        );
      })}
    </div>
  );
}

function GuestNudge({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-card border border-border shadow-xl rounded-2xl px-5 py-3.5 animate-in slide-in-from-bottom-4 duration-300">
      <LogIn className="h-4 w-4 text-muted-foreground shrink-0" />
      <p className="text-sm text-foreground">
        <Link href="/login" className="font-semibold underline underline-offset-2 hover:text-accent transition-colors">
          Sign in
        </Link>{' '}
        to save deals to your dashboard
      </p>
      <button
        onClick={onDismiss}
        className="ml-1 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function DealCard({
  deal,
  saved,
  onToggleSave,
}: {
  deal: Deal;
  saved: boolean;
  onToggleSave: (id: string) => void;
}) {
  const pct = discount(deal.originalPrice, deal.salePrice);

  return (
    <div className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-border/80 hover:shadow-lg transition-all duration-200 flex flex-col">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={deal.imageUrl}
          alt={deal.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {deal.isPopularGift && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white text-gray-800 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
            🎁 Popular Gift
          </div>
        )}
        <button
          onClick={() => onToggleSave(deal.id)}
          className={`absolute top-3 right-3 h-8 w-8 flex items-center justify-center rounded-full shadow-sm transition-all duration-200 ${
            saved
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-white/90 backdrop-blur-sm hover:bg-white'
          }`}
          aria-label={saved ? 'Remove from saved' : 'Save deal'}
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              saved ? 'fill-white text-white' : 'text-gray-500'
            }`}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="text-xs text-muted-foreground font-medium">
          {deal.business}
          {deal.locations && <span className="text-muted-foreground/70"> ({deal.locations})</span>}
        </div>

        <h3 className="text-sm font-bold text-foreground leading-snug line-clamp-2 flex-1">
          {deal.title}
        </h3>

        {(deal.address || deal.distance) && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {deal.address && <span className="truncate">{deal.address}</span>}
            {deal.distance && (
              <span className="flex items-center gap-0.5 shrink-0 ml-auto">
                <MapPin className="h-3 w-3" />
                {deal.distance}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <StarRating rating={deal.rating} />
          <span className="text-xs font-semibold text-foreground">{deal.rating}</span>
          <span className="text-xs text-muted-foreground">({deal.reviewCount.toLocaleString()})</span>
        </div>

        <div className="mt-auto pt-1 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground line-through">{formatPrice(deal.originalPrice)}</span>
            <span className="text-sm font-bold text-foreground">{formatPrice(deal.salePrice)}</span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
              -{pct}%
            </span>
          </div>
          {deal.promoPrice && deal.promoCode && (
            <div className="flex items-center gap-1.5 text-xs text-purple-500 font-semibold">
              <Tag className="h-3 w-3" />
              {formatPrice(deal.promoPrice)} with code <span className="uppercase">{deal.promoCode}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DealsPage() {
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'discount' | 'rating' | 'price'>('discount');
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [showGuestNudge, setShowGuestNudge] = useState(false);

  // Load saved deal IDs from Firestore when user signs in
  useEffect(() => {
    if (!user) { setSavedIds(new Set()); return; }
    getDoc(userDataDoc(db, 'savedDeals', user.uid)).then((snap) => {
      if (snap.exists()) {
        setSavedIds(new Set(snap.data().dealIds ?? []));
      }
    }).catch(console.error);
  }, [user]);

  // Auto-dismiss guest nudge after 4 seconds
  useEffect(() => {
    if (!showGuestNudge) return;
    const t = setTimeout(() => setShowGuestNudge(false), 4000);
    return () => clearTimeout(t);
  }, [showGuestNudge]);

  const handleToggleSave = useCallback(async (dealId: string) => {
    if (!user) {
      setShowGuestNudge(true);
      return;
    }

    const ref = userDataDoc(db, 'savedDeals', user.uid);
    const alreadySaved = savedIds.has(dealId);

    // Optimistic update
    setSavedIds((prev) => {
      const next = new Set(prev);
      alreadySaved ? next.delete(dealId) : next.add(dealId);
      return next;
    });

    try {
      await setDoc(ref, {
        dealIds: alreadySaved ? arrayRemove(dealId) : arrayUnion(dealId),
      }, { merge: true });
    } catch (err) {
      console.error('Failed to update saved deals:', err);
      // Revert optimistic update on error
      setSavedIds((prev) => {
        const next = new Set(prev);
        alreadySaved ? next.add(dealId) : next.delete(dealId);
        return next;
      });
    }
  }, [user, savedIds]);

  const displayed = useMemo(() => {
    let result = [...MOCK_DEALS];

    if (selectedCategory !== 'All') {
      result = result.filter((d) => d.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.business.toLowerCase().includes(q) ||
          d.category.toLowerCase().includes(q)
      );
    }

    switch (sortBy) {
      case 'discount':
        result.sort((a, b) => discount(b.originalPrice, b.salePrice) - discount(a.originalPrice, a.salePrice));
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'price':
        result.sort((a, b) => a.salePrice - b.salePrice);
        break;
    }

    return result;
  }, [searchQuery, selectedCategory, sortBy]);

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <Container className="max-w-7xl pt-28 pb-16">

        {/* Page header */}
        <div className="pt-6 mb-10 border-b border-border/50 pb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Handpicked savings
          </p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-[1] mb-2">
                Exclusive{' '}
                <span className="text-muted-foreground">Deals</span>
              </h1>
              <p className="text-muted-foreground text-sm">
                Handpicked savings from top local and national businesses
              </p>
            </div>
          </div>
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap gap-2 mb-6" data-tour="deals-categories">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
                selectedCategory === cat
                  ? 'bg-foreground text-background border-foreground'
                  : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground hover:bg-secondary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8" data-tour="deals-toolbar">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search deals…"
              className="w-full pl-9 pr-4 h-10 text-sm rounded-full border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-border/80 transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="h-10 text-sm px-4 rounded-full border border-border bg-background text-foreground cursor-pointer focus:outline-none hover:bg-secondary transition-colors"
            >
              <option value="discount">Best discount</option>
              <option value="rating">Top rated</option>
              <option value="price">Price: low → high</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        {displayed.length > 0 && (
          <p className="text-xs text-muted-foreground mb-5">
            Showing <span className="font-semibold text-foreground">{displayed.length}</span> deal{displayed.length !== 1 ? 's' : ''}
            {user && savedIds.size > 0 && (
              <> · <Link href="/dashboard" className="text-accent hover:underline font-semibold">{savedIds.size} saved</Link></>
            )}
          </p>
        )}

        {/* Grid */}
        {displayed.length > 0 ? (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            data-tour="deals-grid"
          >
            {displayed.map((deal) => (
              <DealCard
                key={deal.id}
                deal={deal}
                saved={savedIds.has(deal.id)}
                onToggleSave={handleToggleSave}
              />
            ))}
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center py-24 text-center gap-3"
            data-tour="deals-grid"
          >
            <p className="font-semibold text-foreground">No deals found</p>
            <p className="text-sm text-muted-foreground">Try a different search or category.</p>
          </div>
        )}

      </Container>

      {/* Guest nudge toast */}
      {showGuestNudge && <GuestNudge onDismiss={() => setShowGuestNudge(false)} />}
    </main>
  );
}
