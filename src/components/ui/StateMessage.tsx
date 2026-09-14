import type { ReactNode } from 'react';
import { Button } from './Button';

interface StateMessageProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
  children?: ReactNode;
}

/**
 * One component for every empty / error / not-found screen, so those states
 * look like part of the product rather than an afterthought.
 */
export function StateMessage({
  icon,
  title,
  description,
  action,
  children,
}: StateMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 py-20 text-center">
      <span
        aria-hidden
        className="flex size-14 items-center justify-center rounded-2xl border border-hairline bg-surface text-muted"
      >
        {icon}
      </span>
      <div className="max-w-md space-y-2">
        <h2 className="text-xl">{title}</h2>
        <p className="text-sm leading-relaxed text-muted">{description}</p>
      </div>
      {action && (
        <Button variant="secondary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
      {children}
    </div>
  );
}
