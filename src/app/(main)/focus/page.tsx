import StreakTracker from '@/components/focus/streak-tracker'
import { PageContainer } from '@/components/ui/page-header'

export default function FocusPage() {
  return (
    <PageContainer size="narrow">
      <StreakTracker />
    </PageContainer>
  )
}
