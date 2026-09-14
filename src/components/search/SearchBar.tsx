import { useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface SearchBarProps {
  /** Pre-fills the input, e.g. from ?q= on the search page. */
  initialValue?: string;
  /** Called on every keystroke when provided — pair it with useDebounce. */
  onChange?: (value: string) => void;
  /** Defaults to navigating to /search?q=… */
  onSubmit?: (value: string) => void;
  size?: 'sm' | 'lg';
  autoFocus?: boolean;
  className?: string;
}

export function SearchBar({
  initialValue = '',
  onChange,
  onSubmit,
  size = 'sm',
  autoFocus,
  className,
}: SearchBarProps) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const inputId = useId();

  // Keep in step when the URL changes underneath us (back button, link click).
  useEffect(() => setValue(initialValue), [initialValue]);

  const update = (next: string) => {
    setValue(next);
    onChange?.(next);
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    if (onSubmit) onSubmit(trimmed);
    else navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const isLarge = size === 'lg';

  return (
    <form
      role="search"
      onSubmit={submit}
      className={cn('relative flex w-full items-center', className)}
    >
      <label htmlFor={inputId} className="sr-only">
        Search movies by title
      </label>

      <Search
        aria-hidden
        className={cn(
          'pointer-events-none absolute left-4 text-muted',
          isLarge ? 'size-5' : 'size-4',
        )}
      />

      <input
        ref={inputRef}
        id={inputId}
        type="search"
        value={value}
        autoFocus={autoFocus}
        autoComplete="off"
        placeholder={isLarge ? 'Search by title — try "Inception"' : 'Search movies'}
        onChange={(event) => update(event.target.value)}
        className={cn(
          'w-full rounded-full border border-hairline bg-surface text-chalk',
          'placeholder:text-muted/70 transition-colors focus:border-accent focus:outline-none',
          // Hide the native WebKit clear button; we render our own.
          '[&::-webkit-search-cancel-button]:appearance-none',
          isLarge ? 'h-14 pl-12 pr-32 text-base' : 'h-10 pl-10 pr-20 text-sm',
        )}
      />

      {value && (
        <button
          type="button"
          onClick={() => {
            update('');
            inputRef.current?.focus();
          }}
          aria-label="Clear search"
          className={cn(
            'absolute text-muted hover:text-chalk',
            isLarge ? 'right-28' : 'right-[4.75rem]',
          )}
        >
          <X aria-hidden className="size-4" />
        </button>
      )}

      <button
        type="submit"
        className={cn(
          'absolute right-1.5 rounded-full bg-accent font-medium text-chalk',
          'transition-colors hover:bg-accent-soft',
          isLarge ? 'h-11 px-6 text-sm' : 'h-7 px-3.5 text-xs',
        )}
      >
        Search
      </button>
    </form>
  );
}
