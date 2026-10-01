'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase-client';
import { useI18n } from '@/contexts/i18n-context';

const MIN_PASSWORD_LENGTH = 8;

export function AccountSettings() {
  const { t } = useI18n();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, signOut } = useAuth();

  const [hasPassword, setHasPassword] = useState<boolean | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);

  const [exporting, setExporting] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Only email/password identities have a password to change.
  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    supabase.auth.getUser().then(({ data }) => {
      if (cancelled) return;
      const identities = data.user?.identities;
      setHasPassword(
        identities
          ? identities.some((i) => i.provider === 'email')
          : (user?.provider ?? 'email') === 'email',
      );
    });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user?.provider]);

  if (isLoading) return null;

  if (!isAuthenticated || !user) {
    return (
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">{t('settings.account.title')}</h2>
        <p>{t('settings.account.guestPrompt')}</p>
        <Button onClick={() => router.push('/login?redirect=/settings')}>
          {t('settings.account.guestLogin')}
        </Button>
      </section>
    );
  }

  const deleteTarget = user.email ?? 'DELETE';

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setPasswordError(t('settings.account.password.tooShort'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(t('settings.account.password.mismatch'));
      return;
    }
    if (newPassword === currentPassword) {
      setPasswordError(t('settings.account.password.sameAsCurrent'));
      return;
    }
    if (!user?.email) {
      setPasswordError(t('settings.account.password.noEmail'));
      return;
    }
    setSavingPassword(true);
    try {
      // Re-authenticating verifies the current password and gives a fresh
      // session, which Supabase "secure password change" requires.
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });
      if (verifyError) {
        setPasswordError(t('settings.account.password.wrongCurrent'));
        return;
      }
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        const code = (error as { code?: string }).code;
        setPasswordError(
          code === 'same_password'
            ? t('settings.account.password.sameAsCurrent')
            : code === 'weak_password'
              ? t('settings.account.password.weak')
              : t('settings.account.password.error'),
        );
        return;
      }
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success(t('settings.account.password.success'));
    } catch {
      setPasswordError(t('settings.account.password.error'));
    } finally {
      setSavingPassword(false);
    }
  }

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch('/api/account/export');
      if (res.status === 429) {
        toast.error(t('settings.account.export.rateLimited'));
        return;
      }
      if (!res.ok) throw new Error(`Export failed: ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `studybro-data-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success(t('settings.account.export.success'));
    } catch {
      toast.error(t('settings.account.export.error'));
    } finally {
      setExporting(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch('/api/account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: deleteConfirm }),
      });
      if (res.status === 503) {
        setDeleteError(t('settings.account.delete.notConfigured'));
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setDeleteError(
          data?.partial
            ? t('settings.account.delete.partial')
            : t('settings.account.delete.error'),
        );
        return;
      }
      toast.success(t('settings.account.delete.success'));
      try {
        await signOut();
      } catch {
        // The account is already gone; a failed local sign-out must not look like a failed delete.
      }
      window.location.assign('/');
    } catch {
      setDeleteError(t('settings.account.delete.error'));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">{t('settings.account.password.title')}</h2>
          <p>
            {hasPassword === false
              ? t('settings.account.password.oauthManaged', {
                  provider: user.provider ?? 'your provider',
                })
              : t('settings.account.password.description')}
          </p>
        </div>
        {hasPassword === true && (
          <form onSubmit={handleChangePassword} className="max-w-sm space-y-4">
            <div className="space-y-2">
              <Label htmlFor="account-current-password">
                {t('settings.account.password.currentLabel')}
              </Label>
              <Input
                id="account-current-password"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account-new-password">
                {t('settings.account.password.newLabel')}
              </Label>
              <Input
                id="account-new-password"
                type="password"
                autoComplete="new-password"
                minLength={MIN_PASSWORD_LENGTH}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                aria-invalid={!!passwordError}
                aria-describedby={passwordError ? 'account-password-error' : undefined}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account-confirm-password">
                {t('settings.account.password.confirmLabel')}
              </Label>
              <Input
                id="account-confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            {passwordError && (
              <p id="account-password-error" role="alert" className="text-sm text-destructive">
                {passwordError}
              </p>
            )}
            <Button type="submit" disabled={savingPassword || !currentPassword || !newPassword}>
              {t('settings.account.password.submit')}
            </Button>
          </form>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">{t('settings.account.export.title')}</h2>
          <p>{t('settings.account.export.description')}</p>
        </div>
        <Button variant="outline" onClick={handleExport} disabled={exporting}>
          {t('settings.account.export.button')}
        </Button>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">{t('settings.account.delete.title')}</h2>
          <p>{t('settings.account.delete.description')}</p>
        </div>
        <Button
          variant="destructive"
          onClick={() => {
            setDeleteConfirm('');
            setDeleteError(null);
            setDeleteOpen(true);
          }}
        >
          {t('settings.account.delete.button')}
        </Button>

        <AlertDialog open={deleteOpen} onOpenChange={(open) => !deleting && setDeleteOpen(open)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('settings.account.delete.confirmTitle')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('settings.account.delete.confirmDescription', { value: deleteTarget })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-2">
              <Label htmlFor="account-delete-confirm">
                {t('settings.account.delete.confirmLabel')}
              </Label>
              <Input
                id="account-delete-confirm"
                autoComplete="off"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
              />
              {deleteError && (
                <p role="alert" className="text-sm text-destructive">
                  {deleteError}
                </p>
              )}
            </div>
            <AlertDialogFooter>
              <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={deleting}>
                {t('settings.account.delete.cancel')}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={
                  deleting || deleteConfirm.trim().toLowerCase() !== deleteTarget.toLowerCase()
                }
              >
                {t('settings.account.delete.confirmButton')}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>
    </div>
  );
}
