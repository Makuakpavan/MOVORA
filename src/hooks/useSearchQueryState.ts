import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { MovieQuery, SortOption } from '@/types/movie';

const SORTS: SortOption[] = ['popularity', 'rating', 'release_date', 'title'];

function toInt(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

/**
 * Keeps search state in the URL so results are shareable, bookmarkable and
 * survive a refresh: /search?q=inception&page=2&genre=878&sort=rating
 */
export function useSearchQueryState() {
  const [searchParams, setSearchParams] = useSearchParams();

  const query = useMemo<MovieQuery>(() => {
    const sortParam = searchParams.get('sort') as SortOption | null;
    return {
      q: searchParams.get('q') ?? '',
      page: toInt(searchParams.get('page')) ?? 1,
      genre: toInt(searchParams.get('genre')),
      year: toInt(searchParams.get('year')),
      minRating: toInt(searchParams.get('minRating')),
      sort: sortParam && SORTS.includes(sortParam) ? sortParam : 'popularity',
    };
  }, [searchParams]);

  /** Merges a patch into the URL. Any change except `page` resets to page 1. */
  const updateQuery = useCallback(
    (patch: Partial<MovieQuery>) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);

          for (const [key, value] of Object.entries(patch)) {
            if (value === undefined || value === '' || value === null) next.delete(key);
            else next.set(key, String(value));
          }

          if (!('page' in patch)) next.delete('page');
          if (next.get('page') === '1') next.delete('page');

          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const clearFilters = useCallback(() => {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams();
        const q = current.get('q');
        if (q) next.set('q', q);
        return next;
      },
      { replace: true },
    );
  }, [setSearchParams]);

  const hasActiveFilters = Boolean(query.genre || query.year || query.minRating);

  return { query, updateQuery, clearFilters, hasActiveFilters };
}
