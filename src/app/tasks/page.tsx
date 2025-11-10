import { TaskManagement } from '@/components/tasks/task-management'

export default function TasksPage() {
  return (
    <div className="mt-24 container mx-auto px-4 pb-8 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <TaskManagement />
      </div>
    </div>
  )
}