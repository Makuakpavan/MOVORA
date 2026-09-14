import { useEffect, useState } from 'react';
import { SearchX, Telescope } from 'lucide-react';
import { MovieGrid } from '@/components/movie/MovieGrid';
import { SearchBar } from '@/components/search/SearchBar';
import { FilterPanel } from '@/components/search/FilterPanel';
import { Pagination } from '@/components/search/Pagination';
import { ErrorState } from '@/components/ui/ErrorState';
import { StateMessage } from '@/components/ui/StateMessage';
import { useSearchQueryState } from '@/hooks/useSearchQueryState';
import { useDebounce } from '@/hooks/useDebounce';
import { useMovieSearch } from '@/hooks/useMovies';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { SEARCH_DEBOUNCE_MS } from '@/utils/constants';

export default function SearchPage() {
  const { query, updateQuery, clearFilters, hasActiveFilters } = useSearchQueryState();

  // Typed text lives in local state; the URL only updates once typing settles.
  const [draft, setDraft] = useState(query.q ?? '');
  const debouncedDraft = useDebounce(draft, SEARCH_DEBOUNCE_MS);

  useEffect(() => {
    if (debouncedDraft.trim() !== (query.q ?? '').trim()) {
      updateQuery({ q: debouncedDraft.trim() || undefined });
    }
  }, [debouncedDraft, query.q, updateQuery]);

  useDocumentTitle(query.q ? `${query.q} — search` : 'Search');

  const { data, isLoading, isFetching, error, refetch } = useMovieSearch(query);
  const hasQuery = Boolean(query.q?.trim());
  const results = data?.items ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl sm:text-4xl">Search</h1>

      <SearchBar
        initialValue={query.q ?? ''}
        onChange={setDraft}
        onSubmit={(value) => updateQuery({ q: value })}
        size="lg"
        autoFocus={!hasQuery}
        className="mt-5 max-w-2xl"
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-[16rem_1fr]">
        <FilterPanel
          query={query}
          onChange={updateQuery}
          onClear={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />

        <div>
          {/* Announced to screen readers whenever the count changes. */}
          <p aria-live="polite" className="mb-5 text-sm text-muted">
            {!hasQuery
              ? 'Start typing to search the catalogue.'
              : isLoading
                ? 'Searching…'
                : data
                  ? `${data.totalResults.toLocaleString()} ${
                      data.totalResults === 1 ? 'result' : 'results'
                    } for "${query.q}"`
                  : ''}
          </p>

          {!hasQuery ? (
            <StateMessage
              icon={<Telescope className="size-6" />}
              title="Nothing searched yet"
              description="Search by title, then narrow the results by genre, release year or rating."
            />
          ) : error ? (
            <ErrorState error={error} onRetry={() => void refetch()} />
          ) : !isLoading && results.length === 0 ? (
            <StateMessage
              icon={<SearchX className="size-6" />}
              title={`No films match "${query.q}"`}
              description={
                hasActiveFilters
                  ? 'Your filters may be too narrow. Clearing them often brings results back.'
                  : 'Check the spelling, or try a shorter part of the title.'
              }
              action={
                hasActiveFilters
                  ? { label: 'Clear filters', onClick: clearFilters }
                  : undefined
              }
            />
          ) : (
            <>
              {/* Dim slightly while the next page loads, instead of blanking. */}
              <div className={isFetching && !isLoading ? 'opacity-60 transition-opacity' : ''}>
                <MovieGrid
                  movies={results}
                  isLoading={isLoading}
                  label="Search results"
                />
              </div>

              <div className="mt-10">
                <Pagination
                  page={data?.page ?? 1}
                  totalPages={data?.totalPages ?? 1}
                  onPageChange={(page) => updateQuery({ page })}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
