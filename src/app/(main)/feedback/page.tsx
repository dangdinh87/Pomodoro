'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, CheckCircle2 } from 'lucide-react';

export default function FeedbackPage() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        type: 'feature',
        message: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error('Failed to submit feedback');

            setSuccess(true);
            toast.success('Cảm ơn bạn đã đóng góp ý kiến!');
        } catch (error) {
            toast.error('Có lỗi xảy ra. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex h-full flex-col items-center justify-center p-4 text-center animate-in fade-in zoom-in duration-300">
                <div className="mb-4 rounded-full bg-green-100 p-3 text-green-600 dark:bg-green-900/30">
                    <CheckCircle2 className="h-12 w-12" />
                </div>
                <h2 className="mb-2 text-2xl font-bold">Cảm ơn bạn!</h2>
                <p className="mb-6 max-w-md text-muted-foreground">
                    Ý kiến đóng góp của bạn đã được ghi nhận. Chúng tôi sẽ xem xét và cải thiện ứng dụng tốt hơn.
                </p>
                <Button
                    onClick={() => {
                        setSuccess(false);
                        setFormData({ ...formData, message: '' });
                    }}
                >
                    Gửi ý kiến khác
                </Button>
            </div>
        );
    }

    return (
        <div className="container max-w-2xl py-8">
            <div className="mb-8 space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Gửi ý kiến phản hồi</h1>
                <p className="text-muted-foreground">
                    Giúp chúng tôi cải thiện ứng dụng bằng cách gửi báo cáo lỗi hoặc đề xuất tính năng mới.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border bg-card p-6 shadow-sm">
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium">
                            Tên của bạn (Tùy chọn)
                        </label>
                        <Input
                            id="name"
                            placeholder="Nhập tên..."
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">
                            Email (Tùy chọn)
                        </label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="example@email.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="type" className="text-sm font-medium">
                        Loại phản hồi
                    </label>
                    <Select
                        value={formData.type}
                        onValueChange={(val) => setFormData({ ...formData, type: val })}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="feature">✨ Đề xuất tính năng</SelectItem>
                            <SelectItem value="bug">🐛 Báo cáo lỗi</SelectItem>
                            <SelectItem value="other">📝 Khác</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">
                        Nội dung <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                        id="message"
                        placeholder="Mô tả chi tiết ý kiến của bạn..."
                        className="min-h-[150px] resize-none"
                        required
                        value={formData.message}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, message: e.target.value })}
                    />
                </div>

                <div className="flex justify-end">
                    <Button type="submit" disabled={loading || !formData.message.trim()}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Gửi phản hồi
                    </Button>
                </div>
            </form>
        </div>
    );
}
