export interface Genre {
  id: number;
  name: string;
}

export interface CastMember {
  id: number;
  name: string;
  character?: string;
  profilePath?: string | null;
}

/** A movie as it appears in grids and rails. */
export interface MovieSummary {
  id: string;
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string | null;
  rating: number;
  voteCount: number;
  genres: Genre[];
  overview: string;
}

/** A movie as it appears on the details page. */
export interface MovieDetails extends MovieSummary {
  tagline: string | null;
  runtime: number | null;
  status: string | null;
  originalLanguage: string | null;
  budget: number | null;
  revenue: number | null;
  productionCompanies: string[];
  director: string | null;
  cast: CastMember[];
  trailerUrl: string | null;
  homepage: string | null;
}

export type SortOption = 'popularity' | 'rating' | 'release_date' | 'title';

export interface MovieFilters {
  genre?: number;
  year?: number;
  minRating?: number;
}

export interface MovieQuery extends MovieFilters {
  q?: string;
  page?: number;
  sort?: SortOption;
}

export type MovieCollection = 'trending' | 'top_rated' | 'recent';
