import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Timer, CheckSquare, BarChart3, Settings, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Hướng Dẫn Sử Dụng • Study Bro App',
    description: 'Tìm hiểu về phương pháp Pomodoro và cách sử dụng các tính năng của Study Bro',
};

export default function GuidePage() {
    return (
        <main className="max-w-5xl mx-auto space-y-12">
            {/* Header */}
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold tracking-tight">
                    Hướng Dẫn Sử Dụng
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Tìm hiểu về phương pháp Pomodoro và cách sử dụng Study Bro để tối ưu hóa năng suất học tập và làm việc của bạn
                </p>
            </div>

            {/* Pomodoro Introduction */}
            <section className="space-y-6">
                <div>
                    <Badge className="mb-3">Phương Pháp Pomodoro</Badge>
                    <h2 className="text-3xl font-bold tracking-tight">
                        Pomodoro là gì?
                    </h2>
                </div>
                <div className="prose prose-neutral dark:prose-invert max-w-none">
                    <p className="text-lg leading-relaxed">
                        <strong>Pomodoro</strong> là phương pháp quản lý thời gian đơn giản giúp bạn làm việc và học tập hiệu quả
                        bằng cách chia nhỏ công việc thành các phiên <strong>25 phút</strong> gọi là một Pomodoro. Trong mỗi phiên,
                        bạn tập trung hoàn toàn vào một việc duy nhất. Sau đó, nghỉ ngơi <strong>5 phút</strong> để thư giãn và
                        nạp lại năng lượng.
                    </p>
                </div>

                {/* Image Illustration */}
                <div className="relative w-full aspect-video rounded-lg overflow-hidden border bg-muted">
                    <Image
                        src="/images/content_1/pomodoro_explain.png"
                        alt="Minh họa phương pháp Pomodoro"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>
            </section>

            {/* How to Apply Pomodoro */}
            <section className="space-y-6">
                <div>
                    <Badge className="mb-3">Cách Thực Hiện</Badge>
                    <h2 className="text-3xl font-bold tracking-tight">
                        Cách áp dụng Pomodoro
                    </h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                                    1
                                </div>
                                <CardTitle>Chọn công việc & đặt hẹn giờ</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                Chọn công việc cần làm và đặt hẹn giờ 25 phút để bắt đầu phiên Pomodoro.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                                    2
                                </div>
                                <CardTitle>Tập trung làm việc</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                Tập trung làm việc đến khi đồng hồ báo hết giờ, không bị gián đoạn.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                                    3
                                </div>
                                <CardTitle>Nghỉ ngơi ngắn</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                Nghỉ 5 phút, có thể đứng dậy vận động nhẹ hoặc thư giãn đầu óc.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                                    4
                                </div>
                                <CardTitle>Lặp lại & nghỉ dài</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                Lặp lại chu trình. Sau 4 phiên Pomodoro, nghỉ dài hơn khoảng 15 – 30 phút.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Benefits */}
            <section className="space-y-6">
                <div>
                    <Badge className="mb-3">Lợi Ích</Badge>
                    <h2 className="text-3xl font-bold tracking-tight">
                        Tại sao nên dùng Pomodoro?
                    </h2>
                </div>
                <Card>
                    <CardContent className="pt-6">
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                                <ArrowRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                <span>Tăng sự tập trung và hiệu suất làm việc</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <ArrowRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                <span>Tránh bị quá tải khi làm việc lâu</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <ArrowRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                <span>Dễ đo lường và quản lý tiến độ công việc</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <ArrowRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                <span>Phù hợp với những ai hay bị mất tập trung</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <ArrowRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                <span>Giúp duy trì năng lượng và hiệu quả làm việc lâu dài</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>
                <div className="bg-muted rounded-lg p-6">
                    <p className="text-sm text-muted-foreground italic">
                        💡 <strong>Mẹo:</strong> Bạn hoàn toàn có thể điều chỉnh thời gian làm việc và nghỉ ngơi cho phù hợp với bản thân,
                        miễn sao giữ nguyên nguyên tắc &quot;chia nhỏ khoảng thời gian để tập trung và nghỉ ngơi đều đặn.&quot;
                    </p>
                </div>
            </section>

            {/* How to Use This Website */}
            <section className="space-y-6">
                <div>
                    <Badge className="mb-3">Hướng Dẫn Website</Badge>
                    <h2 className="text-3xl font-bold tracking-tight">
                        Cách sử dụng Study Bro
                    </h2>
                </div>
                <p className="text-lg text-muted-foreground">
                    Study Bro cung cấp các công cụ giúp bạn áp dụng phương pháp Pomodoro một cách hiệu quả.
                </p>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Timer Feature */}
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                    <Timer className="h-6 w-6 text-primary" />
                                </div>
                                <CardTitle>Timer</CardTitle>
                            </div>
                            <CardDescription>
                                Đồng hồ đếm ngược Pomodoro
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                                Trang Timer là trung tâm của ứng dụng, nơi bạn:
                            </p>
                            <ul className="text-sm space-y-2 text-muted-foreground">
                                <li>• Bắt đầu/tạm dừng các phiên Pomodoro</li>
                                <li>• Chọn task để focus vào</li>
                                <li>• Theo dõi thời gian làm việc</li>
                                <li>• Tự động chuyển sang break khi hết giờ</li>
                            </ul>
                            <Link
                                href="/timer"
                                className="inline-flex items-center text-sm font-medium text-primary hover:underline mt-3"
                            >
                                Đi đến Timer <ArrowRight className="ml-1 h-4 w-4" />
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Tasks Feature */}
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                    <CheckSquare className="h-6 w-6 text-primary" />
                                </div>
                                <CardTitle>Tasks</CardTitle>
                            </div>
                            <CardDescription>
                                Quản lý công việc của bạn
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                                Trang Tasks giúp bạn tổ chức công việc:
                            </p>
                            <ul className="text-sm space-y-2 text-muted-foreground">
                                <li>• Tạo, chỉnh sửa và xóa tasks</li>
                                <li>• Đặt độ ưu tiên và thời hạn</li>
                                <li>• Lọc tasks theo trạng thái, ngày</li>
                                <li>• Estimate số Pomodoro cần thiết</li>
                            </ul>
                            <Link
                                href="/tasks"
                                className="inline-flex items-center text-sm font-medium text-primary hover:underline mt-3"
                            >
                                Đi đến Tasks <ArrowRight className="ml-1 h-4 w-4" />
                            </Link>
                        </CardContent>
                    </Card>

                    {/* History Feature */}
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                    <BarChart3 className="h-6 w-6 text-primary" />
                                </div>
                                <CardTitle>History</CardTitle>
                            </div>
                            <CardDescription>
                                Theo dõi tiến độ của bạn
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                                Trang History giúp bạn xem lại:
                            </p>
                            <ul className="text-sm space-y-2 text-muted-foreground">
                                <li>• Lịch sử các phiên Pomodoro</li>
                                <li>• Thống kê theo ngày, tuần, tháng</li>
                                <li>• Tổng thời gian đã làm việc</li>
                                <li>• Biểu đồ năng suất</li>
                            </ul>
                            <Link
                                href="/history"
                                className="inline-flex items-center text-sm font-medium text-primary hover:underline mt-3"
                            >
                                Đi đến History <ArrowRight className="ml-1 h-4 w-4" />
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Settings Feature */}
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                    <Settings className="h-6 w-6 text-primary" />
                                </div>
                                <CardTitle>Settings</CardTitle>
                            </div>
                            <CardDescription>
                                Tùy chỉnh trải nghiệm
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                                Trang Settings cho phép bạn:
                            </p>
                            <ul className="text-sm space-y-2 text-muted-foreground">
                                <li>• Điều chỉnh thời gian Pomodoro & break</li>
                                <li>• Chọn background & theme</li>
                                <li>• Cài đặt âm thanh thông báo</li>
                                <li>• Tùy chỉnh preferences cá nhân</li>
                            </ul>
                            <Link
                                href="/settings"
                                className="inline-flex items-center text-sm font-medium text-primary hover:underline mt-3"
                            >
                                Đi đến Settings <ArrowRight className="ml-1 h-4 w-4" />
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Getting Started */}
            <section className="space-y-6">
                <div>
                    <Badge className="mb-3">Bắt Đầu Ngay</Badge>
                    <h2 className="text-3xl font-bold tracking-tight">
                        Sẵn sàng bắt đầu chưa?
                    </h2>
                </div>
                <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            <p className="text-lg">
                                Hãy bắt đầu hành trình làm việc hiệu quả với Study Bro!
                            </p>
                            <ol className="space-y-3 text-muted-foreground">
                                <li className="flex items-start gap-3">
                                    <span className="font-bold text-primary">1.</span>
                                    <span>Tạo task đầu tiên của bạn trong trang <Link href="/tasks" className="text-primary hover:underline font-medium">Tasks</Link></span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="font-bold text-primary">2.</span>
                                    <span>Điều chỉnh Settings theo sở thích (tùy chọn)</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="font-bold text-primary">3.</span>
                                    <span>Bật <Link href="/timer" className="text-primary hover:underline font-medium">Timer</Link> và bắt đầu Pomodoro đầu tiên!</span>
                                </li>
                            </ol>
                            <div className="pt-4">
                                <Link
                                    href="/timer"
                                    className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
                                >
                                    Bắt đầu ngay <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </section>
        </main>
    );
}
