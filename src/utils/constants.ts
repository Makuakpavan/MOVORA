import type { SortOption } from '@/types/movie';

const _rawApiBase = import.meta.env.VITE_API_BASE_URL;
export const API_BASE_URL = (() => {
  if (!_rawApiBase) return 'https://api.themoviedb.org/3';
  // Ensure the configured base includes the `/api` path segment so calls
  // like `apiClient.get('/auth/me')` resolve to `/api/auth/me` on hosted
  // environments (Vercel etc.) where the frontend and API share a domain.
  const trimmed = _rawApiBase.replace(/\/+$/g, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
})();


// export const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL ?? 'https://image.tmdb.org/t/p';
export const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export const RESULTS_PER_PAGE = 20;
export const SEARCH_DEBOUNCE_MS = 400;

export const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: 'popularity', label: 'Most popular' },
  { value: 'rating', label: 'Highest rated' },
  { value: 'release_date', label: 'Newest first' },
  { value: 'title', label: 'Title A–Z' },
];

/**
 * Fallback genre list used to render the filter before the backend responds.
 * `useGenres()` replaces it with GET /api/movies/genres when that endpoint exists.
 */
export const FALLBACK_GENRES = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Science Fiction' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' },
];

const CURRENT_YEAR = new Date().getFullYear();

/** 1950 → current year, newest first. */
export const YEAR_OPTIONS = Array.from(
  { length: CURRENT_YEAR - 1949 },
  (_, i) => CURRENT_YEAR - i,
);
