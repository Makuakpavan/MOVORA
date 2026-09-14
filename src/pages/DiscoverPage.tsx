import { useSearchParams } from 'react-router-dom';
import { MovieGrid } from '@/components/movie/MovieGrid';
import { ErrorState } from '@/components/ui/ErrorState';
import { useMovieCollection } from '@/hooks/useMovies';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { cn } from '@/utils/cn';
import type { MovieCollection } from '@/types/movie';

const COLLECTIONS: Array<{ value: MovieCollection; label: string }> = [
  { value: 'trending', label: 'Trending' },
  { value: 'top_rated', label: 'Top rated' },
  { value: 'recent', label: 'Recently added' },
];

export default function DiscoverPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const param = searchParams.get('collection') as MovieCollection | null;
  const collection: MovieCollection =
    param && COLLECTIONS.some((c) => c.value === param) ? param : 'trending';

  useDocumentTitle('Discover');
  const { data, isLoading, error, refetch } = useMovieCollection(collection);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl sm:text-4xl">Discover</h1>
      <p className="mt-2 text-sm text-muted">
        Browse the catalogue without searching for anything in particular.
      </p>

      <div
        role="tablist"
        aria-label="Movie collections"
        className="mt-6 flex flex-wrap gap-2"
      >
        {COLLECTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={collection === option.value}
            onClick={() => setSearchParams({ collection: option.value })}
            className={cn(
              'rounded-full border px-4 py-2 text-sm transition-colors',
              collection === option.value
                ? 'border-accent bg-accent/15 text-chalk'
                : 'border-hairline bg-surface text-muted hover:text-chalk',
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {error ? (
          <ErrorState error={error} onRetry={() => void refetch()} />
        ) : (
          <MovieGrid
            movies={data?.items ?? []}
            isLoading={isLoading}
            label={`${collection} movies`}
          />
        )}
      </div>
    </div>
  );
}
