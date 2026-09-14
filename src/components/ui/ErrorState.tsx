import { CloudOff, ServerCrash, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ApiError } from '@/types/api';
import { StateMessage } from './StateMessage';

interface ErrorStateProps {
  error: unknown;
  onRetry?: () => void;
}

/** Turns any thrown error into a screen that says what happened and what to do. */
export function ErrorState({ error, onRetry }: ErrorStateProps) {
  const apiError = error instanceof ApiError ? error : null;

  if (apiError?.isNetwork) {
    return (
      <StateMessage
        icon={<CloudOff className="size-6" />}
        title="No connection to the server"
        description="The app couldn't reach the API. Check that the backend is running and that your network is up."
        action={onRetry ? { label: 'Try again', onClick: onRetry } : undefined}
      />
    );
  }

  if (apiError?.isUnauthorized) {
    return (
      <StateMessage
        icon={<ShieldAlert className="size-6" />}
        title="Your session has ended"
        description="Sign in again to pick up where you left off."
      >
        <Link
          to="/login"
          className="inline-flex h-11 items-center rounded-full bg-accent px-5 text-sm font-medium text-chalk transition-colors hover:bg-accent-soft"
        >
          Sign in
        </Link>
      </StateMessage>
    );
  }

  return (
    <StateMessage
      icon={<ServerCrash className="size-6" />}
      title="That didn't load"
      description={
        apiError?.message ?? 'An unexpected error stopped this page from loading.'
      }
      action={onRetry ? { label: 'Try again', onClick: onRetry } : undefined}
    />
  );
}
