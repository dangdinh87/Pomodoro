import { Button } from "@/components/ui/button"
import { CalendarX2 } from "lucide-react"
import Link from "next/link"

export function StatsEmpty() {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 min-h-[400px]">
            <div className="bg-muted/50 p-4 rounded-full">
                <CalendarX2 className="h-12 w-12 text-muted-foreground" />
            </div>
            <div className="space-y-2">
                <h3 className="text-xl font-semibold">Chưa có dữ liệu</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                    Không có phiên tập trung nào được ghi nhận trong khoảng thời gian này. Hãy bắt đầu một phiên mới!
                </p>
            </div>
            <Button asChild>
                <Link href="/timer">Bắt đầu tập trung</Link>
            </Button>
        </div>
    )
}
