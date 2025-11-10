import { ProgressTracking } from '@/components/progress/progress-tracking'

export default function ProgressPage() {
  return (
    <div className="mt-24 container mx-auto px-4 pb-8 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <ProgressTracking />
      </div>
    </div>
  )
}