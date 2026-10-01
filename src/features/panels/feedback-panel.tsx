'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FilterChip, FilterChipGroup } from '@/components/ui/filter-chip';
import { PanelBody, PageHeader } from '@/components/ui/page-header';
import { useI18n } from '@/contexts/i18n-context';
import { useAuth } from '@/hooks/use-auth';
import {
    hasErrors,
    MESSAGE_MAX,
    retryAfterMinutes,
    validateFeedbackForm,
    type FeedbackFormErrors,
} from '@/features/feedback/feedback-form';
import { Bug, CheckCircle, CircleNotch, Lightbulb, NotePencil, PaperPlaneTilt, Question, Star } from '@phosphor-icons/react/dist/ssr';
import { useState } from 'react';

const FEEDBACK_TYPES = [
    { key: 'feature', Icon: Lightbulb },
    { key: 'bug', Icon: Bug },
    { key: 'question', Icon: Question },
    { key: 'other', Icon: NotePencil },
] as const;

type FeedbackType = (typeof FEEDBACK_TYPES)[number]['key'];

function StarRating({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: (n: number) => string }) {
    const [hover, setHover] = useState(0);
    const shown = hover || value;

    return (
        <div role="group" className="flex gap-0.5" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    // Clicking the current rating clears it: the rating is optional.
                    onClick={() => onChange(star === value ? 0 : star)}
                    onMouseEnter={() => setHover(star)}
                    aria-pressed={star <= value}
                    aria-label={label(star)}
                    className="rounded-md p-0.5 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand/40"
                >
                    <Star
                        size={26}
                        weight={star <= shown ? 'fill' : 'regular'}
                        className={`transition-colors duration-150 ${star <= shown ? 'text-gold' : 'text-ink-faint'}`}
                    />
                </button>
            ))}
        </div>
    );
}

export default function FeedbackPanel() {
    const { t } = useI18n();
    const { user, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [errors, setErrors] = useState<FeedbackFormErrors>({});
    const [type, setType] = useState<FeedbackType>('feature');
    const [rating, setRating] = useState(0);
    const [message, setMessage] = useState('');
    // Empty means "not edited": the session email is used as the default.
    const [emailEdit, setEmailEdit] = useState<string | null>(null);
    const email = emailEdit ?? (isAuthenticated ? user?.email ?? '' : '');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return;
        const found = validateFeedbackForm({ message, email });
        setErrors(found);
        if (hasErrors(found)) return;

        setLoading(true);
        setSubmitError(null);
        try {
            const res = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type,
                    message: message.trim(),
                    rating: rating || null,
                    name: isAuthenticated ? user?.name : undefined,
                    email: email.trim() || undefined,
                }),
            });
            if (res.status === 429) {
                setSubmitError(t('feedback.errors.rateLimited', { minutes: retryAfterMinutes(res.headers.get('Retry-After')) }));
                return;
            }
            if (!res.ok) throw new Error('Failed to submit feedback');
            setSuccess(true);
        } catch {
            setSubmitError(t('feedback.errors.submitFailed'));
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <PanelBody>
                <div role="status" className="mx-auto flex max-w-sm flex-col items-center py-10 text-center">
                    <CheckCircle size={40} weight="fill" className="mb-4 text-success" aria-hidden />
                    <h2 className="mb-2 font-heading text-2xl font-bold tracking-[-0.02em] text-ink">{t('feedback.success.title')}</h2>
                    <p className="mb-6 text-sm text-ink-muted">{t('feedback.success.message')}</p>
                    <Button
                        variant="outline"
                        onClick={() => {
                            setSuccess(false);
                            setMessage('');
                            setRating(0);
                            setErrors({});
                        }}
                    >
                        {t('feedback.success.cta')}
                    </Button>
                </div>
            </PanelBody>
        );
    }

    const remaining = MESSAGE_MAX - message.length;
    const messageError =
        errors.message === 'required' ? t('feedback.errors.messageRequired')
        : errors.message === 'tooLong' ? t('feedback.errors.messageTooLong', { max: MESSAGE_MAX })
        : null;

    return (
        <PanelBody className="sm:max-w-none">
            <PageHeader title={t('feedback.title')} description={t('feedback.subtitle')} className="mb-6 pr-8" />

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <FilterChipGroup label={t('feedback.form.type')} className="flex-wrap">
                    {FEEDBACK_TYPES.map(({ key, Icon }) => (
                        <FilterChip key={key} active={type === key} onClick={() => setType(key)}>
                            <Icon size={14} aria-hidden />
                            {t(`feedback.form.typeOptions.${key}`)}
                        </FilterChip>
                    ))}
                </FilterChipGroup>

                <div className="space-y-1.5">
                    <label htmlFor="feedback-message" className="text-sm font-medium text-ink-secondary">
                        {t('feedback.form.message')}
                    </label>
                    <Textarea
                        id="feedback-message"
                        placeholder={t('feedback.form.messagePlaceholder')}
                        className="min-h-[120px] resize-none"
                        aria-invalid={!!messageError}
                        aria-describedby="feedback-message-meta"
                        value={message}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                            setMessage(e.target.value);
                            if (errors.message) setErrors((prev) => ({ ...prev, message: undefined }));
                        }}
                    />
                    <div id="feedback-message-meta" className="flex items-start justify-between gap-3 text-xs">
                        <p role="alert" className="text-danger-ink">{messageError}</p>
                        <span className={`ml-auto shrink-0 tabular-nums ${remaining < 0 ? 'text-danger-ink' : remaining < 100 ? 'text-ink-secondary' : 'text-ink-faint'}`}>
                            {message.length}/{MESSAGE_MAX}
                        </span>
                    </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-1.5">
                        <p className="text-sm font-medium text-ink-secondary">
                            {t('feedback.form.rating')}{' '}
                            <span className="font-normal text-ink-muted">({t('pagesUi.feedback.optional')})</span>
                        </p>
                        <StarRating value={rating} onChange={setRating} label={(n) => t('feedback.form.starLabel', { n })} />
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="feedback-email" className="text-sm font-medium text-ink-secondary">
                            {t('feedback.form.email')}
                        </label>
                        <Input
                            id="feedback-email"
                            type="email"
                            autoComplete="email"
                            placeholder={t('feedback.form.emailPlaceholder')}
                            aria-invalid={!!errors.email}
                            value={email}
                            onChange={(e) => {
                                setEmailEdit(e.target.value);
                                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                            }}
                        />
                        {errors.email ? (
                            <p role="alert" className="text-xs text-danger-ink">{t('feedback.errors.emailInvalid')}</p>
                        ) : (
                            <p className="text-xs text-ink-muted">{t('pagesUi.feedback.contactHint')}</p>
                        )}
                    </div>
                </div>

                {submitError && (
                    <p role="alert" className="rounded-lg border border-danger/40 px-3 py-2 text-sm text-danger-ink">
                        {submitError}
                    </p>
                )}

                <div className="flex justify-end">
                    <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={loading}>
                        {loading ? <CircleNotch size={16} className="animate-spin" aria-hidden /> : <PaperPlaneTilt size={16} aria-hidden />}
                        {t('feedback.form.submit')}
                    </Button>
                </div>
            </form>
        </PanelBody>
    );
}
