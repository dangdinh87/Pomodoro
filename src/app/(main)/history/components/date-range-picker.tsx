"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { addDays, format, startOfMonth, subDays } from "date-fns"
import { vi } from "date-fns/locale"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { useI18n } from "@/contexts/i18n-context"

interface DateRangePickerProps {
    value?: DateRange
    onChange?: (range: DateRange | undefined) => void
    className?: string
}

export function DateRangePicker({
    value,
    onChange,
    className,
}: DateRangePickerProps) {
    const { t } = useI18n();
    const [date, setDate] = React.useState<DateRange | undefined>(value)
    const [open, setOpen] = React.useState(false)
    const [presetName, setPresetName] = React.useState<string | null>(t('historyComponents.dateRangePicker.presets.today')) // Default to match initial state in page

    // Update internal state when value prop changes
    React.useEffect(() => {
        setDate(value)
    }, [value])

    const handleSelect = (newRange: DateRange | undefined) => {
        setDate(newRange)
        onChange?.(newRange)
        setPresetName(null) // Clear preset name when manually selecting
    }

    const handlePreset = (preset: 'today' | 'last3days' | 'last7days' | 'last30days' | 'thisMonth') => {
        const today = new Date()
        let range: DateRange | undefined
        let name = ''

        switch (preset) {
            case 'today':
                range = { from: today, to: today }
                name = t('historyComponents.dateRangePicker.presets.today')
                break
            case 'last3days':
                range = { from: subDays(today, 2), to: today }
                name = t('historyComponents.dateRangePicker.presets.last3Days')
                break
            case 'last7days':
                range = { from: subDays(today, 6), to: today }
                name = t('historyComponents.dateRangePicker.presets.last7Days')
                break
            case 'last30days':
                range = { from: subDays(today, 29), to: today }
                name = t('historyComponents.dateRangePicker.presets.last30Days')
                break
            case 'thisMonth':
                range = { from: startOfMonth(today), to: today }
                name = t('historyComponents.dateRangePicker.presets.thisMonth')
                break
        }

        setDate(range)
        onChange?.(range)
        setPresetName(name)
        setOpen(false)
    }

    return (
        <div className="grid gap-2">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "w-auto justify-start text-left font-normal text-xs h-9 bg-muted/40 border-border",
                            !date && "text-muted-foreground/40",
                            className
                        )}
                    >
                        <CalendarIcon className="mr-2 h-3 w-3" />
                        {presetName ? (
                            <span>{presetName}</span>
                        ) : date?.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, "dd LLL, y", { locale: vi })} -{" "}
                                    {format(date.to, "dd LLL, y", { locale: vi })}
                                </>
                            ) : (
                                format(date.from, "dd LLL, y", { locale: vi })
                            )
                        ) : (
                            <span>{t('historyComponents.dateRangePicker.selectRange')}</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <div className="flex">
                        <div className="flex flex-col gap-2 border-r p-3">
                            <Button
                                variant="ghost"
                                className="justify-start"
                                onClick={() => handlePreset('today')}
                            >
                                {t('historyComponents.dateRangePicker.presets.today')}
                            </Button>
                            <Button
                                variant="ghost"
                                className="justify-start"
                                onClick={() => handlePreset('last3days')}
                            >
                                {t('historyComponents.dateRangePicker.presets.last3Days')}
                            </Button>
                            <Button
                                variant="ghost"
                                className="justify-start"
                                onClick={() => handlePreset('last7days')}
                            >
                                {t('historyComponents.dateRangePicker.presets.last7Days')}
                            </Button>
                            <Button
                                variant="ghost"
                                className="justify-start"
                                onClick={() => handlePreset('last30days')}
                            >
                                {t('historyComponents.dateRangePicker.presets.last30Days')}
                            </Button>
                            <Button
                                variant="ghost"
                                className="justify-start"
                                onClick={() => handlePreset('thisMonth')}
                            >
                                {t('historyComponents.dateRangePicker.presets.thisMonth')}
                            </Button>
                        </div>
                        <div>
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={date?.from}
                                selected={date}
                                onSelect={handleSelect}
                                numberOfMonths={2}
                            />
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}
