'use client';

import { useMemo } from 'react';
import type { User } from 'firebase/auth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, Copy, Download, MapPin, Workflow, Route, Database } from 'lucide-react';
import { toast } from 'sonner';

export interface BusinessDataPipeline {
  placesDetailsClientMs: number | null;
  placesServerMs: number | null;
  placesApiStatus: string | null;
  firestoreRatingsMs: number | null;
  portalLoadMs: number | null;
  portalStats: {
    claimed: boolean;
    announcementCount: number;
    eventCount: number;
    dealCount: number;
    ownerReplyCount: number;
  } | null;
  aiSummaryClientMs: number | null;
  summarySource: 'google_editorial' | 'ai' | 'none';
}

export const EMPTY_BUSINESS_PIPELINE: BusinessDataPipeline = {
  placesDetailsClientMs: null,
  placesServerMs: null,
  placesApiStatus: null,
  firestoreRatingsMs: null,
  portalLoadMs: null,
  portalStats: null,
  aiSummaryClientMs: null,
  summarySource: 'none',
};

interface BusinessReportBusiness {
  name: string;
  formatted_address: string;
  geometry: { location: { lat: number; lng: number } };
  types: string[];
  rating: number;
  user_ratings_total: number;
  formatted_phone_number?: string;
  website?: string;
}

interface BusinessDetailsReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  placeId: string;
  user: User | null;
  business: BusinessReportBusiness;
  pipeline: BusinessDataPipeline;
  displayRating: number;
  displayRatingCount: number;
  distanceMiles: number | null;
  checkinCount: number;
  communityPhotoCount: number;
  isBookmarked: boolean;
}

