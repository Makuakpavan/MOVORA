import { Link } from 'react-router-dom';
import { Info, Play } from 'lucide-react';
import { PosterImage } from './PosterImage';
import { FavoriteButton } from './FavoriteButton';
import { Rating } from '@/components/ui/Rating';
import { Skeleton } from '@/components/ui/Skeleton';
import { releaseYear } from '@/utils/format';
import type { MovieSummary } from '@/types/movie';

interface HeroProps {
  movie: MovieSummary | undefined;
  isLoading: boolean;
}

/**
 * The page opener: one film, shown at the size a film deserves. The backdrop is
 * the only full-bleed image in the app, which is what makes it read as the hero.
 */
export function Hero({ movie, isLoading }: HeroProps) {
  if (isLoading || !movie) {
    return <Skeleton className="h-[62vh] min-h-100 w-full rounded-none" />;
  }

  const year = releaseYear(movie.releaseDate);

  return (
    <section
      className="relative isolate flex min-h-100 items-end overflow-hidden sm:h-[62vh]"
      aria-labelledby="hero-title"
    >
      <PosterImage
        path={movie.backdropPath ?? movie.posterPath}
        title={movie.title}
        size="backdrop"
        priority
        className="absolute inset-0 -z-10 size-full object-cover object-top"
      />
      {/* Two scrims: one up from the bottom for the text, one in from the left. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-linear-to-t from-screen via-screen/75 to-screen/20"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-linear-to-r from-screen/90 via-transparent to-transparent"
      />

      <div className="mx-auto w-full max-w-7xl px-4 pb-12 pt-28 sm:px-6 sm:pb-16 lg:px-8">
        <div className="max-w-2xl space-y-5 rounded-[2rem] border border-white/10 bg-black/10 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-[2px] sm:p-6">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-accent-soft">
            Featured today
          </p>

          <h1
            id="hero-title"
            className="max-w-xl text-4xl leading-[1.02] tracking-[-0.05em] text-chalk drop-shadow-[0_10px_32px_rgba(0,0,0,0.7)] sm:text-5xl lg:text-6xl"
          >
            {movie.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted">
            <Rating value={movie.rating} size="md" />
            {year && (
              <>
                <span aria-hidden className="h-4 w-px bg-hairline" />
                <span>{year}</span>
              </>
            )}
            {movie.genres.length > 0 && (
              <>
                <span aria-hidden className="h-4 w-px bg-hairline" />
                <span>{movie.genres.slice(0, 3).map((g) => g.name).join(', ')}</span>
              </>
            )}
          </div>

          {movie.overview && (
            <p className="line-clamp-3 max-w-prose text-sm leading-relaxed text-chalk/80 sm:text-base">
              {movie.overview}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to={`/movies/${movie.id}`}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-accent px-6 text-sm font-medium text-chalk shadow-[0_12px_30px_rgba(227,20,60,0.45)] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-accent-soft"
            >
              <Play aria-hidden className="size-4" fill="currentColor" />
              Watch trailer
            </Link>
            <Link
              to={`/movies/${movie.id}`}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-white/10 bg-raised/70 px-6 text-sm font-medium text-chalk backdrop-blur-sm transition-colors hover:border-white/20 hover:bg-white/5"
            >
              <Info aria-hidden className="size-4" />
              More details
            </Link>
            <FavoriteButton movie={movie} className="size-11 border border-white/10 bg-raised/70 backdrop-blur-sm" />
          </div>
        </div>
      </div>
    </section>
  );
}
