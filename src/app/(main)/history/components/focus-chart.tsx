"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface FocusChartProps {
    data: {
        date: string
        duration: number // in seconds
    }[]
}

export function FocusChart({ data }: FocusChartProps) {
    // Format data for chart (convert seconds to minutes)
    const chartData = data.map(item => ({
        name: new Date(item.date).toLocaleDateString('vi-VN', { weekday: 'short' }), // T2, T3...
        minutes: Math.round(item.duration / 60),
        fullDate: new Date(item.date).toLocaleDateString('vi-VN')
    }))

    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle className="text-base font-normal">Thời gian tập trung hàng ngày</CardTitle>
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
                                                        {payload[0].value} phút
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
                            fill="currentColor"
                            radius={[4, 4, 0, 0]}
                            className="fill-primary"
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
