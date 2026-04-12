'use client';

import { useState, useEffect } from 'react';
import { Loader2, MapPin } from 'lucide-react';

interface Insight {
  label: string;
  count: number;
}

interface AreaInsightsProps {
  lat: number;
  lng: number;
  radius?: number;
  compact?: boolean;
}

const TYPE_EMOJIS: Record<string, string> = {
  Restaurants: '🍽️',
  Cafés: '☕',
  Shopping: '🛍️',
  Hotels: '🏨',
  Entertainment: '🎭',
  Health: '💊',
  Parks: '🌿',
  Banks: '🏦',
};

export function AreaInsights({ lat, lng, radius = 500, compact = false }: AreaInsightsProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    fetch('/api/area-insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat, lng, radius }),
    })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        setInsights(data.insights ?? []);
        setTotal(data.total ?? 0);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [lat, lng, radius]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground py-3">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Analyzing area…
      </div>
    );
  }

  if (error || insights.length === 0) return null;

  const maxCount = insights[0]?.count || 1;

  if (compact) {
    return (
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{total}</span> businesses within {radius}m
        </p>
        <div className="flex flex-wrap gap-1.5">
          {insights.filter((i) => i.count > 0).map((item) => (
            <span
              key={item.label}
              className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border border-border bg-muted text-muted-foreground"
            >
              {TYPE_EMOJIS[item.label] ?? '📍'} {item.label} ({item.count})
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{total}</span> businesses within {radius}m
        </p>
      </div>
      <div className="space-y-2">
        {insights.filter((i) => i.count > 0).map((item) => {
          const pct = Math.round((item.count / maxCount) * 100);
          return (
            <div key={item.label} className="flex items-center gap-2">
              <span className="text-sm w-5 text-center shrink-0">{TYPE_EMOJIS[item.label] ?? '📍'}</span>
              <span className="text-xs font-medium text-foreground w-24 shrink-0">{item.label}</span>
              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-foreground w-6 text-right shrink-0">{item.count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