export function BusinessDetailsReportDialog({
  open,
  onOpenChange,
  placeId,
  user,
  business,
  pipeline,
  displayRating,
  displayRatingCount,
  distanceMiles,
  checkinCount,
  communityPhotoCount,
  isBookmarked,
}: BusinessDetailsReportDialogProps) {
  const userLabel = user?.email ?? (user?.uid ? `uid …${user.uid.slice(-8)}` : 'Not signed in');

  const markdown = useMemo(
    () =>
      buildBusinessReportMarkdown({
        userLabel,
        placeId,
        pagePath: `/business/${placeId}`,
        business,
        pipeline,
        displayRating,
        displayRatingCount,
        distanceMiles,
        checkinCount,
        communityPhotoCount,
        isBookmarked,
      }),
    [
      userLabel,
      placeId,
      business,
      pipeline,
      displayRating,
      displayRatingCount,
      distanceMiles,
      checkinCount,
      communityPhotoCount,
      isBookmarked,
    ],
  );

  const copyReport = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      toast.success('Report copied to clipboard');
    } catch {
      toast.error('Could not copy');
    }
  };

  const downloadReport = () => {
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeName = business.name.replace(/[^\w\s-]/g, '').slice(0, 40) || 'business';
    a.download = `business-data-report-${safeName.replace(/\s+/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report downloaded');
  };

  const p = pipeline;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pb-2 shrink-0 border-b border-border">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Business data report
          </DialogTitle>
          <DialogDescription>
            How this page was loaded: your navigation, APIs and Firestore, and the rendered business
            profile.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto px-6 py-4 space-y-6 text-sm">
          <section>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5" />
              1 · User input
            </h4>
            <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-2">
              <p>
                <span className="text-muted-foreground">Session:</span> {userLabel}
              </p>
              <p>
                <span className="text-muted-foreground">Place ID (URL param):</span> {placeId}
              </p>
              <p>
                <span className="text-muted-foreground">Route:</span>{' '}
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{`/business/${placeId}`}</code>
              </p>
              <p>
                <span className="text-muted-foreground">Saved bookmark:</span>{' '}
                {isBookmarked ? 'Yes' : 'No'}
              </p>
            </div>
          </section>

          <section>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
              <Workflow className="h-3.5 w-3.5" />
              2 · Processing and data routing
            </h4>
            <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-2 font-mono text-xs">
              <p>
                <span className="text-muted-foreground font-sans">Places details (browser → app):</span>{' '}
                {p.placesDetailsClientMs != null ? `${p.placesDetailsClientMs} ms` : '—'}
              </p>
              <p>
                <span className="text-muted-foreground font-sans">Places details (server):</span>{' '}
                {p.placesServerMs != null ? `${p.placesServerMs} ms` : '—'}
              </p>
              <p>
                <span className="text-muted-foreground font-sans">Google Places status:</span>{' '}
                {p.placesApiStatus ?? '—'}
              </p>
              <p>
                <span className="text-muted-foreground font-sans">Firestore · merged ratings:</span>{' '}
                {p.firestoreRatingsMs != null ? `${p.firestoreRatingsMs} ms` : '—'}
              </p>
              <p>
                <span className="text-muted-foreground font-sans">Business portal bundle:</span>{' '}
                {p.portalLoadMs != null ? `${p.portalLoadMs} ms` : '—'}
                {p.portalStats && (
                  <span className="font-sans text-muted-foreground">
                    {' '}
                    (claimed: {p.portalStats.claimed ? 'yes' : 'no'} · announcements{' '}
                    {p.portalStats.announcementCount} · events {p.portalStats.eventCount} · deals{' '}
                    {p.portalStats.dealCount} · owner replies {p.portalStats.ownerReplyCount})
                  </span>
                )}
              </p>
              <p>
                <span className="text-muted-foreground font-sans">About text source:</span>{' '}
                {p.summarySource === 'google_editorial'
                  ? 'Google Places editorial summary'
                  : p.summarySource === 'ai'
                    ? 'AI summary (Gemini via /api/ai-summary)'
                    : 'None'}
              </p>
              {p.summarySource === 'ai' && (
                <p>
                  <span className="text-muted-foreground font-sans">AI summary request:</span>{' '}
                  {p.aiSummaryClientMs != null ? `${p.aiSummaryClientMs} ms` : '—'}
                </p>
              )}
              <p className="text-[11px] text-muted-foreground font-sans pt-1 border-t border-border/60 mt-2">
                Other UI: travel times use <code className="text-[10px]">POST /api/routes</code> from
                your location; map and environment widgets may call additional APIs when visible.
              </p>
            </div>
          </section>

          <section>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
              <Route className="h-3.5 w-3.5" />
              3 · Page output (business profile snapshot)
            </h4>
            <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
              <p className="text-lg font-bold text-foreground">{business.name}</p>
              <p className="text-muted-foreground text-xs">{business.formatted_address}</p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-muted-foreground">Coordinates</p>
                  <p className="font-mono">
                    {business.geometry.location.lat.toFixed(5)}, {business.geometry.location.lng.toFixed(5)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Rating shown</p>
                  <p>
                    {displayRating.toFixed(1)} ({displayRatingCount.toLocaleString()} reviews)
                  </p>
                </div>
                {distanceMiles != null && (
                  <div>
                    <p className="text-muted-foreground">Distance from you</p>
                    <p>{distanceMiles.toFixed(1)} mi</p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground">Check-ins / photos</p>
                  <p>
                    {checkinCount} check-ins · {communityPhotoCount} community photos
                  </p>
                </div>
              </div>
              {business.types?.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Types:</span>{' '}
                  {business.types.slice(0, 8).join(', ')}
                </p>
              )}
              {(business.formatted_phone_number || business.website) && (
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-mono">
                  {business.formatted_phone_number && <span>{business.formatted_phone_number}</span>}
                  {business.website && <span className="truncate max-w-full">{business.website}</span>}
                </div>
              )}
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 pt-1">
                <Database className="h-3 w-3 shrink-0" />
                Firestore: bookmarks, ratings merge, check-ins, community photos, owner portal content
                when claimed.
              </p>
            </div>
          </section>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border bg-muted/10 shrink-0 gap-2 sm:justify-between">
          <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={copyReport}>
              <Copy className="h-3.5 w-3.5" />
              Copy Markdown
            </Button>
            <Button type="button" size="sm" className="gap-1.5" onClick={downloadReport}>
              <Download className="h-3.5 w-3.5" />
              Download .md
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function buildBusinessReportMarkdown(args: {
  userLabel: string;
  placeId: string;
  pagePath: string;
  business: BusinessReportBusiness;
  pipeline: BusinessDataPipeline;
  displayRating: number;
  displayRatingCount: number;
  distanceMiles: number | null;
  checkinCount: number;
  communityPhotoCount: number;
  isBookmarked: boolean;
}): string {
  const {
    userLabel,
    placeId,
    pagePath,
    business,
    pipeline: p,
    displayRating,
    displayRatingCount,
    distanceMiles,
    checkinCount,
    communityPhotoCount,
    isBookmarked,
  } = args;

  const lines: string[] = [
    '# Business page — data report',
    '',
    `- **Generated:** ${new Date().toISOString()}`,
    `- **User:** ${userLabel}`,
    '',
    '## 1. User input',
    '',
    `- **Place ID:** ${placeId}`,
    `- **Route:** \`${pagePath}\``,
    `- **Bookmarked:** ${isBookmarked ? 'yes' : 'no'}`,
    '',
    '## 2. Processing and data routing',
    '',
    `- **GET /api/places/details (client round-trip):** ${p.placesDetailsClientMs != null ? `${p.placesDetailsClientMs} ms` : '—'}`,
    `- **Places details (server):** ${p.placesServerMs != null ? `${p.placesServerMs} ms` : '—'}`,
    `- **Google Places status:** ${p.placesApiStatus ?? '—'}`,
    `- **Firestore · merged ratings doc:** ${p.firestoreRatingsMs != null ? `${p.firestoreRatingsMs} ms` : '—'}`,
    `- **Business portal bundle:** ${p.portalLoadMs != null ? `${p.portalLoadMs} ms` : '—'}`,
  ];

  if (p.portalStats) {
    lines.push(
      `  - Claimed: ${p.portalStats.claimed}`,
      `  - Announcements: ${p.portalStats.announcementCount}, events: ${p.portalStats.eventCount}, deals: ${p.portalStats.dealCount}, owner replies: ${p.portalStats.ownerReplyCount}`,
    );
  }

  const src =
    p.summarySource === 'google_editorial'
      ? 'Google Places editorial summary'
      : p.summarySource === 'ai'
        ? 'POST /api/ai-summary (Gemini)'
        : 'none';
  lines.push(`- **About / summary source:** ${src}`);
  if (p.summarySource === 'ai') {
    lines.push(
      `- **AI summary client time:** ${p.aiSummaryClientMs != null ? `${p.aiSummaryClientMs} ms` : '—'}`,
    );
  }
  lines.push(
    '- **Note:** Travel times on the page use `POST /api/routes` (drive/walk) when location is available.',
    '',
    '## 3. Page output (business profile snapshot)',
    '',
    `### ${business.name}`,
    '',
    business.formatted_address,
    '',
    `- **Coordinates:** ${business.geometry.location.lat}, ${business.geometry.location.lng}`,
    `- **Rating shown:** ${displayRating} (${displayRatingCount} reviews)`,
  );

  if (distanceMiles != null) {
    lines.push(`- **Distance from you:** ${distanceMiles.toFixed(1)} mi`);
  }
  lines.push(
    `- **Check-ins:** ${checkinCount}`,
    `- **Community photos:** ${communityPhotoCount}`,
    `- **Types:** ${business.types?.slice(0, 12).join(', ') ?? '—'}`,
  );
  if (business.formatted_phone_number) lines.push(`- **Phone:** ${business.formatted_phone_number}`);
  if (business.website) lines.push(`- **Website:** ${business.website}`);
  lines.push(
    '',
    '_Firestore sources: bookmarks, businessRatings merge, checkins, communityPhotos, owner portal collections when claimed._',
    '',
  );

  return lines.join('\n');
}
