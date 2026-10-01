import { Skeleton } from '@/components/ui/skeleton';

export default function HistoryLoading() {
  return (
    <div
      className="mx-auto w-full max-w-5xl space-y-4 p-4"
      role="status"
      aria-busy="true"
      aria-label="Loading history"
    >
      <Skeleton className="h-10 w-48" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
