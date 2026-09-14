/**
 * Join class names, dropping anything falsy.
 * Accepts `unknown` so guards like `icon && 'pl-11'` (where `icon` is a
 * ReactNode) type-check without a cast at every call site.
 */
export function cn(...classes: unknown[]): string {
  return classes.filter((value): value is string => typeof value === 'string' && value !== '')
    .join(' ');
}
