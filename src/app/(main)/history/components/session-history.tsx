import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SessionHistoryProps {
    sessions: {
        id: string
        taskName: string
        mode: 'work' | 'shortBreak' | 'longBreak'
        date: string
        duration: number // in seconds
    }[]
}

export function SessionHistory({ sessions }: SessionHistoryProps) {
    const getModeLabel = (mode: string) => {
        switch (mode) {
            case 'work': return 'Tập trung'
            case 'shortBreak': return 'Nghỉ ngắn'
            case 'longBreak': return 'Nghỉ dài'
            default: return mode
        }
    }

    const getModeColor = (mode: string) => {
        switch (mode) {
            case 'work': return 'default' // primary
            case 'shortBreak': return 'secondary' // amber-like usually but secondary works
            case 'longBreak': return 'outline'
            default: return 'outline'
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-semibold">Chi tiết các Phiên đã Hoàn thành</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[300px]">Công việc</TableHead>
                            <TableHead>Loại phiên</TableHead>
                            <TableHead>Ngày & Giờ</TableHead>
                            <TableHead className="text-right">Thời lượng</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sessions.map((session) => (
                            <TableRow key={session.id}>
                                <TableCell className="font-medium">{session.taskName}</TableCell>
                                <TableCell>
                                    <Badge variant={getModeColor(session.mode) as any}>
                                        {getModeLabel(session.mode)}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {new Date(session.date).toLocaleString('vi-VN', {
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </TableCell>
                                <TableCell className="text-right">
                                    {Math.round(session.duration / 60)} phút
                                </TableCell>
                            </TableRow>
                        ))}
                        {sessions.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                    Chưa có dữ liệu phiên làm việc nào.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
