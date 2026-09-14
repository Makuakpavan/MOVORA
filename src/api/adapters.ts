import type {
  CastMember,
  Genre,
  MovieDetails,
  MovieSummary,
} from '@/types/movie';
import type { Paginated } from '@/types/api';

/* ---------------------------------------------------------------------------
 * This file is the single seam between your backend's JSON and the app's types.
 * If your API names a field differently (`poster_path` vs `posterPath`,
 * `_id` vs `id`), change it here only. No component reads raw API JSON.
 * ------------------------------------------------------------------------- */

type Raw = Record<string, unknown>;

const str = (v: unknown): string | null =>
  typeof v === 'string' && v.trim() !== '' ? v : null;

const num = (v: unknown): number | null => {
  const n = typeof v === 'string' ? Number(v) : v;
  return typeof n === 'number' && !Number.isNaN(n) ? n : null;
};

const pick = (raw: Raw, ...keys: string[]): unknown => {
  for (const key of keys) {
    if (raw[key] !== undefined && raw[key] !== null) return raw[key];
  }
  return undefined;
};

function toGenres(value: unknown): Genre[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry, index): Genre | null => {
      if (typeof entry === 'string') return { id: index, name: entry };
      if (entry && typeof entry === 'object') {
        const raw = entry as Raw;
        const name = str(pick(raw, 'name', 'genre'));
        if (!name) return null;
        return { id: num(pick(raw, 'id', 'genreId')) ?? index, name };
      }
      return null;
    })
    .filter((g): g is Genre => g !== null);
}

function toCast(value: unknown): CastMember[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry, index): CastMember | null => {
      if (!entry || typeof entry !== 'object') return null;
      const raw = entry as Raw;
      const name = str(pick(raw, 'name', 'actor'));
      if (!name) return null;
      return {
        id: num(pick(raw, 'id', 'castId')) ?? index,
        name,
        character: str(pick(raw, 'character', 'role')) ?? undefined,
        profilePath: str(pick(raw, 'profilePath', 'profile_path', 'image')),
      };
    })
    .filter((c): c is CastMember => c !== null);
}

export function toMovieSummary(raw: Raw): MovieSummary {
  return {
    id: String(pick(raw, 'id', '_id', 'movieId', 'tmdbId') ?? ''),
    title: str(pick(raw, 'title', 'name', 'originalTitle')) ?? 'Untitled',
    posterPath: str(pick(raw, 'posterPath', 'poster_path', 'poster')),
    backdropPath: str(pick(raw, 'backdropPath', 'backdrop_path', 'backdrop')),
    releaseDate: str(pick(raw, 'releaseDate', 'release_date', 'released')),
    rating: num(pick(raw, 'rating', 'voteAverage', 'vote_average')) ?? 0,
    voteCount: num(pick(raw, 'voteCount', 'vote_count', 'votes')) ?? 0,
    genres: toGenres(pick(raw, 'genres', 'genre', 'genreNames')),
    overview: str(pick(raw, 'overview', 'description', 'plot')) ?? '',
  };
}

export function toMovieDetails(raw: Raw): MovieDetails {
  const crew = pick(raw, 'crew');
  const directorFromCrew = Array.isArray(crew)
    ? (crew.find(
        (member) =>
          member &&
          typeof member === 'object' &&
          (member as Raw).job === 'Director',
      ) as Raw | undefined)
    : undefined;

  const companies = pick(raw, 'productionCompanies', 'production_companies');

  return {
    ...toMovieSummary(raw),
    tagline: str(pick(raw, 'tagline')),
    runtime: num(pick(raw, 'runtime', 'duration')),
    status: str(pick(raw, 'status')),
    originalLanguage: str(pick(raw, 'originalLanguage', 'original_language')),
    budget: num(pick(raw, 'budget')),
    revenue: num(pick(raw, 'revenue')),
    productionCompanies: Array.isArray(companies)
      ? companies
          .map((c) =>
            typeof c === 'string' ? c : str((c as Raw)?.name),
          )
          .filter((c): c is string => Boolean(c))
      : [],
    director:
      str(pick(raw, 'director')) ?? str(directorFromCrew?.name) ?? null,
    cast: toCast(pick(raw, 'cast', 'actors', 'credits')),
    trailerUrl:
      str(pick(raw, 'trailerUrl', 'trailer', 'trailer_url')) ??
      ((): string | null => {
        // TMDB returns videos in `videos.results` with `site` and `key` fields.
        const videos = (raw['videos'] as Raw | undefined) ?? (raw['videos'] as any);
        if (videos && typeof videos === 'object') {
          const results = Array.isArray((videos as any).results)
            ? (videos as any).results
            : Array.isArray(videos)
            ? videos
            : null;
          if (results) {
            const trailer = results.find(
              (v: any) => v && v.site === 'YouTube' && /trailer/i.test(v.type || v.name || ''),
            );
            if (trailer && trailer.key) {
              return `https://www.youtube.com/embed/${String(trailer.key)}?rel=0`;
            }
            // Fallback: any YouTube video
            const anyYouTube = results.find((v: any) => v && v.site === 'YouTube' && v.key);
            if (anyYouTube && anyYouTube.key) {
              return `https://www.youtube.com/embed/${String(anyYouTube.key)}?rel=0`;
            }
          }
        }
        return null;
      })(),
    homepage: str(pick(raw, 'homepage', 'website')),
  };
}

/**
 * Accepts either a bare array or a paginated envelope, in any of the common
 * field namings, and always returns the same shape.
 */
export function toPaginatedMovies(body: unknown): Paginated<MovieSummary> {
  if (Array.isArray(body)) {
    const items = body.map((m) => toMovieSummary(m as Raw));
    return { items, page: 1, totalPages: 1, totalResults: items.length };
  }

  const raw = (body ?? {}) as Raw;
  const list = pick(raw, 'items', 'results', 'movies', 'data');
  const items = Array.isArray(list) ? list.map((m) => toMovieSummary(m as Raw)) : [];

  const totalResults =
    num(pick(raw, 'totalResults', 'total_results', 'total', 'count')) ??
    items.length;
  const page = num(pick(raw, 'page', 'currentPage')) ?? 1;
  const totalPages =
    num(pick(raw, 'totalPages', 'total_pages', 'pages')) ??
    Math.max(1, Math.ceil(totalResults / Math.max(items.length || 1, 1)));

  return { items, page, totalPages, totalResults };
}
