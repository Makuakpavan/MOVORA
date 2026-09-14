import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { PageLoader } from '@/components/ui/PageLoader';
import { StateMessage } from '@/components/ui/StateMessage';

interface ProtectedRouteProps {
  /**
   * `prompt` shows an in-place sign-in invitation (better for Favourites — the
   * user stays where they are). `redirect` sends them to /login.
   */
  mode?: 'prompt' | 'redirect';
}

export function ProtectedRoute({ mode = 'prompt' }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Wait for the session check before deciding — otherwise a signed-in user
  // gets bounced to /login on every hard refresh.
  if (isLoading) return <PageLoader />;

  if (!isAuthenticated) {
    if (mode === 'redirect') {
      return (
        <Navigate to="/login" replace state={{ from: location.pathname }} />
      );
    }

    return (
      <StateMessage
        icon={<LogIn className="size-6" />}
        title="Sign in to see your favourites"
        description="Your watchlist is tied to your account, so it follows you between devices."
      >
        <div className="flex gap-3">
          <Link
            to="/login"
            state={{ from: location.pathname }}
            className="inline-flex h-11 items-center rounded-full bg-accent px-5 text-sm font-medium text-chalk transition-colors hover:bg-accent-soft"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="inline-flex h-11 items-center rounded-full border border-hairline bg-raised px-5 text-sm font-medium text-chalk transition-colors hover:bg-hairline"
          >
            Create account
          </Link>
        </div>
      </StateMessage>
    );
  }

  return <Outlet />;
}
