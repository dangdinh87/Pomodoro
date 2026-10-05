'use client';

import type { ReactNode } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { useI18n } from '@/contexts/i18n-context';
import { cn } from '@/lib/utils';
import { LAZY_OVERLAYS, LAZY_PANELS } from './panel-loaders';
import { PANELS } from './panel-registry';
import { closePanel, usePanelStore, type PanelId } from './panel-store';

const { tasks: TasksPanel, stats: StatsPanel, arcade: ArcadePanel, settings: SettingsPanel, feedback: FeedbackPanel } =
  LAZY_PANELS;
const { sound: AudioSidebar, scene: BackgroundSettingsModal, timer: TimerSettingsModal, login: LoginForm } = LAZY_OVERLAYS;

const onOpenChange = (open: boolean) => {
  if (!open) closePanel();
};

function PanelTitle({ id, as: Title }: { id: PanelId; as: typeof SheetTitle | typeof DialogTitle }) {
  const { t } = useI18n();
  return <Title className="sr-only">{t(PANELS[id].labelKey)}</Title>;
}

function SheetPanel({ id, side, children }: { id: PanelId; side: 'left' | 'right'; children: ReactNode }) {
  const open = usePanelStore((s) => s.active === id);
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={side} className="w-full overflow-y-auto p-0 sm:max-w-[720px]">
        <PanelTitle id={id} as={SheetTitle} />
        {open && children}
      </SheetContent>
    </Sheet>
  );
}

/**
 * A dialog the panel fills edge to edge (its content is the card). `bare`: the shell is invisible and the
 * content brings its own sticker card (login). The shell scrolls (`overflow-y-auto`) on short screens, and a
 * scroll container clips what sticks out of its padding box, so a bare shell pads 8px: room for the card's
 * 2.5px outline and 6px hard shadow.
 */
function DialogPanel({
  id,
  className,
  bare = false,
  children,
}: {
  id: PanelId;
  className?: string;
  bare?: boolean;
  children: ReactNode;
}) {
  const open = usePanelStore((s) => s.active === id);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'block max-h-[90dvh] max-w-2xl overflow-y-auto p-0',
          bare && 'border-0 bg-transparent p-2 shadow-none',
          className,
        )}
      >
        <PanelTitle id={id} as={DialogTitle} />
        {open && children}
      </DialogContent>
    </Dialog>
  );
}

export function PanelHost({ googleEnabled }: { googleEnabled: boolean }) {
  const active = usePanelStore((s) => s.active);

  return (
    <>
      <AudioSidebar needed={active === 'sound'} open={active === 'sound'} onOpenChange={onOpenChange} />
      <BackgroundSettingsModal needed={active === 'scene'} isOpen={active === 'scene'} onClose={closePanel} />
      <TimerSettingsModal needed={active === 'timer'} isOpen={active === 'timer'} onClose={closePanel} />

      <SheetPanel id="tasks" side="left">
        <TasksPanel />
      </SheetPanel>
      <SheetPanel id="stats" side="right">
        <StatsPanel />
      </SheetPanel>

      <DialogPanel id="settings" className="max-w-3xl sm:h-[min(640px,90dvh)]">
        <SettingsPanel />
      </DialogPanel>
      <DialogPanel id="feedback">
        <FeedbackPanel />
      </DialogPanel>
      {/* Full viewport and untransformed: games position their overlays with `fixed`. */}
      <DialogPanel
        id="arcade"
        className="inset-0 left-0 top-0 h-dvh max-h-none w-screen max-w-none translate-x-0 translate-y-0 rounded-none border-0 sm:rounded-none"
      >
        <ArcadePanel />
      </DialogPanel>
      <DialogPanel id="login" bare className="max-w-md">
        <LoginForm needed googleEnabled={googleEnabled} onSignedIn={closePanel} />
      </DialogPanel>
    </>
  );
}
