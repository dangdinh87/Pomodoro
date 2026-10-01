import type { ReactNode } from "react"

export function SettingsSection({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="space-y-3">
            <h2 className="font-heading text-[0.9375rem] font-bold text-ink">
                {title}
            </h2>
            <div className="divide-y divide-border rounded-lg border border-border bg-surface">{children}</div>
        </section>
    )
}

export function SettingsRow({ label, description, children }: { label: string; description?: string; children: ReactNode }) {
    return (
        <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 space-y-0.5">
                <p className="text-[0.9375rem] font-semibold text-ink">{label}</p>
                {description && <p className="text-[0.8125rem] text-ink-muted">{description}</p>}
            </div>
            <div className="shrink-0 sm:w-[220px]">{children}</div>
        </div>
    )
}
