import { memo } from 'react';
import { Link } from 'react-router-dom';
import { PosterImage } from './PosterImage';
import { FavoriteButton } from './FavoriteButton';
import { Rating } from '@/components/ui/Rating';
import { releaseYear } from '@/utils/format';
import { cn } from '@/utils/cn';
import type { MovieSummary } from '@/types/movie';

interface MovieCardProps {
  movie: MovieSummary;
  priority?: boolean;
  className?: string;
}

/**
 * Memoised: a favourites toggle re-renders the grid, and without this every
 * card in view would re-render with it.
 */
export const MovieCard = memo(function MovieCard({
  movie,
  priority,
  className,
}: MovieCardProps) {
  const year = releaseYear(movie.releaseDate);
  const genre = movie.genres[0]?.name;

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-card border border-hairline bg-surface/80 shadow-[0_12px_32px_rgba(0,0,0,0.32)] transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_22px_50px_rgba(227,20,60,0.18)]',
        className,
      )}
    >
      <div className="relative overflow-hidden">
        <Link
          to={`/movies/${movie.id}`}
          className="relative block aspect-2/3 overflow-hidden focus-visible:outline-none"
          aria-label={`${movie.title}${year ? `, ${year}` : ''}`}
        >
          <PosterImage
            path={movie.posterPath}
            title={movie.title}
            priority={priority}
            className="size-full object-cover transition-transform duration-400 group-hover:scale-[1.06] group-focus-within:scale-[1.06]"
          />
          <div className="absolute inset-0 bg-linear-to-t from-screen via-screen/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-3">
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/30 px-2 py-1 backdrop-blur-sm">
              <Rating value={movie.rating} />
            </span>
            <span className="inline-flex size-8 items-center justify-center rounded-full border border-white/10 bg-black/35 text-xs text-chalk shadow-lg backdrop-blur-sm">
              ▶
            </span>
          </div>
        </Link>

        <FavoriteButton
          movie={movie}
          className="absolute right-3 top-3 z-10 border border-white/10 bg-black/40 text-chalk shadow-lg backdrop-blur-sm hover:bg-black/55"
        />
      </div>

      <div className="flex flex-1 flex-col gap-2 px-3 pb-3 pt-3">
        <h3 className="line-clamp-2 text-base font-semibold leading-tight tracking-[-0.02em] text-chalk">
          <Link to={`/movies/${movie.id}`} className="transition-colors hover:text-accent-soft">
            {movie.title}
          </Link>
        </h3>
        <p className="mt-auto text-xs font-medium uppercase tracking-[0.14em] text-muted/90">
          {[year, genre].filter(Boolean).join(' · ') || 'Details unavailable'}
        </p>
      </div>
    </article>
  );
});
