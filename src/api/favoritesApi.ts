import { apiClient, unwrap } from './client';
import { toPaginatedMovies } from './adapters';
import type { MovieSummary } from '@/types/movie';

export const favoritesApi = {
  /** GET /api/favorites */
  async list(): Promise<MovieSummary[]> {
    const response = await apiClient.get('/favorites');
    return toPaginatedMovies(unwrap(response)).items;
  },

  /** POST /api/favorites/:movieId */
  async add(movieId: string): Promise<void> {
    await apiClient.post(`/favorites/${movieId}`);
  },

  /** DELETE /api/favorites/:movieId */
  async remove(movieId: string): Promise<void> {
    await apiClient.delete(`/favorites/${movieId}`);
  },
};
