import { Task, TaskPriority, TaskStatus } from '@/stores/task-store'

export const SAMPLE_TASKS: Partial<Task>[] = [
    {
        title: 'Complete Project Proposal',
        description: 'Draft the initial proposal for the new client project, including timeline and budget estimates.',
        priority: 'high',
        estimatePomodoros: 4,
        actualPomodoros: 1,
        timeSpentMs: 1500000, // 25 mins
        status: 'in_progress',
        tags: ['work', 'planning'],
    },
    {
        title: 'Review Pull Requests',
        description: 'Review pending PRs for the frontend repository. Focus on the new authentication flow.',
        priority: 'medium',
        estimatePomodoros: 2,
        actualPomodoros: 0,
        timeSpentMs: 0,
        status: 'pending',
        tags: ['dev', 'code-review'],
    },
    {
        title: 'Update Documentation',
        description: 'Update the API documentation to reflect the latest changes in the user endpoints.',
        priority: 'low',
        estimatePomodoros: 1,
        actualPomodoros: 0,
        timeSpentMs: 0,
        status: 'pending',
        tags: ['docs'],
    },
    {
        title: 'Prepare Presentation',
        description: 'Create slides for the weekly team sync. Highlight key achievements and upcoming goals.',
        priority: 'high',
        estimatePomodoros: 3,
        actualPomodoros: 3,
        timeSpentMs: 4500000, // 75 mins
        status: 'done',
        tags: ['meeting', 'presentation'],
    },
    {
        title: 'Research New Tools',
        description: 'Investigate potential new libraries for state management in the React app.',
        priority: 'medium',
        estimatePomodoros: 2,
        actualPomodoros: 0,
        timeSpentMs: 0,
        status: 'pending',
        tags: ['research', 'dev'],
    },
]
