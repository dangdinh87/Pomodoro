"use client"

import { TaskManagement } from '@/components/tasks/task-management'
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export default function TasksPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  if (isLoading) {
    return (
      <main
        className="container mx-auto px-4 py-12 min-h-screen flex flex-col w-full items-center justify-center"
        aria-label="Tasks management page"
      >
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    )
  }

  if (!isAuthenticated) {
    return (
      <main
        className="container mx-auto px-4 py-12 min-h-screen flex flex-col items-center justify-center space-y-4"
        aria-label="Tasks management page"
      >
        <h2 className="text-xl font-semibold text-center">Vui lòng đăng nhập để quản lý công việc</h2>
        <Button onClick={() => router.push('/login?redirect=/tasks')}>Đăng nhập</Button>
      </main>
    )
  }

  return (
    <main
      className="container mx-auto px-4 py-12 min-h-screen flex flex-col w-full"
      aria-label="Tasks management page"
    >
      <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col">
        <TaskManagement />
      </div>
    </main>
  )
}
