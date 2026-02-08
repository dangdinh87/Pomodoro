'use client';

import { BorderBeam } from '@/components/ui/border-beam';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useI18n } from '@/contexts/i18n-context';
import { useAuthStore } from '@/stores/auth-store';
import {
    CheckCircle2,
    Loader2,
    Send,
    Star,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const FEEDBACK_TYPES = [
    { key: 'feature', emoji: '✨', color: 'bg-purple-500/10 border-purple-500/30 hover:border-purple-500/60 text-purple-600 dark:text-purple-400' },
    { key: 'bug', emoji: '🐛', color: 'bg-red-500/10 border-red-500/30 hover:border-red-500/60 text-red-600 dark:text-red-400' },
    { key: 'question', emoji: '❓', color: 'bg-blue-500/10 border-blue-500/30 hover:border-blue-500/60 text-blue-600 dark:text-blue-400' },
    { key: 'other', emoji: '📝', color: 'bg-amber-500/10 border-amber-500/30 hover:border-amber-500/60 text-amber-600 dark:text-amber-400' },
] as const;

type FeedbackType = (typeof FEEDBACK_TYPES)[number]['key'];

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    const [hover, setHover] = useState(0);

    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onChange(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    className="transition-transform hover:scale-110 active:scale-95"
                >
                    <Star
                        className={`h-7 w-7 transition-colors ${
                            star <= (hover || value)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-muted-foreground/30'
                        }`}
                    />
                </button>
            ))}
        </div>
    );
}

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
        rating: 0,
    });

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
                body: JSON.stringify({
                    ...formData,
                    rating: formData.rating || undefined,
                }),
            });

            if (!res.ok) throw new Error('Failed to submit feedback');

            setSuccess(true);
            toast.success(t('feedback.toast.success'));
        } catch {
            toast.error(t('feedback.toast.error'));
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="mx-auto flex max-w-lg flex-col items-center justify-center px-4 py-16 text-center animate-in fade-in zoom-in duration-300">
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
                        setFormData(prev => ({ ...prev, message: '', rating: 0 }));
                    }}
                >
                    {t('feedback.success.cta')}
                </Button>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-lg px-4 py-8">
            {/* Header */}
            <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold tracking-tight">{t('feedback.title')}</h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                    {t('feedback.subtitle')}
                </p>
            </div>

            {/* Form Card */}
            <form
                onSubmit={handleSubmit}
                className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-b from-card/80 to-card/50 p-6 shadow-lg backdrop-blur-xl"
            >
                <BorderBeam />

                <div className="space-y-5">
                    {/* Feedback Type Cards */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground/80">
                            {t('feedback.form.type')}
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            {FEEDBACK_TYPES.map((ft) => {
                                const isSelected = formData.type === ft.key;
                                return (
                                    <button
                                        key={ft.key}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: ft.key })}
                                        className={`flex flex-col items-center gap-1 rounded-xl border-2 p-2.5 transition-all ${
                                            isSelected
                                                ? `${ft.color} ring-2 ring-offset-2 ring-offset-background scale-[1.02]`
                                                : 'border-border/50 hover:border-border bg-card/50'
                                        }`}
                                    >
                                        <span className="text-xl">{ft.emoji}</span>
                                        <span className={`text-xs font-medium ${isSelected ? '' : 'text-muted-foreground'}`}>
                                            {t(`feedback.form.typeOptions.${ft.key}`)}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Star Rating */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground/80">
                            {t('feedback.form.rating')}
                        </label>
                        <StarRating
                            value={formData.rating}
                            onChange={(v) => setFormData({ ...formData, rating: v })}
                        />
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                        <label htmlFor="message" className="text-sm font-medium text-foreground/80">
                            {t('feedback.form.message')} <span className="text-red-500">{t('feedback.form.required')}</span>
                        </label>
                        <Textarea
                            id="message"
                            placeholder={t('feedback.form.messagePlaceholder')}
                            className="min-h-[120px] resize-none"
                            required
                            value={formData.message}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                setFormData({ ...formData, message: e.target.value })
                            }
                        />
                    </div>

                    {/* Name & Email */}
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <label htmlFor="name" className="text-sm font-medium text-foreground/80">
                                {t('feedback.form.name')}
                            </label>
                            <Input
                                id="name"
                                placeholder={t('feedback.form.namePlaceholder')}
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label htmlFor="email" className="text-sm font-medium text-foreground/80">
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

                    {/* Submit */}
                    <Button
                        type="submit"
                        size="lg"
                        className="w-full"
                        disabled={loading || !formData.message.trim()}
                    >
                        {loading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="mr-2 h-4 w-4" />
                        )}
                        {t('feedback.form.submit')}
                    </Button>
                </div>
            </form>
        </div>
    );
}
