import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  estimatedPomodoros: number
  actualPomodoros: number
  category: string
  priority: 'low' | 'medium' | 'high'
  createdAt: Date
  completedAt?: Date
}

interface Project {
  id: string
  name: string
  color: string
  tasks: Task[]
  createdAt: Date
}

interface SessionData {
  date: string
  workSessions: number
  breakSessions: number
  totalFocusTime: number // in minutes
  tasksCompleted: number
}

interface SkillProgress {
  name: string
  value: number
  target: number
  color: string
}

interface StreakData {
  current: number
  longest: number
  lastActiveDate: string | null
}

interface UserState {
  projects: Project[]
  sessionData: SessionData[]
  skills: SkillProgress[]
  streak: StreakData
  
  // Project and task actions
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void
  addTask: (projectId: string, task: Omit<Task, 'id' | 'createdAt'>) => void
  updateTask: (projectId: string, taskId: string, updates: Partial<Task>) => void
  deleteTask: (projectId: string, taskId: string) => void
  toggleTaskComplete: (projectId: string, taskId: string) => void
  updateTaskPomodoros: (projectId: string, taskId: string, increment: number) => void
  
  // Session data actions
  addSessionData: (session: Omit<SessionData, 'date'>) => void
  updateSessionData: (date: string, updates: Partial<SessionData>) => void
  
  // Skills actions
  updateSkill: (name: string, value: number) => void
  
  // Streak actions
  updateStreak: (increment: boolean) => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      projects: [],
      sessionData: [],
      skills: [
        { name: 'Focus', value: 75, target: 100, color: '#3b82f6' },
        { name: 'Productivity', value: 60, target: 100, color: '#10b981' },
        { name: 'Consistency', value: 85, target: 100, color: '#f59e0b' },
        { name: 'Time Management', value: 70, target: 100, color: '#8b5cf6' },
      ],
      streak: {
        current: 0,
        longest: 0,
        lastActiveDate: null,
      },
      
      addProject: (project) =>
        set((state) => ({
          projects: [
            ...state.projects,
            {
              ...project,
              id: Date.now().toString(),
              createdAt: new Date(),
              tasks: [],
            },
          ],
        })),
      
      updateProject: (id, updates) =>
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === id ? { ...project, ...updates } : project
          ),
        })),
      
      deleteProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((project) => project.id !== id),
        })),
      
      addTask: (projectId, task) =>
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  tasks: [
                    ...project.tasks,
                    {
                      ...task,
                      id: Date.now().toString(),
                      createdAt: new Date(),
                    },
                  ],
                }
              : project
          ),
        })),
      
      updateTask: (projectId, taskId, updates) =>
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  tasks: project.tasks.map((task) =>
                    task.id === taskId ? { ...task, ...updates } : task
                  ),
                }
              : project
          ),
        })),
      
      deleteTask: (projectId, taskId) =>
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  tasks: project.tasks.filter((task) => task.id !== taskId),
                }
              : project
          ),
        })),
      
      toggleTaskComplete: (projectId, taskId) => {
        const { projects } = get()
        const project = projects.find((p) => p.id === projectId)
        const task = project?.tasks.find((t) => t.id === taskId)
        
        if (task) {
          const updatedTask = {
            ...task,
            completed: !task.completed,
            completedAt: !task.completed ? new Date() : undefined,
          }
          
          get().updateTask(projectId, taskId, updatedTask)
        }
      },
      
      updateTaskPomodoros: (projectId, taskId, increment) => {
        const { projects } = get()
        const project = projects.find((p) => p.id === projectId)
        const task = project?.tasks.find((t) => t.id === taskId)
        
        if (task) {
          const newActualPomodoros = Math.max(0, task.actualPomodoros + increment)
          get().updateTask(projectId, taskId, { actualPomodoros: newActualPomodoros })
        }
      },
      
      addSessionData: (session) => {
        const today = new Date().toISOString().split('T')[0]
        const { sessionData } = get()
        const existingSession = sessionData.find((s) => s.date === today)
        
        if (existingSession) {
          get().updateSessionData(today, {
            workSessions: existingSession.workSessions + session.workSessions,
            breakSessions: existingSession.breakSessions + session.breakSessions,
            totalFocusTime: existingSession.totalFocusTime + session.totalFocusTime,
            tasksCompleted: existingSession.tasksCompleted + session.tasksCompleted,
          })
        } else {
          set((state) => ({
            sessionData: [
              ...state.sessionData,
              { ...session, date: today },
            ],
          }))
        }
      },
      
      updateSessionData: (date, updates) =>
        set((state) => ({
          sessionData: state.sessionData.map((session) =>
            session.date === date ? { ...session, ...updates } : session
          ),
        })),
      
      updateSkill: (name, value) =>
        set((state) => ({
          skills: state.skills.map((skill) =>
            skill.name === name ? { ...skill, value } : skill
          ),
        })),
      
      updateStreak: (increment) => {
        const today = new Date().toISOString().split('T')[0]
        const { streak } = get()
        
        if (increment) {
          if (streak.lastActiveDate === today) {
            // Already active today, no change
            return
          }
          
          const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0]
          
          if (streak.lastActiveDate === yesterday) {
            // Continue streak
            set((state) => ({
              streak: {
                current: state.streak.current + 1,
                longest: Math.max(state.streak.longest, state.streak.current + 1),
                lastActiveDate: today,
              },
            }))
          } else {
            // Start new streak
            set((state) => ({
              streak: {
                current: 1,
                longest: state.streak.longest,
                lastActiveDate: today,
              },
            }))
          }
        } else {
          // Reset streak
          set((state) => ({
            streak: {
              current: 0,
              longest: state.streak.longest,
              lastActiveDate: null,
            },
          }))
        }
      },
    }),
    {
      name: 'user-storage',
    }
  )
)