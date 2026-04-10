'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Container } from '@/components/ui/container';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { BusinessMap } from '@/components/business-map';
import { BusinessCardSkeleton } from '@/components/business-card-skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Star, Clock, Phone, Globe, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
}

const StarRating = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
      ))}
      {halfStar && <Star key="half" className="h-5 w-5 fill-yellow-400 text-yellow-400" />}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className="h-5 w-5 fill-gray-300 text-gray-300" />
      ))}
    </div>
  );
};

export default function BusinessDetailsPage() {
  const params = useParams();
  const placeId = params.placeId as string;
  const [business, setBusiness] = useState<BusinessDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [distance, setDistance] = useState<number | null>(null);

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
          setBusiness(data.result);
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
                  <h1 className="text-5xl font-bold mb-2">{business.name}</h1>
                  <div className="flex items-center gap-4 text-lg">
                    <StarRating rating={business.rating} />
                    <span>{business.rating.toFixed(1)} ({business.user_ratings_total} reviews)</span>
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
      <Footer />
    </main>
  );
}
