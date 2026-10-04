import type { ReactNode } from "react"
import type { Icon } from "@phosphor-icons/react"
import { SlidersHorizontal } from "@phosphor-icons/react/dist/ssr"
import { IconTile, type IconTileTone } from "@/components/ui/icon-tile"
import { cn } from "@/lib/utils"

interface SettingsSectionProps {
    title: string
    /** Phosphor icon for the tile in the heading. Callers that predate the sticker look get the generic sliders icon. */
    icon?: Icon
    tone?: IconTileTone
    action?: ReactNode
    children: ReactNode
}

/** A settings group: one sticker card with an icon tile and a Baloo heading, rows divided inside. */
export function SettingsSection({ title, icon = SlidersHorizontal, tone = "butter", action, children }: SettingsSectionProps) {
    return (
        <section className="sticker overflow-hidden">
            <div className="flex min-h-14 items-center gap-3 border-b-2 border-border px-4 py-3 sm:px-5">
                <IconTile icon={icon} tone={tone} />
                <h3 className="min-w-0 flex-1 font-heading text-[1.0625rem] font-extrabold tracking-[-0.01em] text-ink">{title}</h3>
                {action}
            </div>
            <div className="divide-y-2 divide-border">{children}</div>
        </section>
    )
}

interface SettingsRowProps {
    label: string
    description?: string
    children: ReactNode
    /** Controls that need the full width (chip groups, swatch grids) sit under the text instead of beside it. */
    stacked?: boolean
}

export function SettingsRow({ label, description, children, stacked = false }: SettingsRowProps) {
    return (
        <div
            className={cn(
                "flex flex-col gap-3 px-4 py-3.5 sm:px-5",
                !stacked && "sm:flex-row sm:items-center sm:justify-between sm:gap-6",
            )}
        >
            <div className="min-w-0 flex-1 space-y-0.5">
                <p className="text-[0.9375rem] font-bold text-ink">{label}</p>
                {description && <p className="text-[0.8125rem] leading-snug text-ink-muted">{description}</p>}
            </div>
            <div className={cn(!stacked && "shrink-0 sm:w-[180px]")}>{children}</div>
        </div>
    )
}
