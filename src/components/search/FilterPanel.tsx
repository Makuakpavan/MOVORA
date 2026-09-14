import { useId } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { useGenres } from '@/hooks/useMovies';
import { SORT_OPTIONS, YEAR_OPTIONS } from '@/utils/constants';
import { cn } from '@/utils/cn';
import type { MovieQuery, SortOption } from '@/types/movie';

interface FilterPanelProps {
  query: MovieQuery;
  onChange: (patch: Partial<MovieQuery>) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
}

const RATING_STEPS = [9, 8, 7, 6, 5];

export function FilterPanel({
  query,
  onChange,
  onClear,
  hasActiveFilters,
}: FilterPanelProps) {
  const genres = useGenres();
  const genreId = useId();
  const yearId = useId();
  const ratingId = useId();
  const sortId = useId();

  return (
    <aside
      aria-label="Filter and sort results"
      className="rounded-panel border border-hairline bg-surface p-5"
    >
      <div className="mb-5 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base">
          <SlidersHorizontal aria-hidden className="size-4 text-muted" />
          Refine
        </h2>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1 text-xs text-accent-soft hover:underline"
          >
            <X aria-hidden className="size-3" />
            Clear all
          </button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        <Select
          id={sortId}
          label="Sort by"
          value={query.sort ?? 'popularity'}
          onChange={(value) => onChange({ sort: value as SortOption })}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>

        <Select
          id={genreId}
          label="Genre"
          value={query.genre ? String(query.genre) : ''}
          onChange={(value) => onChange({ genre: value ? Number(value) : undefined })}
        >
          <option value="">Any genre</option>
          {genres.map((genre) => (
            <option key={genre.id} value={genre.id}>
              {genre.name}
            </option>
          ))}
        </Select>

        <Select
          id={yearId}
          label="Release year"
          value={query.year ? String(query.year) : ''}
          onChange={(value) => onChange({ year: value ? Number(value) : undefined })}
        >
          <option value="">Any year</option>
          {YEAR_OPTIONS.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </Select>

        <Select
          id={ratingId}
          label="Minimum rating"
          value={query.minRating ? String(query.minRating) : ''}
          onChange={(value) =>
            onChange({ minRating: value ? Number(value) : undefined })
          }
        >
          <option value="">Any rating</option>
          {RATING_STEPS.map((rating) => (
            <option key={rating} value={rating}>
              {rating}+ and above
            </option>
          ))}
        </Select>
      </div>
    </aside>
  );
}

function Select({
  id,
  label,
  value,
  onChange,
  children,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-medium text-muted">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          'h-10 w-full rounded-lg border border-hairline bg-raised px-3 text-sm text-chalk',
          'transition-colors focus:border-accent focus:outline-none',
        )}
      >
        {children}
      </select>
    </div>
  );
}
