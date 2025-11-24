"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsContents, TabsList, TabsTrigger } from "@/components/animate-ui/components/animate/tabs"
import { GeneralSettings } from "@/components/settings/general-settings"
import { TimerSettings } from "@/components/settings/timer-settings"
import { BackgroundSettings } from "@/components/settings/background-settings"
import { Settings } from "lucide-react"

interface SettingsModalProps {
    isOpen: boolean
    onClose: () => void
    defaultTab?: "general" | "timer" | "background" | "audio"
}

export function SettingsModal({ isOpen, onClose, defaultTab = "general" }: SettingsModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto p-6">
                <DialogHeader className="mb-4">
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                        <Settings className="h-6 w-6" />
                        Settings
                    </DialogTitle>
                </DialogHeader>

                <Tabs defaultValue={defaultTab} className="w-full">
                    <TabsList className="w-full justify-start h-auto p-1 mb-6">
                        <TabsTrigger value="general" className="flex-1">General</TabsTrigger>
                        <TabsTrigger value="timer" className="flex-1">Timer</TabsTrigger>
                        <TabsTrigger value="background" className="flex-1">Background</TabsTrigger>
                    </TabsList>
                    <TabsContents>
                        <TabsContent value="general">
                            <GeneralSettings />
                        </TabsContent>
                        <TabsContent value="timer">
                            <TimerSettings />
                        </TabsContent>
                        <TabsContent value="background">
                            <BackgroundSettings />
                        </TabsContent>
                    </TabsContents>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
