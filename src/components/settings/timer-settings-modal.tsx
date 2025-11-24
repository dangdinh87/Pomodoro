"use client"

import { Dialog, DialogContent } from '@/components/ui/dialog'
import { TimerSettings } from '@/components/settings/timer-settings'

export function TimerSettingsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] h-[85vh] p-0 gap-0 overflow-hidden flex flex-col [&>button]:hidden">
        <TimerSettings onClose={onClose} />
      </DialogContent>
    </Dialog>
  )
}

export default TimerSettingsModal
