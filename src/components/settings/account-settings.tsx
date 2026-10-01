'use client';

import { useState } from 'react';
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
import { useI18n } from '@/contexts/i18n-context';

export function AccountSettings() {
  const { t } = useI18n();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, signOut } = useAuth();

  const [exporting, setExporting] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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

  return (
    <div className="space-y-10">
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
