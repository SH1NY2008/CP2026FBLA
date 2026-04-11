'use client';

import { useState, useEffect } from 'react';
import { Sun, Zap, Leaf, LayoutGrid, Loader2 } from 'lucide-react';

interface SolarData {
  maxPanels: number;
  maxAreaSqFt: number;
  maxSunshineHours: number;
  roofSegments: number;
  yearlyEnergyKwh: number;
  recommendedPanels: number;
  yearlySavingsUsd: number;
  carbonOffsetKg: number;
  imageryQuality: string;
}

export function SolarPanel({ lat, lng }: { lat: number; lng: number }) {
  const [data, setData] = useState<SolarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    fetch(`/api/solar?lat=${lat}&lng=${lng}`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [lat, lng]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground py-3">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Loading solar data…
      </div>
    );
  }

  if (error || !data) return null;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/5 border border-amber-500/20">
          <Sun className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          <div>
            <p className="text-xs font-bold text-foreground">{data.maxSunshineHours.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">Sun hrs/year</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-500/5 border border-blue-500/20">
          <Zap className="h-3.5 w-3.5 text-blue-400 shrink-0" />
          <div>
            <p className="text-xs font-bold text-foreground">{data.yearlyEnergyKwh.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">kWh/year</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
          <Leaf className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          <div>
            <p className="text-xs font-bold text-foreground">${data.yearlySavingsUsd.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">Savings/year</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-lg bg-violet-500/5 border border-violet-500/20">
          <LayoutGrid className="h-3.5 w-3.5 text-violet-400 shrink-0" />
          <div>
            <p className="text-xs font-bold text-foreground">{data.recommendedPanels}</p>
            <p className="text-[10px] text-muted-foreground">Max panels</p>
          </div>
        </div>
      </div>
      {data.carbonOffsetKg > 0 && (
        <p className="text-[10px] text-emerald-500">
          Estimated {data.carbonOffsetKg.toLocaleString()} kg CO₂ offset per year
        </p>
      )}
    </div>
  );
}
