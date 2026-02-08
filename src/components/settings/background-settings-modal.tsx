'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { BackgroundSettings } from '@/components/settings/background-settings';

export default function BackgroundSettingsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [isPreview, setIsPreview] = useState(false);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        // Prevent closing dialog while user is dragging a slider
        if (!isPreview && !open) onClose();
      }}
    >
      <DialogContent
        className={`sm:max-w-[1000px] h-[85vh] p-0 gap-0 overflow-hidden flex flex-col [&>button]:hidden transition-[background-color,border-color,box-shadow] duration-150 ${
          isPreview ? 'bg-transparent border-transparent shadow-none' : ''
        }`}
        overlayClassName={isPreview ? 'bg-transparent' : undefined}
      >
        <BackgroundSettings
          onClose={onClose}
          isPreview={isPreview}
          onPreviewChange={setIsPreview}
        />
      </DialogContent>
    </Dialog>
  );
}
