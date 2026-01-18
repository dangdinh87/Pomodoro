'use client';

import { useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { BackgroundSettings } from '@/components/settings/background-settings';

export default function BackgroundSettingsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`sm:max-w-[1000px] h-[85vh] p-0 gap-0 overflow-hidden flex flex-col [&>button]:hidden transition-all duration-200 ${isDragging ? '!bg-transparent !border-transparent !shadow-none' : ''}`}
        overlayClassName={`transition-all duration-200 ${isDragging ? 'opacity-0 invisible' : 'opacity-100 visible'}`}
      >
        <BackgroundSettings onClose={onClose} onDragChange={setIsDragging} />
      </DialogContent>
    </Dialog>
  );
}
