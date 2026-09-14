import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { MovieCard } from './MovieCard';
import { MovieCardSkeleton } from './MovieCardSkeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import type { MovieSummary } from '@/types/movie';

interface MovieRailProps {
  title: string;
  description?: string;
  movies: MovieSummary[] | undefined;
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
  viewAllHref?: string;
}

/** A horizontally scrollable row of posters. Scrolls with touch, wheel or Tab. */
export function MovieRail({
  title,
  description,
  movies,
  isLoading,
  error,
  onRetry,
  viewAllHref,
}: MovieRailProps) {
  return (
    <section className="space-y-4" aria-labelledby={`rail-${slug(title)}`}>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 id={`rail-${slug(title)}`} className="text-xl sm:text-2xl">
            {title}
          </h2>
          {description && (
            <p className="mt-1 text-sm text-muted">{description}</p>
          )}
        </div>

        {viewAllHref && (
          <Link
            to={viewAllHref}
            className="inline-flex shrink-0 items-center gap-1 text-sm text-muted hover:text-chalk"
          >
            See all
            <ChevronRight aria-hidden className="size-4" />
          </Link>
        )}
      </div>

      {error ? (
        <ErrorState error={error} onRetry={onRetry} />
      ) : (
        <ul className="rail list-none">
          {isLoading
            ? Array.from({ length: 8 }, (_, i) => (
                <li key={i} className="w-36 shrink-0 snap-start sm:w-44">
                  <MovieCardSkeleton />
                </li>
              ))
            : movies?.map((movie) => (
                <li
                  key={movie.id}
                  className="w-36 shrink-0 snap-start sm:w-44"
                >
                  <MovieCard movie={movie} />
                </li>
              ))}
        </ul>
      )}
    </section>
  );
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}
