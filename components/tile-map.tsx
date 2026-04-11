'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { ZoomIn, ZoomOut, Crosshair, Star, Clock, Navigation, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const TILE_SIZE = 256;
const MIN_ZOOM = 3;
const MAX_ZOOM = 20;
const DRAG_THRESHOLD = 5; // px before a mousedown is considered a drag

interface Business {
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating?: number;
  ratingCount?: number;
  isOpen?: boolean;
  photoUrl?: string | null;
  priceLevel?: number;
  types: string[];
  distance?: number;
}

interface TileMapProps {
  lat: number;
  lng: number;
  businesses?: Business[];
  className?: string;
}

const PRICE_DISPLAY: Record<number, string> = { 1: '$', 2: '$$', 3: '$$$', 4: '$$$$' };

const TYPE_ICONS: Record<string, string> = {
  restaurant: '🍽️', cafe: '☕', bar: '🍺', bakery: '🥐',
  store: '🛍️', shopping_mall: '🏬', supermarket: '🛒',
  bank: '🏦', gym: '💪', pharmacy: '💊',
  movie_theater: '🎬', park: '🌿', entertainment: '🎭',
};

const TYPE_GRADIENTS: Record<string, string> = {
  restaurant: 'from-orange-500/30 to-red-600/40',
  cafe: 'from-amber-500/30 to-orange-600/40',
  bar: 'from-purple-500/30 to-indigo-600/40',
  store: 'from-blue-500/30 to-cyan-600/40',
  shopping_mall: 'from-sky-500/30 to-blue-600/40',
  pharmacy: 'from-emerald-500/30 to-green-600/40',
  park: 'from-green-500/30 to-lime-600/40',
};

function getCategoryLabel(types: string[]): string {
  const map: Record<string, string> = {
    restaurant: 'Restaurant', cafe: 'Café', bar: 'Bar', bakery: 'Bakery',
    store: 'Store', shopping_mall: 'Shopping Mall', supermarket: 'Supermarket',
    bank: 'Bank', gym: 'Gym', pharmacy: 'Pharmacy',
    hospital: 'Hospital', movie_theater: 'Cinema', park: 'Park',
    entertainment: 'Entertainment',
  };
  for (const t of types) if (map[t]) return map[t];
  return 'Business';
}

/** Convert lat/lng to fractional tile coords at a given zoom */
function latLngToTile(lat: number, lng: number, zoom: number) {
  const n = Math.pow(2, zoom);
  const x = ((lng + 180) / 360) * n;
  const latRad = (lat * Math.PI) / 180;
  const y = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n;
  return { x, y };
}

