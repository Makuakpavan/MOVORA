import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { HeartOff, Search } from 'lucide-react';
import { MovieGrid } from '@/components/movie/MovieGrid';
import { StateMessage } from '@/components/ui/StateMessage';
import { ErrorState } from '@/components/ui/ErrorState';
import { Field } from '@/components/ui/Field';
import { useFavorites } from '@/hooks/useFavorites';
import { useGenres } from '@/hooks/useMovies';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function FavoritesPage() {
  useDocumentTitle('Your favourites');

  const { data, isLoading, error, refetch } = useFavorites();
  const genres = useGenres();
  const [filter, setFilter] = useState('');
  const [genreId, setGenreId] = useState('');

  const visible = useMemo(() => {
    const term = filter.trim().toLowerCase();
    return (data ?? []).filter((movie) => {
      const matchesTerm = !term || movie.title.toLowerCase().includes(term);
      const matchesGenre =
        !genreId || movie.genres.some((g) => String(g.id) === genreId);
      return matchesTerm && matchesGenre;
    });
  }, [data, filter, genreId]);

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <ErrorState error={error} onRetry={() => void refetch()} />
      </div>
    );
  }

  const isEmpty = !isLoading && (data?.length ?? 0) === 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl">Your favourites</h1>
          <p className="mt-2 text-sm text-muted">
            {isLoading
              ? 'Loading your list…'
              : `${data?.length ?? 0} ${data?.length === 1 ? 'film' : 'films'} saved.`}
          </p>
        </div>
      </div>

      {isEmpty ? (
        <StateMessage
          icon={<HeartOff className="size-6" />}
          title="Your list is empty"
          description="Tap the heart on any poster and the film lands here."
        >
          <Link
            to="/discover"
            className="inline-flex h-11 items-center rounded-full bg-accent px-5 text-sm font-medium text-chalk transition-colors hover:bg-accent-soft"
          >
            Browse films
          </Link>
        </StateMessage>
      ) : (
        <>
          <div className="mt-7 grid gap-3 sm:max-w-xl sm:grid-cols-2">
            <Field
              label="Filter your list"
              placeholder="Title contains…"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              icon={<Search className="size-4" />}
            />
            <div className="flex flex-col gap-1.5">
              <label htmlFor="favorite-genre" className="text-sm font-medium text-chalk">
                Genre
              </label>
              <select
                id="favorite-genre"
                value={genreId}
                onChange={(event) => setGenreId(event.target.value)}
                className="h-11 rounded-xl border border-hairline bg-surface px-3.5 text-sm text-chalk focus:border-accent focus:outline-none"
              >
                <option value="">All genres</option>
                {genres.map((genre) => (
                  <option key={genre.id} value={genre.id}>
                    {genre.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-9">
            {!isLoading && visible.length === 0 ? (
              <StateMessage
                icon={<Search className="size-6" />}
                title="Nothing in your list matches"
                description="Widen the filter to see the rest of your saved films."
                action={{
                  label: 'Reset filters',
                  onClick: () => {
                    setFilter('');
                    setGenreId('');
                  },
                }}
              />
            ) : (
              <MovieGrid
                movies={visible}
                isLoading={isLoading}
                skeletonCount={6}
                label="Saved films"
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
