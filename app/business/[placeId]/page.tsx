'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Container } from '@/components/ui/container';
import { Header } from '@/components/header';

import { BusinessMap } from '@/components/business-map';
import { BusinessCardSkeleton } from '@/components/business-card-skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Star, Clock, Phone, Globe, MapPin, Bookmark } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/firebase';
import { Button } from '@/components/ui/button';
import { CommentSection } from '@/components/comment-section';
import { ReviewForm } from '@/components/review-form';
import { StarRating } from '@/components/star-rating';

interface Photo {
  photo_reference: string;
  width: number;
  height: number;
}

interface OpeningHours {
  open_now: boolean;
  periods: {
    open: { day: number; time: string };
    close: { day: number; time: string };
  }[];
  weekday_text: string[];
}

interface BusinessDetails {
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating: number;
  user_ratings_total: number;
  photos: Photo[];
  opening_hours: OpeningHours;
  formatted_phone_number: string;
  website: string;
  types: string[];
  price_level: number;
  summary?: { overview: string; language: string; };
}



export default function BusinessDetailsPage() {
  const params = useParams();
  const placeId = params.placeId as string;
  const [business, setBusiness] = useState<BusinessDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const { user } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [displayRating, setDisplayRating] = useState<number | null>(null);
  const [displayRatingCount, setDisplayRatingCount] = useState<number | null>(null);

  useEffect(() => {
    if (user && placeId) {
      const checkBookmark = async () => {
        const bookmarkRef = doc(db, 'bookmarks', user.uid);
        const bookmarkSnap = await getDoc(bookmarkRef);
        if (bookmarkSnap.exists() && bookmarkSnap.data().placeIds.includes(placeId)) {
          setIsBookmarked(true);
        }
      };
      checkBookmark();
    }
  }, [user, placeId]);

  useEffect(() => {
    if (placeId) {
      const fetchBusinessDetails = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await fetch(`/api/places/details?placeId=${placeId}`);
          if (!response.ok) {
            throw new Error('Failed to fetch business details');
          }
          const data = await response.json();
          if (data.status !== 'OK') {
            throw new Error(data.error_message || 'Failed to fetch business details');
          }
          const { editorial_summary: summary, ...rest } = data.result;
          setBusiness({ ...rest, summary });
          setDisplayRating(data.result.rating);
          setDisplayRatingCount(data.result.user_ratings_total);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to fetch business details';
          setError(errorMessage);
        } finally {
          setLoading(false);
        }
      };

      fetchBusinessDetails();
    }
  }, [placeId]);

  useEffect(() => {
    if (business && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          const businessLat = business.geometry.location.lat;
          const businessLng = business.geometry.location.lng;

          const R = 6371; // Radius of the earth in km
          const dLat = (businessLat - userLat) * (Math.PI / 180);
          const dLng = (businessLng - userLng) * (Math.PI / 180);
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(userLat * (Math.PI / 180)) *
              Math.cos(businessLat * (Math.PI / 180)) *
              Math.sin(dLng / 2) *
              Math.sin(dLng / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const d = R * c; // Distance in km
          setDistance(d * 0.621371); // Convert to miles
        },
        (error) => {
          console.error('Error getting user location:', error);
        }
      );
    }
  }, [business]);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

  const handleBookmark = async () => {
    if (!user) {
      // TODO: Maybe show a toast or a modal to prompt user to login
      return;
    }

    const bookmarkRef = doc(db, 'bookmarks', user.uid);
    const bookmarkSnap = await getDoc(bookmarkRef);

    if (bookmarkSnap.exists()) {
      if (isBookmarked) {
        await updateDoc(bookmarkRef, {
          placeIds: arrayRemove(placeId)
        });
      } else {
        await updateDoc(bookmarkRef, {
          placeIds: arrayUnion(placeId)
        });
      }
    } else {
      await setDoc(bookmarkRef, { 
        placeIds: [placeId]
      });
    }

    setIsBookmarked(!isBookmarked);
  };

  const handleReviewSuccess = (newRating: number) => {
    if (displayRating && displayRatingCount) {
      const newTotalRating = (displayRating * displayRatingCount) + newRating;
      const newTotalReviews = displayRatingCount + 1;
      const newAverage = newTotalRating / newTotalReviews;

      setDisplayRating(newAverage);
      setDisplayRatingCount(newTotalReviews);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      <Container className="max-w-6xl pt-28 pb-16">
        {loading && <BusinessCardSkeleton />}
        {error && (
          <Alert variant="destructive" className="bg-red-950 border-red-900">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-200">{error}</AlertDescription>
          </Alert>
        )}
        {business && (
          <div>
            {/* Photo Gallery */}
            <div className="grid grid-cols-4 grid-rows-2 gap-2 h-96 mb-8">
              {business.photos.slice(0, 5).map((photo, index) => (
                <div
                  key={photo.photo_reference}
                  className={`${index === 0 ? 'col-span-2 row-span-2' : 'col-span-1 row-span-1'}`}
                >
                  <Image
                    src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photoreference=${photo.photo_reference}&key=${apiKey}`}
                    alt={business.name}
                    width={photo.width}
                    height={photo.height}
                    className="object-cover w-full h-full rounded-lg"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-8">
              <div className="col-span-2">
                {/* Header */}
                <div className="mb-8">
                  <div className="flex items-center gap-4">
                    <h1 className="text-5xl font-bold mb-2">{business.name}</h1>
                    {user && (
                      <Button variant="ghost" size="icon" onClick={handleBookmark}>
                        <Bookmark className={isBookmarked ? 'fill-yellow-400 text-yellow-400' : ''} />
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-lg">
                    <StarRating rating={displayRating ?? business.rating} />
                    <span>{(displayRating ?? business.rating).toFixed(1)} ({displayRatingCount ?? business.user_ratings_total} reviews)</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                    <span>{business.types.join(', ')}</span>
                    <span>·</span>
                    <span>{Array(business.price_level).fill('$').join('')}</span>
                  </div>
                  {business.opening_hours && (
                    <div className={`flex items-center gap-2 mt-2 ${business.opening_hours.open_now ? 'text-green-500' : 'text-red-500'}`}>
                      <Clock className="h-5 w-5" />
                      <span>{business.opening_hours.open_now ? 'Open' : 'Closed'}</span>
                    </div>
                  )}
                </div>

                {/* Business Summary */}
                {business.summary && (
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">About {business.name}</h2>
                    <p className="text-lg text-muted-foreground">{business.summary.overview}</p>
                  </div>
                )}

                {/* Review Form */}
                {user && (
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Leave a Review</h2>
                    <ReviewForm businessId={placeId} onSuccess={handleReviewSuccess} />
                  </div>
                )}
              </div>

              <div className="col-span-1">
                {/* Contact Info */}
                <div className="bg-card p-6 rounded-lg border border-border space-y-4">
                  {business.formatted_phone_number && (
                    <div className="flex items-center gap-4">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <span>{business.formatted_phone_number}</span>
                    </div>
                  )}
                  {business.website && (
                    <div className="flex items-center gap-4">
                      <Globe className="h-5 w-5 text-muted-foreground" />
                      <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Website</a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div className="mt-12">
              <h2 className="text-3xl font-bold mb-4">Reviews</h2>
              <CommentSection placeId={placeId} />
            </div>

            {/* Location & Hours */}
            <div className="mt-12">
              <h2 className="text-3xl font-bold mb-4">Location & Hours</h2>
              <div className="grid grid-cols-3 gap-8">
                <div className="col-span-2">
                  <div className="aspect-video mb-4">
                    <BusinessMap lat={business.geometry.location.lat} lng={business.geometry.location.lng} />
                  </div>
                  <div className="flex items-start gap-4">
                    <MapPin className="h-6 w-6 text-muted-foreground mt-1" />
                    <div>
                      <p className="font-medium">{business.formatted_address}</p>
                      {distance !== null && (
                        <p className="text-muted-foreground">{distance.toFixed(1)} miles away</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="col-span-1 bg-card p-6 rounded-lg border border-border">
                  {business.opening_hours && (
                    <ul className="space-y-2">
                      {business.opening_hours.weekday_text.map((day, i) => (
                        <li key={i} className="flex justify-between">
                          <span>{day.split(': ')[0]}</span>
                          <span className="font-medium">{day.split(': ')[1]}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </Container>
      
    </main>
  );
}
