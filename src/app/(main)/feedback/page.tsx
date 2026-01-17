'use client';

import { BorderBeam } from '@/components/ui/border-beam';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useI18n } from '@/contexts/i18n-context';
import { useAuthStore } from '@/stores/auth-store';
import {
    CheckCircle2,
    Loader2,
    Send,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const feedbackTypeConfig = {
    feature: { label: '✨ Đề xuất tính năng' },
    bug: { label: '🐛 Báo cáo lỗi' },
    question: { label: '❓ Câu hỏi / Góp ý' },
    other: { label: '📝 Khác' },
};

type FeedbackType = keyof typeof feedbackTypeConfig;

export default function FeedbackPage() {
    const { t } = useI18n();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        type: 'feature' as FeedbackType,
        message: '',
    });

    // Pre-fill name/email from user data
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || prev.name,
                email: user.email || prev.email,
            }));
        }
    }, [user]);

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
            toast.success(t('feedback.toast.success'));
        } catch (error) {
            toast.error(t('feedback.toast.error'));
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center p-4 text-center animate-in fade-in zoom-in duration-300">
                <div className="mb-4 rounded-full bg-green-100 p-4 text-green-600 dark:bg-green-900/30">
                    <CheckCircle2 className="h-12 w-12" />
                </div>
                <h2 className="mb-2 text-2xl font-bold">{t('feedback.success.title')}</h2>
                <p className="mb-6 max-w-md text-muted-foreground">
                    {t('feedback.success.message')}
                </p>
                <Button
                    size="lg"
                    onClick={() => {
                        setSuccess(false);
                        setFormData({ ...formData, message: '' });
                    }}
                >
                    {t('feedback.success.cta')}
                </Button>
            </div>
        );
    }

    return (
        <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                {/* Header Section */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold tracking-tight">{t('feedback.title')}</h1>
                    <p className="mt-2 text-muted-foreground">
                        {t('feedback.subtitle')}
                    </p>
                </div>

                {/* Form Card */}
                <form
                    onSubmit={handleSubmit}
                    className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-b from-card/80 to-card/50 p-8 shadow-lg backdrop-blur-xl"
                >

                    <div className="space-y-6">
                        {/* 1. Feedback Type - First for context */}
                        <div className="space-y-2">
                            <label htmlFor="type" className="text-sm font-medium text-foreground/80">
                                {t('feedback.form.type')}
                            </label>
                            <Select
                                value={formData.type}
                                onValueChange={(val) => setFormData({ ...formData, type: val as FeedbackType })}
                            >
                                <SelectTrigger className="h-11">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(feedbackTypeConfig).map(([key, config]) => (
                                        <SelectItem key={key} value={key}>
                                            {config.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* 2. Message Content - Main required field */}
                        <div className="space-y-2">
                            <label htmlFor="message" className="text-sm font-medium text-foreground/80">
                                {t('feedback.form.message')} <span className="text-red-500">{t('feedback.form.required')}</span>
                            </label>
                            <Textarea
                                id="message"
                                placeholder={t('feedback.form.messagePlaceholder')}
                                className="min-h-[140px] resize-none"
                                required
                                value={formData.message}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, message: e.target.value })}
                            />
                        </div>

                        {/* 3. Optional Info - Name & Email at the end */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <label htmlFor="name" className="text-sm font-medium text-foreground/80">
                                    {t('feedback.form.name')}
                                </label>
                                <Input
                                    id="name"
                                    placeholder={t('feedback.form.namePlaceholder')}
                                    className="h-11"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium text-foreground/80">
                                    {t('feedback.form.email')}
                                </label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder={t('feedback.form.emailPlaceholder')}
                                    className="h-11"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Submit Button - Full width */}
                        <Button
                            type="submit"
                            size="lg"
                            className="w-full"
                            disabled={loading || !formData.message.trim()}
                        >
                            {loading && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {t('feedback.form.submit')}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