// ── Popup card ────────────────────────────────────────────────────────────────
function BusinessPopup({
  biz,
  pixelX,
  pixelY,
  mapH,
  onClose,
}: {
  biz: Business;
  pixelX: number;
  pixelY: number;
  mapH: number;
  onClose: () => void;
}) {
  const primaryType = biz.types[0] || 'restaurant';
  const gradient = TYPE_GRADIENTS[primaryType] || 'from-zinc-500/30 to-neutral-600/40';
  const icon = TYPE_ICONS[primaryType] || '📍';
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(biz.address)}&destination_place_id=${biz.placeId}`;

  // Flip above/below the pin based on available space
  const POPUP_H = 260;
  const showAbove = pixelY > POPUP_H + 30;

  return (
    <div
      style={{
        position: 'absolute',
        left: Math.min(pixelX - 140, /* clamp right */ 9999),
        top: showAbove ? pixelY - POPUP_H - 16 : pixelY + 18,
        width: 280,
        zIndex: 50,
        pointerEvents: 'auto',
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Arrow */}
      {showAbove ? (
        <div
          className="absolute bottom-0 translate-y-full"
          style={{ left: 140 - 6 }}
        >
          <div className="w-3 h-3 bg-card border-b border-r border-border rotate-45 -translate-y-1/2 mx-auto" />
        </div>
      ) : (
        <div
          className="absolute top-0 -translate-y-full"
          style={{ left: 140 - 6 }}
        >
          <div className="w-3 h-3 bg-card border-t border-l border-border rotate-45 translate-y-1/2 mx-auto" />
        </div>
      )}

      <div className="rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Photo / gradient header */}
        <div className="relative h-32 w-full shrink-0">
          {biz.photoUrl ? (
            <Image src={biz.photoUrl} alt={biz.name} fill className="object-cover" />
          ) : (
            <div className={`h-full w-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
              <span className="text-4xl opacity-70 select-none">{icon}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/90 hover:bg-black/70 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          {/* Open/closed badge on photo */}
          {biz.isOpen !== undefined && (
            <span
              className={`absolute bottom-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                biz.isOpen
                  ? 'bg-green-500/90 text-white'
                  : 'bg-red-500/90 text-white'
              }`}
            >
              {biz.isOpen ? 'Open now' : 'Closed'}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-3 space-y-2">
          <div>
            <p className="font-semibold text-sm text-foreground leading-snug line-clamp-1">{biz.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
              {getCategoryLabel(biz.types)}
              {biz.address ? ` · ${biz.address}` : ''}
            </p>
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {biz.rating !== undefined && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 shrink-0" />
                <span className="text-xs font-semibold text-foreground">{biz.rating.toFixed(1)}</span>
                {biz.ratingCount !== undefined && (
                  <span className="text-[10px] text-muted-foreground">({biz.ratingCount})</span>
                )}
              </div>
            )}
            {biz.distance !== undefined && (
              <span className="text-[10px] text-muted-foreground">
                {biz.distance < 0.1
                  ? `${(biz.distance * 5280).toFixed(0)} ft`
                  : `${biz.distance.toFixed(1)} mi`}
              </span>
            )}
            {biz.priceLevel !== undefined && (
              <span className="text-[10px] font-medium text-muted-foreground ml-auto">
                {PRICE_DISPLAY[biz.priceLevel]}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-1.5 pt-0.5">
            <Link
              href={`/business/${biz.placeId}`}
              className="flex-1 text-center text-xs font-medium py-1.5 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 transition-colors"
            >
              View details
            </Link>
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-medium py-1.5 px-2.5 rounded-lg border border-border hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <Navigation className="h-3 w-3" />
              Directions
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main map ──────────────────────────────────────────────────────────────────
export function TileMap({ lat, lng, businesses = [], className = '' }: TileMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [session, setSession] = useState<string | null>(null);
  const [sessionError, setSessionError] = useState(false);
  const [zoom, setZoom] = useState(14);
  const [centerLat, setCenterLat] = useState(lat);
  const [centerLng, setCenterLng] = useState(lng);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [hoveredPlaceId, setHoveredPlaceId] = useState<string | null>(null);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);

  const dragRef = useRef<{
    startX: number; startY: number;
    startLat: number; startLng: number;
    hasDragged: boolean;
  } | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY!;

  useEffect(() => {
    fetch('/api/map-session')
      .then((r) => r.json())
      .then((d) => { if (d.session) setSession(d.session); else setSessionError(true); })
      .catch(() => setSessionError(true));
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ w: width, h: height });
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => { setCenterLat(lat); setCenterLng(lng); }, [lat, lng]);

  // Close popup when location changes
  useEffect(() => { setSelectedBusiness(null); }, [lat, lng]);

  const tileUrl = useCallback(
    (tx: number, ty: number) =>
      session ? `https://tile.googleapis.com/v1/2dtiles/${zoom}/${tx}/${ty}?session=${session}&key=${apiKey}` : '',
    [session, zoom, apiKey]
  );

  // ── Drag ──────────────────────────────────────────────────────────────────
  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    dragRef.current = { startX: e.clientX, startY: e.clientY, startLat: centerLat, startLng: centerLng, hasDragged: false };
  };

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    if (!dragRef.current.hasDragged && Math.hypot(dx, dy) > DRAG_THRESHOLD) {
      dragRef.current.hasDragged = true;
    }
    if (!dragRef.current.hasDragged) return;
    const n = Math.pow(2, zoom);
    const baseFrac = latLngToTile(dragRef.current.startLat, dragRef.current.startLng, zoom);
    const newTileX = baseFrac.x - dx / TILE_SIZE;
    const newTileY = baseFrac.y - dy / TILE_SIZE;
    const newLng = (newTileX / n) * 360 - 180;
    const latRad = Math.atan(Math.sinh(Math.PI * (1 - (2 * newTileY) / n)));
    const newLat = (latRad * 180) / Math.PI;
    setCenterLat(Math.max(-85, Math.min(85, newLat)));
    setCenterLng(newLng);
  }, [zoom]);

  const onMouseUp = (e: React.MouseEvent) => {
    if (dragRef.current && !dragRef.current.hasDragged) {
      // Treat as a background click — close popup
      const target = e.target as HTMLElement;
      if (!target.closest('[data-marker]') && !target.closest('[data-popup]')) {
        setSelectedBusiness(null);
      }
    }
    dragRef.current = null;
  };

  // Touch drag
  const touchRef = useRef<{ startX: number; startY: number; startLat: number; startLng: number } | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchRef.current = { startX: t.clientX, startY: t.clientY, startLat: centerLat, startLng: centerLng };
  };

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchRef.current) return;
    const t = e.touches[0];
    const dx = t.clientX - touchRef.current.startX;
    const dy = t.clientY - touchRef.current.startY;
    const n = Math.pow(2, zoom);
    const baseFrac = latLngToTile(touchRef.current.startLat, touchRef.current.startLng, zoom);
    const newTileX = baseFrac.x - dx / TILE_SIZE;
    const newTileY = baseFrac.y - dy / TILE_SIZE;
    const newLng = (newTileX / n) * 360 - 180;
    const latRad = Math.atan(Math.sinh(Math.PI * (1 - (2 * newTileY) / n)));
    const newLat = (latRad * 180) / Math.PI;
    setCenterLat(Math.max(-85, Math.min(85, newLat)));
    setCenterLng(newLng);
  }, [zoom]);

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z + (e.deltaY < 0 ? 1 : -1))));
  };

  // ── Tile grid ─────────────────────────────────────────────────────────────
  const tiles = (() => {
    if (!session || size.w === 0) return null;
    const center = latLngToTile(centerLat, centerLng, zoom);
    const cx = Math.floor(center.x);
    const cy = Math.floor(center.y);
    const offsetX = (center.x - cx) * TILE_SIZE;
    const offsetY = (center.y - cy) * TILE_SIZE;
    const halfW = size.w / 2;
    const halfH = size.h / 2;
    const rangeX = Math.ceil(halfW / TILE_SIZE) + 1;
    const rangeY = Math.ceil(halfH / TILE_SIZE) + 1;
    const result = [];
    for (let dx = -rangeX; dx <= rangeX; dx++) {
      for (let dy = -rangeY; dy <= rangeY; dy++) {
        const tx = cx + dx;
        const ty = cy + dy;
        if (ty < 0 || ty >= Math.pow(2, zoom)) continue;
        const px = halfW - offsetX + dx * TILE_SIZE;
        const py = halfH - offsetY + dy * TILE_SIZE;
        result.push(
          <img
            key={`${tx}-${ty}-${zoom}`}
            src={tileUrl(tx, ty)}
            alt=""
            draggable={false}
            style={{ position: 'absolute', left: px, top: py, width: TILE_SIZE, height: TILE_SIZE, pointerEvents: 'none', userSelect: 'none' }}
          />
        );
      }
    }
    return result;
  })();

  // ── Markers ───────────────────────────────────────────────────────────────
  const center = latLngToTile(centerLat, centerLng, zoom);

  const markers = businesses.map((biz) => {
    const bt = latLngToTile(biz.lat, biz.lng, zoom);
    const px = size.w / 2 + (bt.x - center.x) * TILE_SIZE;
    const py = size.h / 2 + (bt.y - center.y) * TILE_SIZE;
    const isHovered = hoveredPlaceId === biz.placeId;
    const isSelected = selectedBusiness?.placeId === biz.placeId;

    return (
      <div
        key={biz.placeId}
        data-marker="true"
        style={{ position: 'absolute', left: px - 10, top: py - 24, zIndex: isSelected ? 30 : 10 }}
        onMouseEnter={() => setHoveredPlaceId(biz.placeId)}
        onMouseLeave={() => setHoveredPlaceId(null)}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedBusiness(isSelected ? null : biz);
        }}
        className="cursor-pointer"
      >
        {/* Pin shape */}
        <div
          className="transition-all duration-150 flex flex-col items-center"
          style={{ transform: isHovered || isSelected ? 'scale(1.25) translateY(-3px)' : 'scale(1)' }}
        >
          <div
            className={`w-5 h-5 rounded-full border-2 shadow-lg flex items-center justify-center text-[9px] ${
              isSelected
                ? 'border-white bg-accent scale-110 shadow-accent/30'
                : biz.isOpen === false
                ? 'border-white bg-red-500'
                : 'border-white bg-blue-500'
            }`}
          >
            {isSelected && '✓'}
          </div>
          {/* Pin tail */}
          <div
            className={`w-0.5 h-2 ${
              isSelected ? 'bg-accent' : biz.isOpen === false ? 'bg-red-500' : 'bg-blue-500'
            }`}
          />
          <div
            className={`w-1 h-0.5 rounded-full opacity-30 ${
              isSelected ? 'bg-accent' : biz.isOpen === false ? 'bg-red-500' : 'bg-blue-500'
            }`}
          />
        </div>

        {/* Hover name label (only when not selected) */}
        {isHovered && !isSelected && (
          <div
            className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-card/95 backdrop-blur-sm border border-border px-2 py-1 text-xs font-medium text-foreground shadow-lg pointer-events-none"
          >
            {biz.name}
            {biz.rating !== undefined && (
              <span className="ml-1.5 text-yellow-400">★ {biz.rating.toFixed(1)}</span>
            )}
          </div>
        )}
      </div>
    );
  });

  // ── Popups ────────────────────────────────────────────────────────────────
  const popup = (() => {
    if (!selectedBusiness || size.w === 0) return null;
    const bt = latLngToTile(selectedBusiness.lat, selectedBusiness.lng, zoom);
    const px = size.w / 2 + (bt.x - center.x) * TILE_SIZE;
    const py = size.h / 2 + (bt.y - center.y) * TILE_SIZE;

    // Clamp horizontally so the popup stays inside the map
    const clampedPx = Math.max(150, Math.min(size.w - 140, px));

    return (
      <div data-popup="true">
        <BusinessPopup
          biz={selectedBusiness}
          pixelX={clampedPx}
          pixelY={py}
          mapH={size.h}
          onClose={() => setSelectedBusiness(null)}
        />
      </div>
    );
  })();

  // ── Center dot ────────────────────────────────────────────────────────────
  const centerMarker = size.w > 0 && (
    <div
      style={{ position: 'absolute', left: size.w / 2 - 10, top: size.h / 2 - 10, zIndex: 15, pointerEvents: 'none' }}
    >
      <div className="relative flex items-center justify-center">
        <span className="absolute h-5 w-5 rounded-full bg-emerald-400/30 animate-ping" />
        <span className="relative h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-md" />
      </div>
    </div>
  );

  if (sessionError) {
    return (
      <div className={`flex items-center justify-center bg-muted rounded-xl border border-border ${className}`}>
        <p className="text-sm text-muted-foreground">Map unavailable</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-xl border border-border bg-muted select-none ${className}`}
      style={{ cursor: dragRef.current?.hasDragged ? 'grabbing' : 'grab' }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={() => { dragRef.current = null; }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={() => { touchRef.current = null; }}
      onWheel={onWheel}
    >
      {tiles}
      {markers}
      {centerMarker}
      {popup}

      {/* Legend */}
      {businesses.length > 0 && (
        <div className="absolute bottom-8 left-3 z-20 flex items-center gap-3 rounded-lg bg-card/90 backdrop-blur-sm border border-border/60 px-2.5 py-1.5 text-[10px] text-muted-foreground pointer-events-none">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500 border border-white" /> Open</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500 border border-white" /> Closed</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500 border border-white" /> You</span>
        </div>
      )}

      {/* Controls */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-px shadow-md rounded-lg overflow-hidden border border-border/60">
        <button onClick={(e) => { e.stopPropagation(); setZoom((z) => Math.min(MAX_ZOOM, z + 1)); }} className="flex items-center justify-center w-8 h-8 bg-card/90 backdrop-blur-sm hover:bg-card transition-colors text-foreground" title="Zoom in"><ZoomIn className="h-4 w-4" /></button>
        <button onClick={(e) => { e.stopPropagation(); setZoom((z) => Math.max(MIN_ZOOM, z - 1)); }} className="flex items-center justify-center w-8 h-8 bg-card/90 backdrop-blur-sm hover:bg-card transition-colors border-t border-border/60 text-foreground" title="Zoom out"><ZoomOut className="h-4 w-4" /></button>
        <button onClick={(e) => { e.stopPropagation(); setCenterLat(lat); setCenterLng(lng); setZoom(14); setSelectedBusiness(null); }} className="flex items-center justify-center w-8 h-8 bg-card/90 backdrop-blur-sm hover:bg-card transition-colors border-t border-border/60 text-foreground" title="Reset view"><Crosshair className="h-4 w-4" /></button>
      </div>

      {/* Attribution */}
      <div className="absolute bottom-1.5 right-2 z-20 text-[10px] text-white/60 pointer-events-none">© Google</div>

      {/* Loading overlay */}
      {!session && !sessionError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted z-30">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
