'use client';

import { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface BusinessFiltersProps {
  onCategoryChange: (category: string) => void;
  onRadiusChange: (radius: number) => void;
  onPriceChange: (prices: number[]) => void;
}

const CATEGORIES = [
  { id: 'restaurant', label: 'Restaurants' },
  { id: 'shopping', label: 'Retail' },
  { id: 'services', label: 'Services' },
  { id: 'entertainment', label: 'Entertainment' },
];

const PRICE_LEVELS = [
  { value: 1, label: '$' },
  { value: 2, label: '$$' },
  { value: 3, label: '$$$' },
  { value: 4, label: '$$$$' },
];

const DEFAULT_RADIUS = 5;
const DEFAULT_PRICES = [1, 2, 3, 4];

export function BusinessFilters({
  onCategoryChange,
  onRadiusChange,
  onPriceChange,
}: BusinessFiltersProps) {
  const [selectedCategory, setSelectedCategory] = useState('restaurant');
  const [radius, setRadius] = useState(DEFAULT_RADIUS);
  const [selectedPrices, setSelectedPrices] = useState<number[]>(DEFAULT_PRICES);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    onCategoryChange(categoryId);
  };

  const handleRadiusChange = (value: number[]) => {
    const newRadius = value[0];
    setRadius(newRadius);
    onRadiusChange(newRadius);
  };

  const handlePriceToggle = (priceValue: number) => {
    const newPrices = selectedPrices.includes(priceValue)
      ? selectedPrices.filter((p) => p !== priceValue)
      : [...selectedPrices, priceValue].sort();
    if (newPrices.length === 0) return;
    setSelectedPrices(newPrices);
    onPriceChange(newPrices);
  };

  const clearAll = () => {
    setRadius(DEFAULT_RADIUS);
    setSelectedPrices(DEFAULT_PRICES);
    onRadiusChange(DEFAULT_RADIUS);
    onPriceChange(DEFAULT_PRICES);
  };

  const hasActiveFilters =
    radius !== DEFAULT_RADIUS || selectedPrices.length < DEFAULT_PRICES.length;

  type Chip = { id: string; label: string; onRemove: () => void };
  const activeChips: Chip[] = [
    ...(radius !== DEFAULT_RADIUS
      ? [{
          id: 'radius',
          label: `Within ${radius} km`,
          onRemove: () => { setRadius(DEFAULT_RADIUS); onRadiusChange(DEFAULT_RADIUS); },
        }]
      : []),
    ...DEFAULT_PRICES
      .filter((p) => !selectedPrices.includes(p))
      .map((p) => ({
        id: `excl-${p}`,
        label: `Excl. ${'$'.repeat(p)}`,
        onRemove: () => {
          const next = [...selectedPrices, p].sort();
          setSelectedPrices(next);
          onPriceChange(next);
        },
      })),
  ];

  return (
    <div className="space-y-5">
        {/* Active filter chips */}
        {hasActiveFilters && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Active filters
              </span>
              <button
                onClick={clearAll}
                className="text-xs text-accent hover:text-accent/80 font-medium transition-colors"
              >
                Clear all
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {activeChips.map((chip) => (
                <Badge
                  key={chip.id}
                  variant="secondary"
                  className="gap-1 pl-2.5 pr-1.5 py-1 text-xs bg-accent/10 text-accent border border-accent/20"
                >
                  {chip.label}
                  <button
                    onClick={chip.onRemove}
                    className="ml-0.5 rounded-full hover:bg-accent/20 p-0.5 transition-colors"
                    aria-label="Remove filter"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Category */}
        <div>
          <h3 className="text-xs font-semibold mb-2.5 text-muted-foreground uppercase tracking-wide">
            Category
          </h3>
          <div className="flex flex-col gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-left transition-all duration-200 ${
                  selectedCategory === cat.id
                    ? 'bg-accent text-accent-foreground shadow-sm'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Radius */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Distance
            </h3>
            <span className="text-xs font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-full">
              Within {radius} km
            </span>
          </div>
          <Slider
            value={[radius]}
            onValueChange={handleRadiusChange}
            min={1}
            max={50}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between mt-1.5">
            <span className="text-xs text-muted-foreground">1 km</span>
            <span className="text-xs text-muted-foreground">50 km</span>
          </div>
        </div>

        {/* Price */}
        <div>
          <h3 className="text-xs font-semibold mb-2.5 text-muted-foreground uppercase tracking-wide">
            Price
          </h3>
          <div className="grid grid-cols-4 gap-1.5">
            {PRICE_LEVELS.map((price) => (
              <button
                key={price.value}
                onClick={() => handlePriceToggle(price.value)}
                className={`py-2 rounded-lg text-sm font-medium text-center transition-all duration-200 ${
                  selectedPrices.includes(price.value)
                    ? 'bg-accent text-accent-foreground shadow-sm'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {price.label}
              </button>
            ))}
          </div>
        </div>
    </div>
  );
}
