import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/** Shows up to 5 numbered pages around the current one, plus prev/next. */
export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const windowStart = Math.max(1, Math.min(page - 2, totalPages - 4));
  const windowEnd = Math.min(totalPages, windowStart + 4);
  const pages = Array.from(
    { length: windowEnd - windowStart + 1 },
    (_, i) => windowStart + i,
  );

  const go = (next: number) => {
    onPageChange(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav aria-label="Search results pages" className="flex items-center justify-center gap-1.5">
      <PageButton
        onClick={() => go(page - 1)}
        disabled={page <= 1}
        ariaLabel="Previous page"
      >
        <ChevronLeft aria-hidden className="size-4" />
      </PageButton>

      {windowStart > 1 && (
        <>
          <PageButton onClick={() => go(1)} ariaLabel="Page 1">
            1
          </PageButton>
          {windowStart > 2 && (
            <span aria-hidden className="px-1 text-muted">
              …
            </span>
          )}
        </>
      )}

      {pages.map((number) => (
        <PageButton
          key={number}
          onClick={() => go(number)}
          isCurrent={number === page}
          ariaLabel={`Page ${number}`}
        >
          {number}
        </PageButton>
      ))}

      {windowEnd < totalPages && (
        <>
          {windowEnd < totalPages - 1 && (
            <span aria-hidden className="px-1 text-muted">
              …
            </span>
          )}
          <PageButton onClick={() => go(totalPages)} ariaLabel={`Page ${totalPages}`}>
            {totalPages}
          </PageButton>
        </>
      )}

      <PageButton
        onClick={() => go(page + 1)}
        disabled={page >= totalPages}
        ariaLabel="Next page"
      >
        <ChevronRight aria-hidden className="size-4" />
      </PageButton>
    </nav>
  );
}

function PageButton({
  children,
  onClick,
  disabled,
  isCurrent,
  ariaLabel,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  isCurrent?: boolean;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-current={isCurrent ? 'page' : undefined}
      className={cn(
        'flex h-9 min-w-9 items-center justify-center rounded-lg px-2.5 text-sm transition-colors',
        isCurrent
          ? 'bg-accent font-semibold text-chalk'
          : 'border border-hairline bg-surface text-muted hover:text-chalk',
        disabled && 'cursor-not-allowed opacity-40 hover:text-muted',
      )}
    >
      {children}
    </button>
  );
}
