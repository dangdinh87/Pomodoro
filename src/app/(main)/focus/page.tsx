import StreakTracker from '@/components/focus/streak-tracker'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Focus • Improcode',
  description: 'Track your focus streaks and maintain your productivity habits.',
}

export default function FocusPage() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="w-full">
        <StreakTracker />
      </div>
    </div>
  )
}
