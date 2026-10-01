import { Skeleton } from '@/components/ui/skeleton'

export function HistoryLoading() {
    return (
        <div className="space-y-8" aria-hidden>
            <Skeleton className="h-[88px] rounded-lg" />
            <div className="grid gap-6 lg:grid-cols-[1fr_auto]">
                <Skeleton className="h-[280px] rounded-lg" />
                <Skeleton className="h-[200px] rounded-lg lg:w-[300px]" />
            </div>
            <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-12 rounded-lg" />
                ))}
            </div>
        </div>
    )
}
