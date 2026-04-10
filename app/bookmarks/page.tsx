'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/header';

import { useAuth } from '@/hooks/useAuth';
import { db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { BusinessCard } from '@/components/business-card';
import { BusinessCardSkeleton } from '@/components/business-card-skeleton';
import { Container } from '@/components/ui/container';

export default function BookmarksPage() {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchBookmarks = async () => {
        const bookmarkRef = doc(db, 'bookmarks', user.uid);
        const bookmarkSnap = await getDoc(bookmarkRef);

        if (bookmarkSnap.exists()) {
          const placeIds = bookmarkSnap.data().placeIds;
          if (placeIds && placeIds.length > 0) {
            const businessPromises = placeIds.map(async (placeId: string) => {
              const response = await fetch(`/api/places/details?placeId=${placeId}`);
              const data = await response.json();
              return data.result;
            });
            const settledBusinesses = await Promise.all(businessPromises);
            setBusinesses(settledBusinesses.filter(b => b));
          }
        }
        setLoading(false);
      };

      fetchBookmarks();
    }
  }, [user]);
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <Container className="max-w-4xl pt-32 pb-16">
        <h1 className="text-4xl font-bold text-foreground mb-4">Your Bookmarks</h1>
        <p className="text-muted-foreground mb-8">Save your favorite local businesses and come back to them anytime.</p>
        
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => <BusinessCardSkeleton key={i} />)}
          </div>
        )}

        {!loading && businesses.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {businesses.map((business) => (
              <BusinessCard
                key={business.place_id}
                placeId={business.place_id}
                name={business.name}
                address={business.formatted_address}
                rating={business.rating}
                ratingCount={business.user_ratings_total}
                isOpen={business.opening_hours?.open_now}
                photoUrl={business.photos?.[0]?.photo_reference ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${business.photos[0].photo_reference}&key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}` : null}
                priceLevel={business.price_level}
                types={business.types}
                lat={business.geometry.location.lat}
                lng={business.geometry.location.lng}
              />
            ))}
          </div>
        )}

        {!loading && businesses.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No bookmarks yet. Start exploring businesses to save your favorites!</p>
          </div>
        )}
      </Container>
      
    </main>
  );
}
