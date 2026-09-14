import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
}

export const Field = forwardRef<HTMLInputElement, FieldProps>(
  ({ label, error, hint, icon, className, id, type, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;
    const [visible, setVisible] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (visible ? 'text' : 'password') : (type as string | undefined);

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="text-sm font-medium text-chalk">
          {label}
        </label>

        <div className="relative">
          {icon && (
            <span
              aria-hidden
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
            >
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={error ? true : undefined}
            aria-describedby={cn(error && errorId, hint && hintId) || undefined}
            className={cn(
              'h-11 w-full rounded-xl border bg-surface px-3.5 text-sm text-chalk',
              'placeholder:text-muted/70',
              'transition-colors focus:border-accent focus:outline-none',
              icon && 'pl-11',
              error ? 'border-accent' : 'border-hairline',
              className,
            )}
            type={inputType}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              aria-label={visible ? 'Hide password' : 'Show password'}
              onClick={() => setVisible((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted"
            >
              {visible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </button>
          )}
        </div>

        {hint && !error && (
          <p id={hintId} className="text-xs text-muted">
            {hint}
          </p>
        )}
        {error && (
          <p id={errorId} role="alert" className="text-xs text-accent-soft">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Field.displayName = 'Field';
