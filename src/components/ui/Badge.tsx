import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export function Badge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-hairline bg-surface/80',
        'px-2.5 py-1 text-xs text-muted',
        className,
      )}
    >
      {children}
    </span>
  );
}
