import { Loader2 } from 'lucide-react';

/** Shown while a lazily loaded route chunk is downloading. */
export function PageLoader() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[60vh] items-center justify-center"
    >
      <Loader2 aria-hidden className="size-7 animate-spin text-accent" />
      <span className="sr-only">Loading page</span>
    </div>
  );
}
