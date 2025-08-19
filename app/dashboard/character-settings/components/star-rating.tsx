'use client';

import { Star } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  description?: string;
}

export function StarRating({ value, onChange, label = "별점", description }: StarRatingProps) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <Label>{label}</Label>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="flex gap-1">
        {stars.map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 hover:scale-110 transition-transform"
          >
            <Star
              className={`h-6 w-6 transition-colors ${
                star <= value
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300 hover:text-yellow-300'
              }`}
            />
          </button>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        선택된 별점: {value}개
      </p>
    </div>
  );
}
