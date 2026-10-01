import type { ReactNode } from "react"

export function SettingsSection({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
    return (
        <section className="space-y-3">
            <div className="flex min-h-5 items-center justify-between gap-3">
                <h2 className="font-heading text-[0.9375rem] font-bold tracking-[-0.01em] text-ink">{title}</h2>
                {action}
            </div>
            <div className="divide-y divide-border rounded-lg border border-border bg-surface">{children}</div>
        </section>
    )
}

export function SettingsRow({ label, description, children }: { label: string; description?: string; children: ReactNode }) {
    return (
        <div className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-5">
            <div className="min-w-0 flex-1 space-y-0.5">
                <p className="text-[0.9375rem] font-semibold text-ink">{label}</p>
                {description && <p className="text-[0.8125rem] leading-snug text-ink-muted">{description}</p>}
            </div>
            <div className="shrink-0 sm:w-[180px]">{children}</div>
        </div>
    )
}
