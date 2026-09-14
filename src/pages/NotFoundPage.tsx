import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { StateMessage } from '@/components/ui/StateMessage';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function NotFoundPage() {
  useDocumentTitle('Page not found');

  return (
    <StateMessage
      icon={<Compass className="size-6" />}
      title="This page doesn't exist"
      description="The link may be mistyped, or the page has moved."
    >
      <Link
        to="/"
        className="inline-flex h-11 items-center rounded-full bg-accent px-5 text-sm font-medium text-chalk transition-colors hover:bg-accent-soft"
      >
        Back to home
      </Link>
    </StateMessage>
  );
}
