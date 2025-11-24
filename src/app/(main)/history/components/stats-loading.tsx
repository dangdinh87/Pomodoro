import { Skeleton } from "@/components/ui/skeleton"

export function StatsLoading() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <div className="flex items-center space-x-2">
                    <Skeleton className="h-10 w-[300px]" />
                    <Skeleton className="h-10 w-32" />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Skeleton className="h-32 rounded-xl" />
                <Skeleton className="h-32 rounded-xl" />
                <Skeleton className="h-32 rounded-xl" />
                <Skeleton className="h-32 rounded-xl" />
            </div>

            <section className="rounded-xl border bg-card/70 backdrop-blur p-4 md:p-6 space-y-4">
                <div className="space-y-4">
                    <Skeleton className="h-6 w-48" />
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Skeleton className="h-[300px] rounded-xl lg:col-span-4" />
                        <Skeleton className="h-[300px] rounded-xl lg:col-span-3" />
                    </div>
                </div>

                <div className="space-y-4">
                    <Skeleton className="h-6 w-32" />
                    <div className="space-y-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Skeleton key={i} className="h-16 w-full rounded-lg" />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}
