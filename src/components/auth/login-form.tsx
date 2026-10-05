'use client';

import { Tomo } from '@/components/brand/tomo';
import { useEffect, useRef, useState } from 'react';
import { CircleNotch, EnvelopeSimple, SignIn } from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useI18n } from '@/contexts/i18n-context';
import { useAuth } from '@/hooks/use-auth';
import { authClient } from '@/lib/auth-client';
import { OTP_EMAIL_RATE_LIMITED, OTP_INVALID_EMAIL } from '@/lib/auth/otp-error-codes';

const CODE_LENGTH = 6;
const ERROR_ID = 'login-error';

// Not RFC 5322: "something@domain.tld". The browser's own type=email check accepts "abc@x" (no dot), which the server rejects.
const LOOKS_LIKE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function GoogleGlyph() {
  return (
    <svg className="size-4" aria-hidden="true" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

/** Email-code and Google sign-in; `onSignedIn` runs once a real account is active. */
export function LoginForm({ googleEnabled, onSignedIn }: { googleEnabled: boolean; onSignedIn: () => void }) {
  const { t } = useI18n();
  const { user, isAuthenticated } = useAuth();

  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // The message is about the address itself: mark the field, not only the alert
  const [emailInvalid, setEmailInvalid] = useState(false);
  const emailField = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAuthenticated) onSignedIn();
  }, [isAuthenticated, onSignedIn]);

  // The email form is `noValidate`: the browser would show its own bubble, in the browser's language, and accepts
  // "abc@x". The message is ours (login.errors.invalidEmail), shown in the page language next to the field.
  function rejectEmail() {
    setEmailInvalid(true);
    setError(t('login.errors.invalidEmail'));
    emailField.current?.focus();
  }

  async function sendCode(event?: React.FormEvent) {
    event?.preventDefault();
    setError(null);
    setEmailInvalid(false);
    if (!LOOKS_LIKE_EMAIL.test(email.trim())) return rejectEmail();
    setBusy(true);
    const { error: sendError } = await authClient.emailOtp.sendVerificationOtp({
      email: email.trim(),
      type: 'sign-in',
    });
    setBusy(false);
    if (sendError) {
      if (sendError.status === 400 && sendError.code === OTP_INVALID_EMAIL) return rejectEmail();
      // 429: Better Auth's per-IP limit (this network asked too often) or our per-address limit, which
      // carries a code: then the cause may well be somebody else, so say it is the address (src/lib/auth/otp-limits.ts)
      setError(t(sendError.status === 429 ? (sendError.code === OTP_EMAIL_RATE_LIMITED ? 'login.errors.tooManyCodesForEmail' : 'login.errors.tooManyCodes') : 'login.errors.sendFailed'));
      return;
    }
    setCode('');
    setStep('code');
  }

  async function verifyCode(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const { error: verifyError } = await authClient.signIn.emailOtp({ email: email.trim(), otp: code });
    setBusy(false);
    if (verifyError) {
      setError(t('login.errors.invalidCode'));
      return;
    }
    onSignedIn();
  }

  async function signInWithGoogle() {
    setBusy(true);
    setError(null);
    const { error: googleError } = await authClient.signIn.social({ provider: 'google', callbackURL: '/' });
    if (googleError) {
      setBusy(false);
      setError(t('login.errors.googleConnectionFailed'));
    }
  }

  return (
    // The dialog around this card (panel-host, `bare`) pads its scroll box, so the outline and shadow are not clipped
    <Card className="max-w-md">
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="flex flex-col items-center gap-3 font-heading text-2xl font-extrabold">
          {/* Tomo reacts to the form: worried while an error is showing, happy otherwise */}
          <Tomo face={error ? 'worried' : 'happy'} size={96} />
          {t('login.title')}
        </CardTitle>
        <CardDescription className="text-sm text-ink-secondary">
          {step === 'email' ? t('login.description') : t('login.form.codeSent', { email: email.trim() })}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {step === 'email' ? (
          <form className="space-y-4" onSubmit={sendCode} noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">{t('login.form.email')}</Label>
              <Input
                id="email"
                ref={emailField}
                type="email"
                required
                autoComplete="email"
                placeholder={t('login.form.emailPlaceholder')}
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setEmailInvalid(false);
                }}
                disabled={busy}
                aria-invalid={emailInvalid || undefined}
                aria-describedby={emailInvalid ? ERROR_ID : undefined}
              />
            </div>
            <Button className="w-full" size="lg" type="submit" disabled={busy || !email.trim()}>
              {busy ? <CircleNotch size={16} className="animate-spin motion-reduce:animate-none" /> : <EnvelopeSimple size={16} weight="bold" />}
              {busy ? t('login.form.sending') : t('login.form.sendCode')}
            </Button>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={verifyCode}>
            <div className="space-y-2">
              <Label htmlFor="code">{t('login.form.code')}</Label>
              <Input
                id="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]*"
                maxLength={CODE_LENGTH}
                autoFocus
                className="text-center font-mono text-lg tracking-[0.4em]"
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
                disabled={busy}
              />
            </div>
            <Button className="w-full" size="lg" type="submit" disabled={busy || code.length !== CODE_LENGTH}>
              {busy ? <CircleNotch size={16} className="animate-spin motion-reduce:animate-none" /> : <SignIn size={16} weight="bold" />}
              {busy ? t('login.form.signingIn') : t('login.form.signIn')}
            </Button>
            <div className="flex justify-between gap-3 text-sm">
              <button type="button" className="focus-ring rounded-sm font-bold text-ink-secondary underline-offset-4 hover:text-ink hover:underline" onClick={() => setStep('email')} disabled={busy}>
                {t('login.form.changeEmail')}
              </button>
              <button type="button" className="focus-ring rounded-sm font-bold text-brand underline-offset-4 hover:text-brand-hover hover:underline" onClick={() => sendCode()} disabled={busy}>
                {t('login.form.resend')}
              </button>
            </div>
          </form>
        )}

        {error && (
          <p id={ERROR_ID} role="alert" className="rounded-xl border-2 border-danger-ink bg-danger-bg px-3 py-2 text-sm font-semibold text-danger-ink">
            {error}
          </p>
        )}

        {googleEnabled && step === 'email' && (
          <>
            <div className="flex items-center gap-4 text-sm font-semibold text-ink-muted">
              <Separator className="flex-1" />
              {t('login.form.or')}
              <Separator className="flex-1" />
            </div>
            <Button type="button" variant="secondary" size="lg" className="w-full" onClick={signInWithGoogle} disabled={busy}>
              <GoogleGlyph />
              {t('login.form.continueWithGoogle')}
            </Button>
          </>
        )}

        {user?.isAnonymous && <p className="text-center text-sm text-ink-muted">{t('login.guestNote')}</p>}
      </CardContent>

    </Card>
  );
}
