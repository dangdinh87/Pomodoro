"use client"

import { Tabs, TabsContent, TabsContents, TabsList, TabsTrigger } from "@/components/animate-ui/components/animate/tabs"
import { GeneralSettings } from "@/components/settings/general-settings"
import { TimerSettings } from "@/components/settings/timer-settings"
import { BackgroundSettings } from "@/components/settings/background-settings"

export default function SettingsPage() {
    return (
        <div className="container max-w-4xl py-6 px-6 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">
                    Manage your preferences, timer settings, and appearance.
                </p>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="w-full justify-start h-auto p-1">
                    <TabsTrigger value="general" className="flex-1">General</TabsTrigger>
                    <TabsTrigger value="timer" className="flex-1">Timer</TabsTrigger>
                    <TabsTrigger value="background" className="flex-1">Background</TabsTrigger>
                </TabsList>
                <TabsContents className="mt-6">
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
            </Tabs >
        </div >
    )
}
