import { Skeleton } from '@/components/ui/skeleton';

export default function TasksLoading() {
  return (
    <div
      className="mx-auto w-full max-w-3xl space-y-3 p-4"
      role="status"
      aria-busy="true"
      aria-label="Loading tasks"
    >
      <Skeleton className="h-10 w-48" />
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}
