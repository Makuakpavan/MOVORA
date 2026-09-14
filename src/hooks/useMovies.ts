import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { movieApi } from '@/api/movieApi';
import { FALLBACK_GENRES } from '@/utils/constants';
import type {
  Genre,
  MovieCollection,
  MovieQuery,
} from '@/types/movie';

export const movieKeys = {
  all: ['movies'] as const,
  collection: (name: MovieCollection) => ['movies', 'collection', name] as const,
  search: (query: MovieQuery) => ['movies', 'search', query] as const,
  detail: (id: string) => ['movies', 'detail', id] as const,
  similar: (id: string) => ['movies', 'similar', id] as const,
  genres: ['movies', 'genres'] as const,
};

export function useMovieCollection(collection: MovieCollection) {
  return useQuery({
    queryKey: movieKeys.collection(collection),
    queryFn: () => movieApi.list(collection),
    staleTime: 5 * 60 * 1000,
  });
}

export function useMovieSearch(query: MovieQuery, enabled = true) {
  return useQuery({
    queryKey: movieKeys.search(query),
    queryFn: () => movieApi.search(query),
    enabled: enabled && Boolean(query.q?.trim()),
    // Keeps the old page on screen while the next one loads, so the grid
    // doesn't collapse to skeletons on every page change.
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });
}

export function useMovieDetails(id: string | undefined) {
  return useQuery({
    queryKey: movieKeys.detail(id ?? ''),
    queryFn: () => movieApi.getById(id as string),
    enabled: Boolean(id),
    staleTime: 10 * 60 * 1000,
    retry: (failureCount, error) => {
      // Never retry a 404 — the movie genuinely isn't there.
      if ((error as { status?: number }).status === 404) return false;
      return failureCount < 2;
    },
  });
}

export function useSimilarMovies(id: string | undefined) {
  return useQuery({
    queryKey: movieKeys.similar(id ?? ''),
    queryFn: () => movieApi.getSimilar(id as string),
    enabled: Boolean(id),
    staleTime: 10 * 60 * 1000,
  });
}

/** Falls back to a static genre list if the backend has no genres endpoint. */
export function useGenres(): Genre[] {
  const { data } = useQuery({
    queryKey: movieKeys.genres,
    queryFn: () => movieApi.getGenres(),
    staleTime: Infinity,
    retry: false,
  });

  return data?.length ? data : FALLBACK_GENRES;
}
