import { Skeleton } from '@/components/ui/Skeleton';

export function MovieCardSkeleton() {
  return (
    <div className="space-y-2.5">
      <Skeleton className="aspect-2/3 w-full rounded-card" />
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-3 w-2/5" />
    </div>
  );
}
