'use client';

import { useEffect, useState, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, Images } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface Photo {
  photo_reference: string;
  width: number;
  height: number;
}

interface PhotoLightboxProps {
  photos: Photo[];
  startIndex: number;
  open: boolean;
  onClose: () => void;
  apiKey: string | undefined;
  businessName: string;
}

export function PhotoLightbox({
  photos,
  startIndex,
  open,
  onClose,
  apiKey,
  businessName,
}: PhotoLightboxProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, startIndex });
  const [current, setCurrent] = useState(startIndex);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', () => setCurrent(emblaApi.selectedScrollSnap()));
  }, [emblaApi]);

  useEffect(() => {
    if (emblaApi && open) {
      emblaApi.scrollTo(startIndex, true);
      setCurrent(startIndex);
    }
  }, [emblaApi, open, startIndex]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'ArrowLeft') scrollPrev();
      if (e.key === 'ArrowRight') scrollNext();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, scrollPrev, scrollNext, onClose]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[95vw] w-full max-h-[95vh] p-0 bg-black/96 border-black/50 overflow-hidden">
        <VisuallyHidden>
          <DialogTitle>{businessName} — Photo Gallery</DialogTitle>
        </VisuallyHidden>
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
          <div className="flex items-center gap-2 text-white/80 pointer-events-none">
            <Images className="h-4 w-4" />
            <span className="text-sm font-medium">{businessName}</span>
          </div>
          <button
            onClick={onClose}
            className="pointer-events-auto h-8 w-8 rounded-full bg-black/40 flex items-center justify-center text-white/80 hover:text-white hover:bg-black/60 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Carousel */}
        <div className="overflow-hidden h-[85vh]" ref={emblaRef}>
          <div className="flex h-full">
            {photos.map((photo, i) => (
              <div key={photo.photo_reference} className="flex-none w-full h-full relative">
                <Image
                  src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photoreference=${photo.photo_reference}&key=${apiKey}`}
                  alt={`${businessName} photo ${i + 1}`}
                  fill
                  className="object-contain"
                  priority={i === startIndex}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Prev / Next */}
        <button
          onClick={scrollPrev}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={scrollNext}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Counter */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-full bg-black/50 text-white/80 text-sm tabular-nums">
          {current + 1} / {photos.length}
        </div>

        {/* Dot strip */}
        <div className="absolute bottom-11 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 max-w-[200px] overflow-hidden">
          {photos.slice(0, 10).map((_, i) => (
            <button
              key={i}
              onClick={() => emblaApi?.scrollTo(i)}
              className={`h-1.5 rounded-full transition-all duration-200 ${
                i === current ? 'w-4 bg-white' : 'w-1.5 bg-white/40'
              }`}
            />
          ))}
          {photos.length > 10 && (
            <span className="text-white/40 text-[10px] self-center">…</span>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
