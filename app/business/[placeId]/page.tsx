'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Container } from '@/components/ui/container';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { BusinessMap } from '@/components/business-map';
import { BusinessCardSkeleton } from '@/components/business-card-skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface BusinessDetails {
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  // Add other fields as needed
}

export default function BusinessDetailsPage() {
  const params = useParams();
  const placeId = params.placeId as string;
  const [business, setBusiness] = useState<BusinessDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <Container className="max-w-4xl pt-28 pb-16">
        {loading && <BusinessCardSkeleton />}
        {error && (
          <Alert variant="destructive" className="bg-red-950 border-red-900">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-200">{error}</AlertDescription>
          </Alert>
        )}
        {business && (
          <div>
            <h1 className="text-4xl font-bold mb-2">{business.name}</h1>
            <p className="text-lg text-muted-foreground mb-8">{business.formatted_address}</p>
            <div className="aspect-video">
              <BusinessMap lat={business.geometry.location.lat} lng={business.geometry.location.lng} />
            </div>
          </div>
        )}
      </Container>
      <Footer />
    </main>
  );
}
