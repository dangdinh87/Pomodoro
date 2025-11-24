import StreakTracker from '@/components/focus/streak-tracker'

export default function FocusPage() {
  return (
    <div className="container mx-auto px-4 py-12 min-h-screen flex items-center justify-center">
      <div className="w-full">
        <StreakTracker />
      </div>
    </div>
  )
}