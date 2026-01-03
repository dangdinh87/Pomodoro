import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkles, Clock, BarChart3 } from 'lucide-react'
import Link from 'next/link'

export default function ProgressPage() {
  return (
    <div className="h-full grid place-items-center">
      <Card className="w-full max-w-2xl bg-background/70 backdrop-blur-md border-white/10">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 h-10 w-10 grid place-items-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <CardTitle className="text-2xl">Tính năng sắp ra mắt</CardTitle>
          <p className="mt-2 text-sm text-muted-foreground">
            Trang thống kê đang được hoàn thiện. Bạn sẽ sớm theo dõi tiến độ tập trung, chuỗi ngày, và thời gian làm việc.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg border bg-muted/30 flex items-center gap-3">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-sm font-medium">Thời gian tập trung</div>
                <div className="text-xs text-muted-foreground">Theo ngày/tuần/tháng</div>
              </div>
            </div>
            <div className="p-3 rounded-lg border bg-muted/30 flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-sm font-medium">Pomodoro & phiên</div>
                <div className="text-xs text-muted-foreground">Số phiên, tỉ lệ hoàn thành</div>
              </div>
            </div>
            <div className="p-3 rounded-lg border bg-muted/30 flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              <div>
                <div className="text-sm font-medium">Chuỗi ngày</div>
                <div className="text-xs text-muted-foreground">Giữ streak, nhận huy hiệu</div>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-center">
            <Button asChild>
              <Link href="/timer">Quay lại Timer</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}