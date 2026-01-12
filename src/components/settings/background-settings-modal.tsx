'use client';

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
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[1000px] h-[85vh] p-0 gap-0 overflow-hidden flex flex-col [&>button]:hidden">
        <BackgroundSettings onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
}
