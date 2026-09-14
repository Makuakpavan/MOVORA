import { useMemo } from 'react';
import { Hero } from '@/components/movie/Hero';
import { MovieRail } from '@/components/movie/MovieRail';
import { SearchBar } from '@/components/search/SearchBar';
import { useMovieCollection } from '@/hooks/useMovies';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function HomePage() {
  useDocumentTitle(undefined);

  const trending = useMovieCollection('trending');
  const topRated = useMovieCollection('top_rated');
  const recent = useMovieCollection('recent');

  // The best-rated trending film leads the page.
  const featured = useMemo(() => {
    const items = trending.data?.items ?? [];
    if (items.length === 0) return undefined;
    return [...items].sort((a, b) => b.rating - a.rating)[0];
  }, [trending.data]);

  return (
    <>
      <Hero movie={featured} isLoading={trending.isLoading} />

      <div className="mx-auto max-w-7xl space-y-14 px-4 py-12 sm:px-6 lg:px-8">
        <section aria-labelledby="find-a-film" className="mx-auto max-w-2xl text-center">
          <h2 id="find-a-film" className="text-2xl sm:text-3xl">
            Find a film
          </h2>
          <p className="mt-2 text-sm text-muted">
            Type a title. Filter by genre, year or rating once the results land.
          </p>
          <SearchBar size="lg" className="mt-5" />
        </section>

        <MovieRail
          title="Trending this week"
          description="What people are watching right now."
          movies={trending.data?.items}
          isLoading={trending.isLoading}
          error={trending.error}
          onRetry={() => void trending.refetch()}
          viewAllHref="/discover?collection=trending"
        />

        <MovieRail
          title="Top rated"
          description="Consistently high scores across thousands of votes."
          movies={topRated.data?.items}
          isLoading={topRated.isLoading}
          error={topRated.error}
          onRetry={() => void topRated.refetch()}
          viewAllHref="/discover?collection=top_rated"
        />

        <MovieRail
          title="Recently added"
          description="New arrivals in the catalogue."
          movies={recent.data?.items}
          isLoading={recent.isLoading}
          error={recent.error}
          onRetry={() => void recent.refetch()}
          viewAllHref="/discover?collection=recent"
        />
      </div>
    </>
  );
}
