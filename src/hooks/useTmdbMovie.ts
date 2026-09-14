import { useQuery } from '@tanstack/react-query';
import { toMovieDetails, toPaginatedMovies } from '@/api/adapters';
import type { MovieDetails, MovieSummary } from '@/types/movie';
import { ApiError } from '@/types/api';

function getKey() {
  return import.meta.env.VITE_TMDB_API_KEY;
}

async function fetchTmdbMovie(id: string): Promise<MovieDetails> {
  const key = getKey();
  if (!key) throw new ApiError({ message: 'Missing TMDB API key', status: 0 });

  const res = await fetch(
    `https://api.themoviedb.org/3/movie/${id}?api_key=${key}&append_to_response=credits,videos`,
  );

  if (!res.ok) throw new ApiError({ message: res.statusText || 'Failed', status: res.status });

  const body = await res.json();
  return toMovieDetails(body as Record<string, unknown>);
}

async function fetchTmdbSimilar(id: string): Promise<MovieSummary[]> {
  const key = getKey();
  if (!key) throw new ApiError({ message: 'Missing TMDB API key', status: 0 });

  const res = await fetch(`https://api.themoviedb.org/3/movie/${id}/similar?api_key=${key}`);
  if (!res.ok) throw new ApiError({ message: res.statusText || 'Failed', status: res.status });

  const body = await res.json();
  return toPaginatedMovies(body).items;
}

export function useTmdbMovie(id?: string) {
  return useQuery<MovieDetails | undefined, unknown>({
    queryKey: ['tmdb', 'movie', id ?? ''],
    queryFn: () => fetchTmdbMovie(id as string),
    enabled: Boolean(id),
    staleTime: 10 * 60 * 1000,
    retry: (failureCount, error) => {
      if ((error as { status?: number })?.status === 404) return false;
      return failureCount < 2;
    },
  });
}

export function useTmdbSimilar(id?: string) {
  return useQuery<MovieSummary[] | undefined, unknown>({
    queryKey: ['tmdb', 'similar', id ?? ''],
    queryFn: () => fetchTmdbSimilar(id as string),
    enabled: Boolean(id),
    staleTime: 10 * 60 * 1000,
  });
}
