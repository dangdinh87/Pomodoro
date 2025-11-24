"use client"

import { Trophy } from "lucide-react"

export default function LeaderboardPage() {
    return (
        <main
            className="container mx-auto px-4 py-12 min-h-screen flex items-center justify-center"
            aria-label="Leaderboard page"
        >
            <div className="max-w-md mx-auto text-center space-y-6">
                <div className="bg-muted/30 p-6 rounded-full w-24 h-24 mx-auto flex items-center justify-center">
                    <Trophy className="h-12 w-12 text-primary" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold">Leaderboard</h1>
                    <p className="text-muted-foreground text-lg">
                        Tính năng sắp ra mắt
                    </p>
                </div>
                <div className="text-sm text-muted-foreground max-w-sm mx-auto">
                    Bảng xếp hạng sẽ giúp bạn so sánh thành tích với các người dùng khác và tạo động lực học tập.
                </div>
            </div>
        </main>
    )
}
