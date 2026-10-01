import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Tasks • Study Bro App',
    description: 'Manage your tasks and track progress with Pomodoro technique. Create, edit, and organize tasks with priority levels and time estimates.',
    robots: { index: false, follow: true },
}

export default function TasksLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
