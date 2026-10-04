"use client"

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { TimerSettings } from '@/components/settings/timer-settings'
import { useI18n } from '@/contexts/i18n-context'

export function TimerSettingsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { t } = useI18n()
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        aria-describedby={undefined}
        className="sm:max-w-[900px] h-[85vh] p-0 gap-0 overflow-hidden flex flex-col [&>button]:hidden"
      >
        <DialogTitle className="sr-only">{t('timerSettings.title')}</DialogTitle>
        <TimerSettings onClose={onClose} />
      </DialogContent>
    </Dialog>
  )
}

export default TimerSettingsModal
