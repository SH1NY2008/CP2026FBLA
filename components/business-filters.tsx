'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

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

export function BusinessFilters({
  onCategoryChange,
  onRadiusChange,
  onPriceChange,
}: BusinessFiltersProps) {
  const [selectedCategory, setSelectedCategory] = useState('restaurant');
  const [radius, setRadius] = useState(5); // km
  const [selectedPrices, setSelectedPrices] = useState<number[]>([1, 2, 3, 4]);

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
    let newPrices: number[];
    if (selectedPrices.includes(priceValue)) {
      newPrices = selectedPrices.filter((p) => p !== priceValue);
    } else {
      newPrices = [...selectedPrices, priceValue].sort();
    }
    setSelectedPrices(newPrices);
    onPriceChange(newPrices);
  };

  return (
    <Card className="p-6 bg-card border border-border sticky top-32">
      <div className="space-y-6">
        {/* Category Filter */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-foreground">Category</h3>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleCategoryChange(category.id)}
                className={selectedCategory === category.id ? 'bg-accent text-accent-foreground' : 'bg-secondary text-foreground border-border hover:bg-muted'}
              >
                {category.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Radius Filter */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-foreground">
            Search Radius: <span className="text-accent">{radius} km</span>
          </h3>
          <Slider
            value={[radius]}
            onValueChange={handleRadiusChange}
            min={1}
            max={50}
            step={1}
            className="w-full"
          />
        </div>

        {/* Price Filter */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-foreground">Price Range</h3>
          <div className="flex gap-2">
            {PRICE_LEVELS.map((price) => (
              <Button
                key={price.value}
                variant={
                  selectedPrices.includes(price.value) ? 'default' : 'outline'
                }
                size="sm"
                onClick={() => handlePriceToggle(price.value)}
                className={selectedPrices.includes(price.value) ? 'bg-accent text-accent-foreground' : 'bg-secondary text-foreground border-border hover:bg-muted'}
              >
                {price.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
