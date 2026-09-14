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
    <article className={cn('group relative', className)}>
      {/* The poster frame is fixed; only the image inside it scales on hover. */}
      <div className="relative overflow-hidden rounded-card border border-hairline bg-surface">
        <Link
          to={`/movies/${movie.id}`}
          className="block aspect-2/3 focus-visible:outline-none"
          aria-label={`${movie.title}${year ? `, ${year}` : ''}`}
        >
          <PosterImage
            path={movie.posterPath}
            title={movie.title}
            priority={priority}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105 group-focus-within:scale-105"
          />
          <span className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-screen/90 to-transparent" />
          <span className="absolute bottom-2.5 left-2.5">
            <Rating value={movie.rating} />
          </span>
        </Link>

        <FavoriteButton movie={movie} className="absolute right-2 top-2" />
      </div>

      <div className="mt-2.5 space-y-0.5">
        <h3 className="truncate text-sm font-semibold leading-tight">
          <Link to={`/movies/${movie.id}`} className="hover:text-accent-soft">
            {movie.title}
          </Link>
        </h3>
        <p className="truncate text-xs text-muted">
          {[year, genre].filter(Boolean).join(' · ') || 'Details unavailable'}
        </p>
      </div>
    </article>
  );
});
