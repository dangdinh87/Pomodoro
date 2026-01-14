"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useI18n } from "@/contexts/i18n-context"

interface FocusChartProps {
    data: {
        date: string
        duration: number // in seconds
    }[]
}

export function FocusChart({ data }: FocusChartProps) {
    const { t } = useI18n();
    // Format data for chart (convert seconds to minutes)
    const chartData = data.map(item => ({
        name: new Date(item.date).toLocaleDateString('vi-VN', { weekday: 'short' }), // T2, T3...
        minutes: Math.round(item.duration / 60),
        fullDate: new Date(item.date).toLocaleDateString('vi-VN')
    }))

    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle className="text-base font-normal">{t('historyComponents.focusChart.title')}</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={chartData}>
                        <XAxis
                            dataKey="name"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="flex flex-col">
                                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                        {payload[0].payload.fullDate}
                                                    </span>
                                                    <span className="font-bold text-muted-foreground">
                                                        {t('historyComponents.focusChart.minutes', { minutes: payload[0].value })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }
                                return null
                            }}
                        />
                        <Bar
                            dataKey="minutes"
                            fill="hsl(var(--primary))"
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
