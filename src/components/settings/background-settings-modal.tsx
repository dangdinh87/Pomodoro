'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import BackgroundSettings from '@/components/settings/background-settings';

export default function BackgroundSettingsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Background Setup</DialogTitle>
          <p className="text-xs text-muted-foreground">
            Các thay đổi chỉ áp dụng sau khi bấm{' '}
            <span className="font-medium">Save</span>.
          </p>
        </DialogHeader>
        <BackgroundSettings />
      </DialogContent>
    </Dialog>
  );
}
