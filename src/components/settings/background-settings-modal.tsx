'use client';

import { useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { focusContentOnOpen } from '@/components/ui/overlay-parts';
import { BackgroundSettings, type BackgroundSettingsHandle } from '@/components/settings/background-settings';
import { useI18n } from '@/contexts/i18n-context';

export default function BackgroundSettingsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const [isPreview, setIsPreview] = useState(false);
  const settingsRef = useRef<BackgroundSettingsHandle>(null);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (isPreview || open) return;
        // Esc, a click on the overlay: same as Close, so an unsaved preview is undone
        if (settingsRef.current) settingsRef.current.cancel();
        else onClose();
      }}
    >
      <DialogContent
        aria-describedby={undefined}
        onOpenAutoFocus={focusContentOnOpen}
        className={`sm:max-w-[1000px] h-[85vh] p-0 gap-0 overflow-hidden flex flex-col focus:outline-hidden [&>button]:hidden transition-[background-color,border-color,box-shadow] duration-150 ${
          isPreview ? 'bg-transparent border-transparent shadow-none' : ''
        }`}
        overlayClassName={isPreview ? 'bg-transparent' : undefined}
      >
        <DialogTitle className="sr-only">{t('scenes.title')}</DialogTitle>
        <BackgroundSettings
          ref={settingsRef}
          onClose={onClose}
          isPreview={isPreview}
          onPreviewChange={setIsPreview}
        />
      </DialogContent>
    </Dialog>
  );
}
