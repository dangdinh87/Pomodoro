'use client';

import { motion, useReducedMotion } from 'motion/react';
import { Tomo } from '@/components/brand/tomo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Bug, CircleNotch, Lightbulb, NotePencil, PaperPlaneTilt, Question } from '@phosphor-icons/react/dist/ssr';
import { useRef, useState } from 'react';

const FEEDBACK_TYPES = [
    { key: 'feature', Icon: Lightbulb },
    { key: 'bug', Icon: Bug },
    { key: 'question', Icon: Question },
    { key: 'other', Icon: NotePencil },
] as const;

type FeedbackType = (typeof FEEDBACK_TYPES)[number]['key'];

/** Hand-drawn star: gold with the sticker outline when lit, an empty outline when not (readable on every surface). */
function StarShape({ lit }: { lit: boolean }) {
    return (
        <svg viewBox="0 0 24 24" width={30} height={30} aria-hidden="true" focusable="false">
            <path
                d="M12 2.9l2.7 5.8 6.3.8-4.6 4.4 1.2 6.3L12 17.1l-5.6 3.1 1.2-6.3L3 9.5l6.3-.8L12 2.9Z"
                fill={lit ? 'var(--gold)' : 'transparent'}
                stroke={lit ? 'var(--outline)' : 'var(--control-edge)'}
                strokeWidth={1.8}
                strokeLinejoin="round"
                className="transition-[fill] duration-150"
            />
        </svg>
    );
}

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
                    className="focus-ring rounded-md p-0.5 transition-transform duration-100 hover:-translate-y-px active:translate-y-px focus-visible:outline-offset-0"
                >
                    <StarShape lit={star <= shown} />
                </button>
            ))}
        </div>
    );
}

export default function FeedbackPanel() {
    const { t } = useI18n();
    const { user, isAuthenticated } = useAuth();
    const reduceMotion = useReducedMotion();
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
    const messageField = useRef<HTMLTextAreaElement>(null);
    const emailField = useRef<HTMLInputElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return;
        const found = validateFeedbackForm({ message, email });
        setErrors(found);
        if (hasErrors(found)) {
            // Move to the first field that needs fixing, so keyboard and screen-reader users land on the problem
            (found.message ? messageField : emailField).current?.focus();
            return;
        }

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
                <div role="status" className="mx-auto flex max-w-sm flex-col items-center py-8 text-center">
                    <motion.div
                        initial={reduceMotion ? false : { scale: 0.6 }}
                        animate={reduceMotion ? undefined : { scale: 1 }}
                        transition={{ type: 'spring', stiffness: 420, damping: 22 }}
                    >
                        {/* two little hops of joy */}
                        <motion.div
                            animate={reduceMotion ? undefined : { y: [0, -14, 0, -7, 0] }}
                            transition={{ duration: 0.9, delay: 0.15, ease: 'easeOut' }}
                        >
                            <Tomo face="party" size={136} />
                        </motion.div>
                    </motion.div>
                    {/* Tomo's thank-you: a speech bubble whose tail points up at the mascot */}
                    <div className="relative mt-5 border-sticker rounded-lg bg-surface px-5 py-4 shadow-sticker-sm">
                        <span
                            aria-hidden="true"
                            className="absolute -top-[9px] left-1/2 size-4 -translate-x-1/2 rotate-45 border-l-[length:var(--outline-w)] border-t-[length:var(--outline-w)] border-outline bg-surface"
                        />
                        <h2 className="relative font-heading text-2xl font-extrabold tracking-[-0.02em] text-ink">{t('feedback.success.title')}</h2>
                        <p className="relative mt-1.5 text-sm font-semibold text-ink-secondary">{t('feedback.success.message')}</p>
                    </div>
                    <Button
                        variant="secondary"
                        className="mt-6"
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

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
                <FilterChipGroup label={t('feedback.form.type')} className="flex-wrap">
                    {FEEDBACK_TYPES.map(({ key, Icon }) => (
                        <FilterChip key={key} active={type === key} onClick={() => setType(key)}>
                            <Icon size={14} aria-hidden />
                            {t(`feedback.form.typeOptions.${key}`)}
                        </FilterChip>
                    ))}
                </FilterChipGroup>

                <div className="space-y-1.5">
                    <Label htmlFor="feedback-message">{t('feedback.form.message')}</Label>
                    <Textarea
                        id="feedback-message"
                        ref={messageField}
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
                        <span className={`ml-auto shrink-0 font-semibold tabular-nums ${remaining < 0 ? 'text-danger-ink' : remaining < 100 ? 'text-ink-secondary' : 'text-ink-muted'}`}>
                            {message.length}/{MESSAGE_MAX}
                        </span>
                    </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-1.5">
                        <p className="text-sm font-bold text-ink">
                            {t('feedback.form.rating')}{' '}
                            <span className="font-medium text-ink-muted">({t('pagesUi.feedback.optional')})</span>
                        </p>
                        <StarRating value={rating} onChange={setRating} label={(n) => t('feedback.form.starLabel', { n })} />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="feedback-email">{t('feedback.form.email')}</Label>
                        <Input
                            id="feedback-email"
                            ref={emailField}
                            type="email"
                            autoComplete="email"
                            placeholder={t('feedback.form.emailPlaceholder')}
                            aria-invalid={!!errors.email}
                            aria-describedby="feedback-email-hint"
                            value={email}
                            onChange={(e) => {
                                setEmailEdit(e.target.value);
                                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                            }}
                        />
                        {errors.email ? (
                            <p id="feedback-email-hint" role="alert" className="text-xs text-danger-ink">{t('feedback.errors.emailInvalid')}</p>
                        ) : (
                            <p id="feedback-email-hint" className="text-xs text-ink-muted">{t('pagesUi.feedback.contactHint')}</p>
                        )}
                    </div>
                </div>

                {submitError && (
                    <p role="alert" className="rounded-md border-2 border-danger-ink bg-danger-bg px-3 py-2 text-sm font-semibold text-danger-ink">
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
