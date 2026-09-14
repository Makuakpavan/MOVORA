import { toMovieDetails, toMovieSummary, toPaginatedMovies } from './adapters';
import type { Paginated } from '@/types/api';
import type {
  Genre,
  MovieCollection,
  MovieDetails,
  MovieQuery,
  MovieSummary,
} from '@/types/movie';

/** (removed) helper for serializing query params — unused */

export const movieApi = {
  /** GET /api/movies?collection=trending */
  async list(collection: MovieCollection): Promise<Paginated<MovieSummary>> {
    const key = import.meta.env.VITE_TMDB_API_KEY;
    if (!key) throw new Error('Missing TMDB API key');

    // Map collection names to TMDB endpoints
    if (collection === 'trending') {
      const res = await fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${key}`);
      if (!res.ok) throw new Error(res.statusText || 'Failed to fetch trending');
      const body = await res.json();
      return toPaginatedMovies(body);
    }

    if (collection === 'top_rated') {
      const res = await fetch(`https://api.themoviedb.org/3/movie/top_rated?api_key=${key}`);
      if (!res.ok) throw new Error(res.statusText || 'Failed to fetch top rated');
      const body = await res.json();
      return toPaginatedMovies(body);
    }

    // recent -> now playing as a reasonable default
    const res = await fetch(`https://api.themoviedb.org/3/movie/now_playing?api_key=${key}`);
    if (!res.ok) throw new Error(res.statusText || 'Failed to fetch recent');
    const body = await res.json();
    return toPaginatedMovies(body);
  },

  /** GET /api/movies/search?q=inception&page=1 */
  async search(query: MovieQuery): Promise<Paginated<MovieSummary>> {
    const key = import.meta.env.VITE_TMDB_API_KEY;
    if (!key) throw new Error('Missing TMDB API key');
    const q = encodeURIComponent(query.q ?? '');
    const page = query.page ?? 1;
    const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${key}&query=${q}&page=${page}`);
    if (!res.ok) throw new Error(res.statusText || 'Failed to search');
    const body = await res.json();
    return toPaginatedMovies(body);
  },

  /** GET /api/movies/:id */
  async getById(id: string): Promise<MovieDetails> {
    const key = import.meta.env.VITE_TMDB_API_KEY;
    if (!key) throw new Error('Missing TMDB API key');
    const res = await fetch(
      `https://api.themoviedb.org/3/movie/${id}?api_key=${key}&append_to_response=credits,videos`,
    );
    if (!res.ok) throw new Error(res.statusText || 'Failed to fetch movie');
    const body = await res.json();
    return toMovieDetails(body as Record<string, unknown>);
  },

  /** GET /api/movies/:id/similar */
  async getSimilar(id: string): Promise<MovieSummary[]> {
    const key = import.meta.env.VITE_TMDB_API_KEY;
    if (!key) throw new Error('Missing TMDB API key');
    const res = await fetch(`https://api.themoviedb.org/3/movie/${id}/similar?api_key=${key}`);
    if (!res.ok) throw new Error(res.statusText || 'Failed to fetch similar');
    const body = await res.json();
    return toPaginatedMovies(body).items;
  },

  /** GET /api/movies/genres — optional; the UI falls back to a static list. */
  async getGenres(): Promise<Genre[]> {
    const key = import.meta.env.VITE_TMDB_API_KEY;
    if (!key) throw new Error('Missing TMDB API key');
    const res = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${key}`);
    if (!res.ok) throw new Error(res.statusText || 'Failed to fetch genres');
    const body = await res.json();
    const list = (body && body.genres) || [];
    return list.map((entry: any, index: number) => ({ id: entry.id ?? index, name: entry.name ?? 'Unknown' }));
  },

  /** Exposed for tests and for reusing the mapper elsewhere. */
  mapSummary: toMovieSummary,
};
