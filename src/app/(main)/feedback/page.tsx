'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FilterChip, FilterChipGroup } from '@/components/ui/filter-chip';
import { PageContainer, PageHeader } from '@/components/ui/page-header';
import { useI18n } from '@/contexts/i18n-context';
import { useAuthStore } from '@/stores/auth-store';
import { Bug, CheckCircle, CircleNotch, Lightbulb, NotePencil, PaperPlaneTilt, Question, Star } from '@phosphor-icons/react/dist/ssr';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const FEEDBACK_TYPES = [
    { key: 'feature', Icon: Lightbulb },
    { key: 'bug', Icon: Bug },
    { key: 'question', Icon: Question },
    { key: 'other', Icon: NotePencil },
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
                    className="rounded-md p-0.5 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand/40"
                    aria-label={`${star}`}
                >
                    <Star
                        size={28}
                        weight={star <= (hover || value) ? 'fill' : 'regular'}
                        className={`transition-colors duration-150 ${
                            star <= (hover || value) ? 'text-gold' : 'text-ink-faint'
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
            <PageContainer size="narrow">
                <div className="mx-auto flex max-w-md flex-col items-center py-12 text-center">
                    <CheckCircle size={40} weight="fill" className="mb-4 text-success" />
                    <h2 className="mb-2 font-heading text-2xl font-bold tracking-[-0.02em] text-ink">{t('feedback.success.title')}</h2>
                    <p className="mb-6 text-sm text-ink-muted">{t('feedback.success.message')}</p>
                    <Button
                        variant="outline"
                        onClick={() => {
                            setSuccess(false);
                            setFormData(prev => ({ ...prev, message: '', rating: 0 }));
                        }}
                    >
                        {t('feedback.success.cta')}
                    </Button>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer size="narrow">
            <PageHeader title={t('feedback.title')} description={t('feedback.subtitle')} />

            <form
                onSubmit={handleSubmit}
                className="max-w-xl rounded-lg border border-border bg-surface p-6"
            >
                <div className="space-y-5">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-ink-secondary">
                            {t('feedback.form.type')}
                        </p>
                        <FilterChipGroup label={t('feedback.form.type')} className="flex-wrap">
                            {FEEDBACK_TYPES.map((ft) => (
                                <FilterChip
                                    key={ft.key}
                                    active={formData.type === ft.key}
                                    onClick={() => setFormData({ ...formData, type: ft.key })}
                                >
                                    <ft.Icon size={14} />
                                    {t(`feedback.form.typeOptions.${ft.key}`)}
                                </FilterChip>
                            ))}
                        </FilterChipGroup>
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm font-medium text-ink-secondary">
                            {t('feedback.form.rating')}
                        </p>
                        <StarRating
                            value={formData.rating}
                            onChange={(v) => setFormData({ ...formData, rating: v })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="message" className="text-sm font-medium text-ink-secondary">
                            {t('feedback.form.message')} <span className="text-danger-ink">{t('feedback.form.required')}</span>
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

                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <label htmlFor="name" className="text-sm font-medium text-ink-secondary">
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
                            <label htmlFor="email" className="text-sm font-medium text-ink-secondary">
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
                        <p className="text-xs text-ink-muted sm:col-span-2">{t('pagesUi.feedback.contactHint')}</p>
                    </div>

                    <Button
                        type="submit"
                        size="lg"
                        className="w-full sm:w-auto"
                        disabled={loading || !formData.message.trim()}
                    >
                        {loading ? (
                            <CircleNotch size={16} className="mr-2 animate-spin" />
                        ) : (
                            <PaperPlaneTilt size={16} className="mr-2" />
                        )}
                        {t('feedback.form.submit')}
                    </Button>
                </div>
            </form>
        </PageContainer>
    );
}
