'use client';

import { useEffect, useState } from 'react';
import { Droplets, Thermometer, Wind, Leaf } from 'lucide-react';

interface WeatherData {
  tempF: number;
  feelsLikeF: number;
  humidity: number;
  windMph: number;
  condition: string;
  iconUri: string | null;
}

interface AirQualityData {
  aqi: number;
  category: string;
  dominantPollutant: string | null;
  healthRecommendation: string | null;
}

interface Props {
  lat: number;
  lng: number;
}

function aqiColor(aqi: number) {
  if (aqi <= 50)  return { bg: 'bg-green-500/15',  border: 'border-green-500/30',  dot: 'bg-green-500',  text: 'text-green-600 dark:text-green-400' };
  if (aqi <= 100) return { bg: 'bg-yellow-500/15', border: 'border-yellow-500/30', dot: 'bg-yellow-500', text: 'text-yellow-600 dark:text-yellow-400' };
  if (aqi <= 150) return { bg: 'bg-orange-500/15', border: 'border-orange-500/30', dot: 'bg-orange-500', text: 'text-orange-600 dark:text-orange-400' };
  if (aqi <= 200) return { bg: 'bg-red-500/15',    border: 'border-red-500/30',    dot: 'bg-red-500',    text: 'text-red-600 dark:text-red-400' };
  return           { bg: 'bg-purple-500/15',        border: 'border-purple-500/30', dot: 'bg-purple-500', text: 'text-purple-600 dark:text-purple-400' };
}

function WeatherIcon({ iconUri, condition }: { iconUri: string | null; condition: string }) {
  if (iconUri) {
    return (
      <img
        src={`${iconUri}.png`}
        alt={condition}
        className="h-6 w-6 object-contain"
        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
      />
    );
  }
  // Fallback emoji based on condition text
  const lc = condition.toLowerCase();
  const emoji =
    lc.includes('thunder') ? '⛈️' :
    lc.includes('rain') || lc.includes('shower') ? '🌧️' :
    lc.includes('drizzle') ? '🌦️' :
    lc.includes('snow') ? '❄️' :
    lc.includes('fog') || lc.includes('mist') ? '🌫️' :
    lc.includes('cloud') || lc.includes('overcast') ? '☁️' :
    lc.includes('partly') ? '⛅' :
    '☀️';
  return <span className="text-lg leading-none">{emoji}</span>;
}

export function LocationEnvPanel({ lat, lng }: Props) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [airQuality, setAirQuality] = useState<AirQualityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<'weather' | 'aqi' | null>(null);

  useEffect(() => {
    setLoading(true);
    setWeather(null);
    setAirQuality(null);

    fetch(`/api/weather?lat=${lat}&lng=${lng}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.weather) setWeather(d.weather);
        if (d.airQuality) setAirQuality(d.airQuality);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [lat, lng]);

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="h-9 w-28 rounded-full bg-secondary/50 border border-border/60 animate-pulse"
          />
        ))}
      </div>
    );
  }

  const aqiColors = airQuality ? aqiColor(airQuality.aqi) : null;

  return (
    <div className="flex items-center gap-2 flex-wrap">

      {/* ── Weather chip ── */}
      {weather && (
        <div className="relative">
          <button
            onClick={() => setExpanded(expanded === 'weather' ? null : 'weather')}
            className="flex items-center gap-2 rounded-full border border-border/60 bg-secondary/50 px-3.5 py-2 text-sm transition-all duration-300 hover:border-foreground/20 hover:bg-secondary/80 hover:shadow-sm"
          >
            <WeatherIcon iconUri={weather.iconUri} condition={weather.condition} />
            <span className="font-semibold text-foreground">{weather.tempF}°F</span>
            <span className="text-muted-foreground hidden sm:inline truncate max-w-[120px]">
              {weather.condition}
            </span>
          </button>

          {expanded === 'weather' && (
            <div className="absolute top-full mt-2 left-0 z-50 min-w-[220px] rounded-xl border border-border bg-card shadow-lg p-3.5 space-y-2.5 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Thermometer className="h-3.5 w-3.5 shrink-0" />
                <span>Feels like <span className="font-medium text-foreground">{weather.feelsLikeF}°F</span></span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Droplets className="h-3.5 w-3.5 shrink-0" />
                <span>Humidity <span className="font-medium text-foreground">{weather.humidity}%</span></span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Wind className="h-3.5 w-3.5 shrink-0" />
                <span>Wind <span className="font-medium text-foreground">{weather.windMph} mph</span></span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Air Quality chip ── */}
      {airQuality && aqiColors && (
        <div className="relative">
          <button
            onClick={() => setExpanded(expanded === 'aqi' ? null : 'aqi')}
            className={`flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm transition-all duration-300 hover:shadow-sm ${aqiColors.bg} ${aqiColors.border}`}
          >
            <span className={`h-2 w-2 rounded-full shrink-0 ${aqiColors.dot}`} />
            <Leaf className={`h-3.5 w-3.5 shrink-0 ${aqiColors.text}`} />
            <span className={`font-semibold ${aqiColors.text}`}>AQI {airQuality.aqi}</span>
            <span className={`hidden sm:inline text-xs ${aqiColors.text} opacity-80`}>
              {airQuality.category.replace(' air quality', '').replace(' Air Quality', '')}
            </span>
          </button>

          {expanded === 'aqi' && (
            <div className="absolute top-full mt-2 left-0 z-50 min-w-[240px] rounded-xl border border-border bg-card shadow-lg p-3.5 space-y-2 text-sm">
              {airQuality.dominantPollutant && (
                <p className="text-muted-foreground">
                  Main pollutant:{' '}
                  <span className="font-medium text-foreground uppercase">
                    {airQuality.dominantPollutant}
                  </span>
                </p>
              )}
              {airQuality.healthRecommendation && (
                <p className="text-muted-foreground leading-snug">
                  {airQuality.healthRecommendation}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
