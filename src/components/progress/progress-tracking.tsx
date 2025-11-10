"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { 
  Clock, 
  Target, 
  TrendingUp, 
  Calendar, 
  Trophy,
  Flame,
  Award,
  Zap
} from 'lucide-react'

interface SessionData {
  date: string
  workMinutes: number
  breakMinutes: number
  sessions: number
}

interface SkillProgress {
  skill: string
  targetHours: number
  currentHours: number
  color: string
}

interface StreakData {
  currentStreak: number
  longestStreak: number
  lastSessionDate: string
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export function ProgressTracking() {
  const [timeRange, setTimeRange] = useState('week')
  const [sessionData, setSessionData] = useState<SessionData[]>([])
  const [skills, setSkills] = useState<SkillProgress[]>([
    { skill: 'Programming', targetHours: 10000, currentHours: 1250, color: '#3b82f6' },
    { skill: 'Design', targetHours: 10000, currentHours: 800, color: '#10b981' },
    { skill: 'Writing', targetHours: 10000, currentHours: 450, color: '#f59e0b' },
    { skill: 'Music', targetHours: 10000, currentHours: 300, color: '#ef4444' },
  ])
  const [streak, setStreak] = useState<StreakData>({
    currentStreak: 7,
    longestStreak: 21,
    lastSessionDate: new Date().toISOString()
  })

  useEffect(() => {
    // Generate mock data for demonstration
    const generateMockData = () => {
      const data: SessionData[] = []
      const today = new Date()
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        
        data.push({
          date: date.toLocaleDateString('en-US', { weekday: 'short' }),
          workMinutes: Math.floor(Math.random() * 120) + 60,
          breakMinutes: Math.floor(Math.random() * 30) + 15,
          sessions: Math.floor(Math.random() * 4) + 2
        })
      }
      
      return data
    }

    setSessionData(generateMockData())
  }, [timeRange])

  const totalHours = skills.reduce((acc, skill) => acc + skill.currentHours, 0)
  const totalTargetHours = skills.reduce((acc, skill) => acc + skill.targetHours, 0)
  const overallProgress = (totalHours / totalTargetHours) * 100

  const getMotivationalMessage = () => {
    if (streak.currentStreak >= 30) return "Incredible! You're on fire! 🔥"
    if (streak.currentStreak >= 21) return "Amazing consistency! Keep it up! 💪"
    if (streak.currentStreak >= 14) return "Great momentum building! 📈"
    if (streak.currentStreak >= 7) return "Solid week of progress! 🎯"
    if (streak.currentStreak >= 3) return "Good start! Keep going! 🚀"
    return "Every session counts! Begin your journey! 🌱"
  }

  const pieData = skills.map(skill => ({
    name: skill.skill,
    value: skill.currentHours,
    color: skill.color
  }))

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Progress Tracking</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-background/80 backdrop-blur-sm border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Hours</p>
                <p className="text-2xl font-bold">{totalHours.toFixed(1)}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-background/80 backdrop-blur-sm border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold">{streak.currentStreak} days</p>
              </div>
              <Flame className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-background/80 backdrop-blur-sm border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overall Progress</p>
                <p className="text-2xl font-bold">{overallProgress.toFixed(1)}%</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-background/80 backdrop-blur-sm border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold">
                  {sessionData.reduce((acc, day) => acc + day.sessions, 0)} sessions
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Motivational Message */}
      <Card className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-950/20 dark:to-indigo-950/20 backdrop-blur-sm border-white/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">{getMotivationalMessage()}</h3>
              <p className="text-muted-foreground">
                You're {(totalTargetHours - totalHours).toFixed(1)} hours away from your 10,000-hour mastery goal!
              </p>
            </div>
            <Trophy className="h-12 w-12 text-yellow-500" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Session Activity Chart */}
        <Card className="bg-background/80 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle>Session Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sessionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="workMinutes" fill="#3b82f6" name="Work Minutes" />
                <Bar dataKey="breakMinutes" fill="#10b981" name="Break Minutes" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Skills Progress */}
        <Card className="bg-background/80 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle>Skills Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Individual Skill Progress */}
      <Card className="bg-background/80 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle>Skill Progress Towards 10,000 Hours</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {skills.map((skill) => {
            const progress = (skill.currentHours / skill.targetHours) * 100
            const remainingHours = skill.targetHours - skill.currentHours
            
            return (
              <div key={skill.skill} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: skill.color }}
                    />
                    <span className="font-medium">{skill.skill}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {skill.currentHours.toFixed(1)} / {skill.targetHours} hours
                    </Badge>
                    <Badge variant={progress >= 50 ? "default" : "secondary"}>
                      {progress.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  {remainingHours > 0 
                    ? `${remainingHours.toFixed(1)} hours remaining to mastery`
                    : "Mastery achieved! 🎉"
                  }
                </p>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="bg-background/80 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Recent Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Zap className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="font-medium">Week Warrior</p>
                <p className="text-sm text-muted-foreground">7 day streak</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div>
                <p className="font-medium">Productive Week</p>
                <p className="text-sm text-muted-foreground">20+ sessions</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Clock className="h-8 w-8 text-blue-500" />
              <div>
                <p className="font-medium">Time Master</p>
                <p className="text-sm text-muted-foreground">100+ hours tracked</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}