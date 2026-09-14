import { Link, useParams } from 'react-router-dom';
import { useState } from 'react';
import { ApiError } from '@/types/api';
import { ArrowLeft, Clapperboard, Play } from 'lucide-react';
import { PosterImage } from '@/components/movie/PosterImage';
import { Modal } from '@/components/ui/Modal';
import { FavoriteButton } from '@/components/movie/FavoriteButton';
import { MovieRail } from '@/components/movie/MovieRail';
import { Rating } from '@/components/ui/Rating';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { StateMessage } from '@/components/ui/StateMessage';
import { useTmdbMovie, useTmdbSimilar } from '@/hooks/useTmdbMovie';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import {
  compactNumber,
  formatCurrency,
  formatDate,
  formatRuntime,
  releaseYear,
} from '@/utils/format';

export default function MovieDetailsPage() {
  const { id } = useParams<{ id: string }>();

  const { data: movie, isLoading, error, refetch } = useTmdbMovie(id);
  const similar = useTmdbSimilar(id);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useDocumentTitle(movie?.title);

  if (isLoading) return <DetailsSkeleton />;

  if (error instanceof ApiError && error.isNotFound) {
    return (
      <StateMessage
        icon={<Clapperboard className="size-6" />}
        title="That film isn't in the catalogue"
        description="The link may be out of date, or the title was removed."
      >
        <Link
          to="/search"
          className="inline-flex h-11 items-center rounded-full bg-accent px-5 text-sm font-medium text-chalk transition-colors hover:bg-accent-soft"
        >
          Search for something else
        </Link>
      </StateMessage>
    );
  }

  if (error || !movie) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <ErrorState error={error} onRetry={() => void refetch()} />
      </div>
    );
  }

  const year = releaseYear(movie.releaseDate);
  const budget = formatCurrency(movie.budget);
  const revenue = formatCurrency(movie.revenue);

  return (
    <article>
      {/* Backdrop */}
      <div className="relative h-56 sm:h-80 lg:h-[26rem]">
        <PosterImage
          path={movie.backdropPath ?? movie.posterPath}
          title={movie.title}
          size="backdrop"
          priority
          className="size-full object-cover object-top"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-t from-screen via-screen/60 to-screen/10"
        />
        <Link
          to="/search"
          className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-screen/70 px-4 py-2 text-sm backdrop-blur-sm hover:bg-screen sm:left-6"
        >
          <ArrowLeft aria-hidden className="size-4" />
          Back to search
        </Link>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="-mt-24 grid gap-8 sm:-mt-32 lg:grid-cols-[18rem_1fr] lg:gap-12">
          {/* Poster */}
          <div className="mx-auto w-40 shrink-0 sm:w-52 lg:mx-0 lg:w-72">
            <button
              type="button"
              onClick={() => void (movie?.trailerUrl ? setIsModalOpen(true) : null)}
              aria-label={movie.trailerUrl ? `Play trailer for ${movie.title}` : `Poster for ${movie.title}`}
              className="w-full"
            >
              <PosterImage
                path={movie.posterPath}
                title={movie.title}
                size="posterLarge"
                priority
                className="aspect-2/3 w-full rounded-panel border border-hairline object-cover shadow-2xl shadow-black/60"
              />
            </button>
          </div>

          {/* Primary information */}
          <div className="space-y-5 pt-2 lg:pt-28">
            <div>
              <h1 className="text-3xl leading-tight sm:text-4xl lg:text-5xl">
                {movie.title}
              </h1>
              {movie.tagline && (
                <p className="mt-2 text-base italic text-muted">{movie.tagline}</p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted">
              <Rating value={movie.rating} size="md" />
              <span>{compactNumber(movie.voteCount)} votes</span>
              {year && (
                <>
                  <span aria-hidden className="h-4 w-px bg-hairline" />
                  <span>{year}</span>
                </>
              )}
              {movie.runtime && (
                <>
                  <span aria-hidden className="h-4 w-px bg-hairline" />
                  <span>{formatRuntime(movie.runtime)}</span>
                </>
              )}
            </div>

            {movie.genres.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {movie.genres.map((genre) => (
                  <li key={genre.id}>
                    <Link to={`/search?q=${encodeURIComponent(movie.title)}&genre=${genre.id}`}>
                      <Badge className="hover:border-accent hover:text-chalk">
                        {genre.name}
                      </Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {movie.overview && (
              <div>
                <h2 className="text-lg">Overview</h2>
                <p className="mt-2 max-w-prose text-sm leading-relaxed text-chalk/85">
                  {movie.overview}
                </p>
              </div>
            )}
            {movie.trailerUrl && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-accent px-6 text-sm font-medium text-chalk transition-colors hover:bg-accent-soft"
                >
                  <Play aria-hidden className="size-4" fill="currentColor" />
                  Watch trailer
                </button>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <FavoriteButton movie={movie} variant="inline" />
            </div>
          </div>
        </div>

        {/* Secondary information */}
        <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_20rem]">
          <div className="space-y-10">
            {movie.cast.length > 0 && (
              <section aria-labelledby="cast-heading">
                <h2 id="cast-heading" className="text-xl">
                  Cast
                </h2>
                <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {movie.cast.slice(0, 12).map((member) => (
                    <li
                      key={member.id}
                      className="flex items-center gap-3 rounded-card border border-hairline bg-surface p-2.5"
                    >
                      <PosterImage
                        path={member.profilePath ?? null}
                        title={member.name}
                        size="profile"
                        className="size-11 shrink-0 rounded-full object-cover"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{member.name}</p>
                        {member.character && (
                          <p className="truncate text-xs text-muted">{member.character}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <aside aria-labelledby="facts-heading">
            <h2 id="facts-heading" className="text-xl">
              Production
            </h2>
            <dl className="mt-4 divide-y divide-hairline rounded-panel border border-hairline bg-surface px-5">
              <Fact label="Director" value={movie.director} />
              <Fact label="Released" value={formatDate(movie.releaseDate)} />
              <Fact label="Runtime" value={formatRuntime(movie.runtime)} />
              <Fact label="Status" value={movie.status} />
              <Fact
                label="Language"
                value={movie.originalLanguage?.toUpperCase() ?? null}
              />
              <Fact label="Budget" value={budget} />
              <Fact label="Revenue" value={revenue} />
              <Fact
                label="Studios"
                value={
                  movie.productionCompanies.length
                    ? movie.productionCompanies.join(', ')
                    : null
                }
              />
            </dl>
          </aside>
        </div>

        {(similar.isLoading || (similar.data?.length ?? 0) > 0) && (
          <div className="mt-16">
            <MovieRail
              title="More like this"
              movies={similar.data}
              isLoading={similar.isLoading}
              error={similar.error}
              onRetry={() => void similar.refetch()}
            />
          </div>
        )}
        {isModalOpen && movie.trailerUrl && (
          <Modal onClose={() => setIsModalOpen(false)}>
            <div style={{ position: 'relative', paddingTop: '56.25%' }}>
              <iframe
                src={`${movie.trailerUrl}&autoplay=1`}
                title={`${movie.title} trailer`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              />
            </div>
          </Modal>
        )}
      </div>
    </article>
  );
}

function Fact({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex gap-4 py-3 text-sm">
      <dt className="w-24 shrink-0 text-muted">{label}</dt>
      <dd className="min-w-0 flex-1">{value}</dd>
    </div>
  );
}

function DetailsSkeleton() {
  return (
    <div>
      <Skeleton className="h-56 w-full rounded-none sm:h-80 lg:h-[26rem]" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="-mt-24 grid gap-8 sm:-mt-32 lg:grid-cols-[18rem_1fr] lg:gap-12">
          <Skeleton className="mx-auto aspect-2/3 w-40 rounded-panel sm:w-52 lg:mx-0 lg:w-72" />
          <div className="space-y-4 lg:pt-28">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-11 w-52 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
