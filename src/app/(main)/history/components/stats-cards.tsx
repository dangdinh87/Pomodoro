import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StatsCardsProps {
    totalFocusTime: number // in seconds
    completedSessions: number
    streak: {
        current: number
        longest: number
    }
}

export function StatsCards({ totalFocusTime, completedSessions, streak }: StatsCardsProps) {
    const hours = Math.floor(totalFocusTime / 3600)
    const minutes = Math.floor((totalFocusTime % 3600) / 60)

    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Tổng thời gian tập trung
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {hours > 0 ? `${hours} giờ ` : ''}{minutes} phút
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Số phiên hoàn thành
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{completedSessions}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Chuỗi ngày dài nhất
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{streak.longest} ngày</div>
                    <p className="text-xs text-muted-foreground">
                        Hiện tại: {streak.current} ngày
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
