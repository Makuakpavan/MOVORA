import { MovieCard } from './MovieCard';
import { MovieCardSkeleton } from './MovieCardSkeleton';
import type { MovieSummary } from '@/types/movie';

interface MovieGridProps {
  movies: MovieSummary[];
  isLoading?: boolean;
  skeletonCount?: number;
  /** Describes the grid for screen readers, e.g. "Search results". */
  label: string;
}

/** 2 columns on phones, 3–4 on tablets, 5–6 on desktop. */
const GRID =
  'grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6';

export function MovieGrid({
  movies,
  isLoading,
  skeletonCount = 12,
  label,
}: MovieGridProps) {
  if (isLoading) {
    return (
      <div className={GRID} aria-busy="true" aria-label={`Loading ${label}`}>
        {Array.from({ length: skeletonCount }, (_, i) => (
          <MovieCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className={GRID} aria-label={label} role="list">
      {movies.map((movie, index) => (
        <div role="listitem" key={movie.id}>
          <MovieCard movie={movie} priority={index < 6} />
        </div>
      ))}
    </div>
  );
}
