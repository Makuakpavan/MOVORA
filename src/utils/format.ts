/** "2010-07-16" → "2010". Returns null when the date is missing or unparseable. */
export function releaseYear(date: string | null | undefined): string | null {
  if (!date) return null;
  const year = new Date(date).getFullYear();
  return Number.isNaN(year) ? null : String(year);
}

/** "2010-07-16" → "16 July 2010" */
export function formatDate(date: string | null | undefined): string {
  if (!date) return 'Unknown';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return 'Unknown';
  return parsed.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** 148 → "2h 28m" */
export function formatRuntime(minutes: number | null | undefined): string {
  if (!minutes || minutes <= 0) return 'Unknown';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours ? `${hours}h ${mins}m` : `${mins}m`;
}

/** 8.367 → "8.4" */
export function formatRating(rating: number | null | undefined): string {
  if (rating == null || Number.isNaN(rating)) return '—';
  return rating.toFixed(1);
}

/** 23481 → "23.5K" */
export function compactNumber(value: number | null | undefined): string {
  if (value == null) return '—';
  return new Intl.NumberFormat('en', { notation: 'compact' }).format(value);
}

/** 160000000 → "$160,000,000". Returns null so callers can hide the row. */
export function formatCurrency(value: number | null | undefined): string | null {
  if (!value || value <= 0) return null;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}
