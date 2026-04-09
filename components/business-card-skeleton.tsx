'use client';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function BusinessCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      {/* Image skeleton */}
      <Skeleton className="h-48 w-full bg-muted" />

      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Title skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-6 w-3/4 bg-muted" />
          <Skeleton className="h-4 w-full bg-muted" />
        </div>

        {/* Badge skeleton */}
        <Skeleton className="h-6 w-20 bg-muted rounded-full" />

        {/* Stats skeleton */}
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-5 w-16 bg-muted" />
          <Skeleton className="h-5 w-12 bg-muted" />
          <Skeleton className="h-5 w-20 bg-muted" />
        </div>
      </div>
    </Card>
  );
}
