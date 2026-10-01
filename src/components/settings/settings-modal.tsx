"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GeneralSettings } from "@/components/settings/general-settings"
import { TimerSettings } from "@/components/settings/timer-settings"
import { BackgroundSettings } from "@/components/settings/background-settings"
import { Gear } from '@phosphor-icons/react/dist/ssr';
import { useTranslation } from "@/contexts/i18n-context"

interface SettingsModalProps {
    isOpen: boolean
    onClose: () => void
    defaultTab?: "general" | "timer" | "background" | "audio"
}

export function SettingsModal({ isOpen, onClose, defaultTab = "general" }: SettingsModalProps) {
    const { t } = useTranslation()

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto p-6">
                <DialogHeader className="mb-4">
                    <DialogTitle className="flex items-center gap-2 font-heading text-2xl">
                        <Gear size={24} />
                        {t('settings.title')}
                    </DialogTitle>
                </DialogHeader>

                <Tabs defaultValue={defaultTab} className="w-full">
                    <TabsList>
                        <TabsTrigger value="general" className="flex-1">{t('settings.tabs.general')}</TabsTrigger>
                        <TabsTrigger value="timer" className="flex-1">{t('settings.tabs.timer')}</TabsTrigger>
                        <TabsTrigger value="background" className="flex-1">{t('settings.tabs.background')}</TabsTrigger>
                    </TabsList>
                    
                        <TabsContent value="general" className="mt-6">
                            <GeneralSettings />
                        </TabsContent>
                        <TabsContent value="timer" className="mt-6">
                            <TimerSettings />
                        </TabsContent>
                        <TabsContent value="background" className="mt-6">
                            <BackgroundSettings />
                        </TabsContent>
                    
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
