'use client';

import { useState } from 'react';
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
import { useI18n } from '@/contexts/i18n-context';
import { SettingsRow, SettingsSection } from '@/components/settings/settings-section';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DownloadSimple, SignOut, UserCircle } from '@phosphor-icons/react/dist/ssr';
import { openPanel } from '@/features/app-shell/panel-store';

export function AccountSettings() {
  const { t } = useI18n();
  const { user, isAuthenticated, isLoading, signOut } = useAuth();

  const [exporting, setExporting] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  if (isLoading) return null;

  if (!isAuthenticated || !user) {
    return (
      <div className="rounded-lg border border-border bg-surface p-5">
        <div className="flex items-start gap-3.5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-raised text-ink-secondary">
            <UserCircle size={22} aria-hidden />
          </span>
          <div className="min-w-0 space-y-1">
            <h2 className="font-heading text-[0.9375rem] font-bold tracking-[-0.01em] text-ink">
              {t('settings.account.guest.title')}
            </h2>
            <p className="text-[0.8125rem] leading-snug text-ink-muted">{t('settings.account.guest.description')}</p>
          </div>
        </div>
        <Button className="mt-4 w-full sm:w-auto" onClick={() => openPanel('login')}>
          {t('settings.account.guestLogin')}
        </Button>
      </div>
    );
  }

  const deleteTarget = user.email ?? 'DELETE';

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

  async function handleSignOut() {
    try {
      await signOut();
    } catch {
      toast.error(t('settings.account.signOutError'));
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
      if (!res.ok) {
        setDeleteError(t('settings.account.delete.error'));
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

  const initial = (user.name || user.email || '?').trim().charAt(0).toUpperCase();

  return (
    <div className="space-y-8">
      <SettingsSection title={t('settings.account.title')}>
        <div className="flex items-center gap-3.5 px-4 py-4 sm:px-5">
          <Avatar className="size-11">
            {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt="" />}
            <AvatarFallback className="bg-surface-raised font-heading text-base font-bold text-ink-secondary">
              {initial}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            {user.name && <p className="truncate text-[0.9375rem] font-semibold text-ink">{user.name}</p>}
            <p className="truncate text-[0.8125rem] text-ink-muted">{user.email}</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <SignOut size={14} aria-hidden />
            {t('settings.account.signOut')}
          </Button>
        </div>
        <SettingsRow label={t('settings.account.export.title')} description={t('settings.account.export.description')}>
          <Button variant="outline" className="w-full" onClick={handleExport} disabled={exporting}>
            <DownloadSimple size={14} aria-hidden />
            {t('settings.account.export.button')}
          </Button>
        </SettingsRow>
      </SettingsSection>

      <section className="space-y-3">
        <h2 className="font-heading text-[0.9375rem] font-bold tracking-[-0.01em] text-danger-ink">
          {t('settings.account.delete.title')}
        </h2>
        <div className="rounded-lg border border-danger/40 bg-surface">
          <SettingsRow label={t('settings.account.delete.title')} description={t('settings.account.delete.description')}>
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => {
                setDeleteConfirm('');
                setDeleteError(null);
                setDeleteOpen(true);
              }}
            >
              {t('settings.account.delete.button')}
            </Button>
          </SettingsRow>
        </div>

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
