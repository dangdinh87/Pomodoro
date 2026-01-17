
"use client"

import { useEffect, useState } from "react"
import { Trophy, Timer, CheckCircle2, User as UserIcon } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

type LeaderboardEntry = {
  user_id: string
  name: string
  avatar_url: string | null
  total_focus_time: number
  tasks_completed: number
}

export default function LeaderboardPage() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'time' | 'tasks'>('time')

  useEffect(() => {
    // Sync profile on mount if user is logged in
    if (user) {
      fetch('/api/leaderboard', { method: 'POST' }).catch(console.error)
    }
  }, [user])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/leaderboard?sortBy=${sortBy}`)
        const data = await res.json()
        if (data.data) {
          setEntries(data.data)
        }
      } catch (error) {
        console.error("Failed to fetch leaderboard", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [sortBy])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  return (
    <div className="container max-w-4xl py-8 space-y-8 h-full flex flex-col">
      <div className="flex flex-col items-center text-center space-y-4 shrink-0">
        <div className="p-3 bg-primary/10 rounded-full ring-1 ring-primary/20">
          <Trophy className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Bảng xếp hạng</h1>
        <p className="text-muted-foreground max-w-[600px]">
          Cùng thi đua với cộng đồng StudyBro. Xem ai là người tập trung chăm chỉ nhất!
        </p>
      </div>

      <Card className="border-border/50 bg-card/50 backdrop-blur-sm flex-1 flex flex-col min-h-0">
        <CardHeader className="shrink-0 pb-2">
          <Tabs defaultValue="time" onValueChange={(v) => setSortBy(v as 'time' | 'tasks')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-[400px] mx-auto bg-muted/50">
              <TabsTrigger value="time" className="flex items-center gap-2">
                <Timer className="w-4 h-4" />
                Thời gian tập trung
              </TabsTrigger>
              <TabsTrigger value="tasks" className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Task hoàn thành
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 overflow-hidden pt-4">
          {loading ? (
             <div className="space-y-4">
               {[...Array(5)].map((_, i) => (
                 <div key={i} className="h-16 w-full bg-muted/20 animate-pulse rounded-lg" />
               ))}
             </div>
          ) : (
            <ScrollArea className="h-full pr-4">
              <div className="space-y-3">
                {entries.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        Chưa có dữ liệu. Hãy là người đầu tiên!
                    </div>
                ) : (
                    entries.map((entry, index) => {
                      const isCurrentUser = entry.user_id === user?.id
                      const rank = index + 1
                      
                      return (
                        <div
                          key={entry.user_id}
                          className={cn(
                            "flex items-center gap-4 p-4 rounded-xl transition-all duration-200",
                            isCurrentUser 
                              ? "bg-primary/10 border border-primary/20 shadow-sm" 
                              : "bg-muted/30 border border-transparent hover:bg-muted/50 hover:scale-[1.01]"
                          )}
                        >
                          <div className={cn(
                            "flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm shrink-0",
                            rank === 1 ? "bg-yellow-500/20 text-yellow-500 ring-1 ring-yellow-500/50" :
                            rank === 2 ? "bg-slate-300/20 text-slate-300 ring-1 ring-slate-300/50" :
                            rank === 3 ? "bg-amber-600/20 text-amber-600 ring-1 ring-amber-600/50" :
                            "text-muted-foreground"
                          )}>
                            #{rank}
                          </div>

                          <Avatar className="h-10 w-10 border border-border shrink-0">
                            <AvatarImage src={entry.avatar_url || undefined} />
                            <AvatarFallback>
                                <UserIcon className="w-4 h-4" />
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <p className={cn(
                                "font-medium truncate",
                                isCurrentUser && "text-primary"
                            )}>
                                {entry.name} {isCurrentUser && "(Bạn)"}
                            </p>
                          </div>

                          <div className="text-right font-mono font-medium shrink-0">
                            {sortBy === 'time' ? (
                                <span className="text-primary">{formatTime(entry.total_focus_time)}</span>
                            ) : (
                                <span className="text-emerald-500">{entry.tasks_completed} tasks</span>
                            )}
                          </div>
                        </div>
                      )
                    })
                )}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
