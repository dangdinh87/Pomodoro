"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useI18n } from "@/contexts/i18n-context"

interface DistributionChartProps {
    data: {
        name: string
        value: number // in seconds
        color: string
    }[]
}

export function DistributionChart({ data }: DistributionChartProps) {
    const { t } = useI18n();
    const totalDuration = data.reduce((acc, curr) => acc + curr.value, 0)
    const totalMinutes = Math.round(totalDuration / 60)

    // Filter out zero values to avoid rendering empty segments or labels
    const activeData = data.filter(item => item.value > 0)

    return (
        <Card className="col-span-3">
            <CardHeader>
                <CardTitle className="text-base font-normal">{t('historyComponents.distributionChart.title')}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[250px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={activeData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={2}
                                dataKey="value"
                                strokeWidth={0}
                            >
                                {activeData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: number) => [t('historyComponents.distributionChart.minutes', { minutes: Math.round(value / 60) }), t('historyComponents.distributionChart.time')]}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-xs text-muted-foreground">{t('historyComponents.distributionChart.total')}</span>
                        <span className="text-2xl font-bold">{t('historyComponents.distributionChart.minutes', { minutes: totalMinutes })}</span>
                    </div>
                </div>
                <div className="mt-4 flex flex-wrap justify-center gap-4">
                    {data.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <div
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: item.color }}
                            />
                            <span className="text-xs text-muted-foreground">
                                {item.name} ({totalDuration > 0 ? Math.round((item.value / totalDuration) * 100) : 0}%)
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
