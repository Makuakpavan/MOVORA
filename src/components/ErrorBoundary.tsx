import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Catches render-time crashes so one broken component doesn't blank the page.
 * React Query handles *data* errors; this handles *code* errors.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Swap for your error reporter (Sentry, LogRocket) in production.
    console.error('Render error caught by boundary:', error, info.componentStack);
  }

  private reset = () => this.setState({ error: null });

  render() {
    if (!this.state.error) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    return (
      <div
        role="alert"
        className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center"
      >
        <AlertTriangle aria-hidden className="size-10 text-accent" />
        <h1 className="text-2xl">This section stopped working</h1>
        <p className="max-w-md text-sm text-muted">
          Reloading usually clears it. If it keeps happening, the details are in
          the browser console.
        </p>
        <div className="flex gap-3">
          <Button onClick={this.reset}>Try again</Button>
          <Button variant="secondary" onClick={() => window.location.assign('/')}>
            Go home
          </Button>
        </div>
      </div>
    );
  }
}
