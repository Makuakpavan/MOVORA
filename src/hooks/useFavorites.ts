import { useCallback, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { favoritesApi } from '@/api/favoritesApi';
import { useAuth } from './useAuth';
import type { MovieSummary } from '@/types/movie';

export const favoriteKeys = {
  all: ['favorites'] as const,
};

export function useFavorites() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: favoriteKeys.all,
    queryFn: () => favoritesApi.list(),
    enabled: isAuthenticated,
    staleTime: 30 * 1000,
  });
}

/**
 * Toggling is optimistic: the heart fills the instant it's clicked, and rolls
 * back if the server rejects it. `movie` is optional — pass it when toggling
 * from a card so the favourites list updates without a refetch.
 */
export function useToggleFavorite() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const { data: favorites } = useFavorites();

  const favoriteIds = useMemo(
    () => new Set((favorites ?? []).map((movie) => movie.id)),
    [favorites],
  );

  const mutation = useMutation({
    mutationFn: async ({
      movieId,
      isFavorite,
    }: {
      movieId: string;
      isFavorite: boolean;
      movie?: MovieSummary;
    }) => {
      if (isFavorite) await favoritesApi.remove(movieId);
      else await favoritesApi.add(movieId);
    },

    onMutate: async ({ movieId, isFavorite, movie }) => {
      await queryClient.cancelQueries({ queryKey: favoriteKeys.all });
      const previous = queryClient.getQueryData<MovieSummary[]>(favoriteKeys.all);

      queryClient.setQueryData<MovieSummary[]>(favoriteKeys.all, (current = []) => {
        if (isFavorite) return current.filter((m) => m.id !== movieId);
        if (movie && !current.some((m) => m.id === movieId)) return [movie, ...current];
        return current;
      });

      return { previous };
    },

    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(favoriteKeys.all, context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: favoriteKeys.all });
    },
  });

  const isFavorite = useCallback(
    (movieId: string) => favoriteIds.has(movieId),
    [favoriteIds],
  );

  const toggle = useCallback(
    (movie: MovieSummary) =>
      mutation.mutate({
        movieId: movie.id,
        isFavorite: favoriteIds.has(movie.id),
        movie,
      }),
    [mutation, favoriteIds],
  );

  return {
    isFavorite,
    toggle,
    isToggling: mutation.isPending,
    canFavorite: isAuthenticated,
  };
}
