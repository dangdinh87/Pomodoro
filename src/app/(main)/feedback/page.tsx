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
import { useI18n } from '@/contexts/i18n-context';

export default function FeedbackPage() {
    const { t } = useI18n();
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
            toast.success(t('feedback.toast.success'));
        } catch (error) {
            toast.error(t('feedback.toast.error'));
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
                <h2 className="mb-2 text-2xl font-bold">{t('feedback.success.title')}</h2>
                <p className="mb-6 max-w-md text-muted-foreground">
                    {t('feedback.success.message')}
                </p>
                <Button
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
        <div className="max-w-2xl mx-auto">
            <div className="mb-8 space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">{t('feedback.title')}</h1>
                <p className="text-muted-foreground">
                    {t('feedback.subtitle')}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border bg-card p-6 shadow-sm">
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium">
                            {t('feedback.form.name')}
                        </label>
                        <Input
                            id="name"
                            placeholder={t('feedback.form.namePlaceholder')}
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">
                            {t('feedback.form.email')}
                        </label>
                        <Input
                            id="email"
                            type="email"
                            placeholder={t('feedback.form.emailPlaceholder')}
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="type" className="text-sm font-medium">
                        {t('feedback.form.type')}
                    </label>
                    <Select
                        value={formData.type}
                        onValueChange={(val) => setFormData({ ...formData, type: val })}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="feature">{t('feedback.form.typeOptions.feature')}</SelectItem>
                            <SelectItem value="bug">{t('feedback.form.typeOptions.bug')}</SelectItem>
                            <SelectItem value="other">{t('feedback.form.typeOptions.other')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">
                        {t('feedback.form.message')} <span className="text-red-500">{t('feedback.form.required')}</span>
                    </label>
                    <Textarea
                        id="message"
                        placeholder={t('feedback.form.messagePlaceholder')}
                        className="min-h-[150px] resize-none"
                        required
                        value={formData.message}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, message: e.target.value })}
                    />
                </div>

                <div className="flex justify-end">
                    <Button type="submit" disabled={loading || !formData.message.trim()}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t('feedback.form.submit')}
                    </Button>
                </div>
            </form>
        </div>
    );
}
