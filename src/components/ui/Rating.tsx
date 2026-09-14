import { Star } from 'lucide-react';
import { formatRating } from '@/utils/format';
import { cn } from '@/utils/cn';

interface RatingProps {
  value: number;
  className?: string;
  size?: 'sm' | 'md';
}

export function Rating({ value, className, size = 'sm' }: RatingProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium text-star',
        size === 'sm' ? 'text-xs' : 'text-sm',
        className,
      )}
    >
      <Star
        aria-hidden
        className={size === 'sm' ? 'size-3.5' : 'size-4'}
        fill="currentColor"
        strokeWidth={0}
      />
      <span className="sr-only">Rated </span>
      {formatRating(value)}
      <span className="sr-only"> out of 10</span>
    </span>
  );
}
