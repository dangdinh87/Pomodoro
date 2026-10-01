"use client"

import { Task, TaskPriority } from '@/stores/task-store'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { AnimatedEdit, AnimatedTrash, AnimatedTarget } from '@/components/ui/animated-icons'
import { Copy, BookmarkSimple, CircleNotch, DotsThree } from '@phosphor-icons/react/dist/ssr';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useI18n } from '@/contexts/i18n-context'
import { format, isPast, isToday, isTomorrow } from 'date-fns'
import { cn } from '@/lib/utils'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { Skeleton } from '@/components/ui/skeleton'
import { useMemo } from 'react'
import { EmptyState } from '@/components/ui/empty-state'

interface TaskTableProps {
    tasks: Task[]
    isLoading: boolean
    activeTaskId: string | null
    total: number
    page: number
    onPageChange: (page: number) => void
    onToggleStatus: (task: Task) => void
    onEdit: (task: Task) => void
    onDelete: (id: string) => void
    onClone?: (id: string) => void
    onSaveAsTemplate?: (id: string) => void
    onCreate?: () => void
    togglingTaskIds?: Set<string>
}

function getDueDateInfo(dueDate: string | null | undefined) {
    if (!dueDate) return null
    const date = new Date(dueDate)
    const overdue = isPast(date) && !isToday(date)
    const today = isToday(date)
    const tomorrow = isTomorrow(date)
    return { date, overdue, today, tomorrow }
}

const priorityVariants: Record<TaskPriority, 'destructive' | 'warning' | 'secondary'> = {
    high: 'destructive',
    medium: 'warning',
    low: 'secondary',
}

export function TaskTable({
    tasks,
    isLoading,
    activeTaskId,
    total,
    page,
    onPageChange,
    onToggleStatus,
    onEdit,
    onDelete,
    onClone,
    onSaveAsTemplate,
    onCreate,
    togglingTaskIds,
}: TaskTableProps) {
    const { t } = useI18n()

    if (isLoading && tasks.length === 0) {
        return (
            <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-md" />
                ))}
            </div>
        )
    }

    const limit = 10
    const totalPages = Math.ceil(total / limit)

    return (
        <div className="rounded-lg border border-border bg-surface overflow-hidden min-h-[400px] flex flex-col">
            <div className="flex-1 overflow-auto">
                <Table>
                    <TableHeader className="bg-surface-raised">
                        <TableRow className="hover:bg-transparent border-border">
                            <TableHead className="w-[45px]"></TableHead>
                            <TableHead className="w-[40px] text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-ink-muted">#</TableHead>
                            <TableHead className="text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-ink-muted">{t('tasks.fields.title')}</TableHead>
                            <TableHead className="w-[110px] text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-ink-muted">{t('tasks.fields.priority')}</TableHead>
                            <TableHead className="w-[120px] text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-ink-muted">{t('tasks.fields.dueDate')}</TableHead>
                            <TableHead className="hidden md:table-cell text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-ink-muted">{t('tasks.fields.tags')}</TableHead>
                            <TableHead className="w-[90px] text-right text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-ink-muted">{t('tasks.fields.progress')}</TableHead>
                            <TableHead className="w-[110px] text-right text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-ink-muted">{t('common.actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tasks.map((task, index) => {
                            const isDone = task.status === 'done'
                            const dueDateInfo = getDueDateInfo(task.dueDate)
                            const isActive = activeTaskId === task.id

                            return (
                                <TableRow
                                    key={task.id}
                                    className={cn(
                                        "group border-border hover:bg-surface-hover transition-colors relative h-8",
                                        isActive && "ring-1 ring-inset ring-brand/50"
                                    )}
                                >
                                    <TableCell className="py-1 w-[45px]">
                                        <div className="relative flex items-center justify-center h-4 w-4 mx-auto">
                                            <Checkbox
                                                checked={isDone}
                                                onCheckedChange={() => onToggleStatus(task)}
                                                className={cn(
                                                    "rounded-full h-4 w-4 border-border-strong transition-opacity",
                                                    togglingTaskIds?.has(task.id) && "opacity-50"
                                                )}
                                                disabled={togglingTaskIds?.has(task.id)}
                                                aria-label={`${isDone ? t('tasks.actions.markIncomplete') : t('tasks.actions.markComplete')} - ${task.title}`}
                                            />
                                            {togglingTaskIds?.has(task.id) && (
                                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                    <CircleNotch className={cn(
                                                        "h-2.5 w-2.5 animate-spin",
                                                        isDone ? "text-primary-foreground" : "text-primary"
                                                    )} weight="bold" />
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-1 text-[11px] font-medium text-ink-faint w-[40px] px-2 text-center">
                                        {(page - 1) * limit + index + 1}
                                    </TableCell>
                                    <TableCell className="py-0.5 pl-4">
                                        <div className="flex flex-col gap-1">
                                            <span className={cn(
                                                "text-sm font-semibold text-ink line-clamp-2 leading-snug",
                                                isDone && "line-through text-ink-muted font-normal"
                                            )}>
                                                {task.title}
                                            </span>
                                            {task.isTemplate && (
                                                <div className="flex items-center gap-1 mt-1">
                                                    <Badge variant="secondary">
                                                        <BookmarkSimple size={10} weight="fill" />
                                                        {t('tasks.templateBadge')}
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-2">
                                        <Badge variant={priorityVariants[task.priority]} className="capitalize">
                                            {t(`tasks.priorityLevels.${task.priority}`)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="py-2">
                                        {dueDateInfo ? (
                                            <div className={cn(
                                                "text-xs font-medium",
                                                dueDateInfo.overdue && !isDone ? "text-danger-ink" : "text-ink-muted"
                                            )}>
                                                {format(dueDateInfo.date, 'MMM d, yyyy')}
                                            </div>
                                        ) : (
                                            <span className="text-sm text-ink-faint">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell py-1.5 min-w-[120px]">
                                        <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                                            {task.tags.map((tag) => (
                                                <Badge key={tag} variant="secondary" className="flex-shrink-0">
                                                    {tag}
                                                </Badge>
                                            ))}
                                            {task.tags.length === 0 && <span className="text-ink-faint text-xs">-</span>}
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-1 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <span className="text-xs font-heading font-bold tabular-nums text-ink">
                                                {task.actualPomodoros}/{task.estimatePomodoros}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-2 text-right">
                                        <div className={cn(
                                            "flex items-center justify-end gap-1.5 transition-opacity duration-200",
                                            isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                        )}>
                                            {isActive && (
                                                <Badge variant="brand">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                    {t('tasks.focusing') || 'Focusing'}
                                                </Badge>
                                            )}

                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                onEdit(task)
                                                            }}
                                                            className="h-7 w-7 text-ink-muted hover:text-ink"
                                                            aria-label={`${t('tasks.actions.edit')} - ${task.title}`}
                                                        >
                                                            <AnimatedEdit className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="top" className="text-[10px] py-1 px-2 text-center">
                                                        {t('tasks.actions.edit')}
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-ink-muted hover:text-ink"
                                                        aria-label={`${t('common.actions')} - ${task.title}`}
                                                    >
                                                        <DotsThree size={16} />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-40 text-xs">
                                                    <DropdownMenuItem onClick={() => onClone?.(task.id)} className="cursor-pointer">
                                                        <Copy size={14} className="mr-2" />
                                                        {t('tasks.actions.clone')}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => onSaveAsTemplate?.(task.id)} className="cursor-pointer">
                                                        <BookmarkSimple size={14} className="mr-2" />
                                                        {t('tasks.actions.saveAsTemplate')}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-danger-ink focus:text-danger-ink cursor-pointer"
                                                        onClick={() => onDelete(task.id)}
                                                    >
                                                        <AnimatedTrash className="mr-2 h-3.5 w-3.5" />
                                                        {t('tasks.actions.deletePermanent')}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
                {tasks.length === 0 && (
                    <EmptyState
                        title={t('tasks.noTasks')}
                        description={t('tasks.noTasksDescription') || "You don't have any tasks yet. Create one to get started with your focus session."}
                        action={onCreate && (
                            <Button onClick={onCreate} className="mt-2">
                                {t('tasks.addTask')}
                            </Button>
                        )}
                        className="py-12 border-t border-border"
                    />
                )}
            </div>
            <div className="flex items-center justify-between px-4 py-1.5 bg-surface border-t border-border mt-auto h-10">
                <div className="flex items-center gap-2">
                    <span className="text-[0.6875rem] text-ink-muted font-semibold uppercase tracking-[0.05em]">
                        {t('common.total') || 'Total'}: {total} {t('tasks.count')}
                    </span>
                    {isLoading && <CircleNotch size={12} className="animate-spin text-ink-faint" />}
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-3 text-xs"
                        onClick={() => onPageChange(page - 1)}
                        disabled={page === 1 || isLoading}
                    >
                        {t('common.previous')}
                    </Button>
                    <span className="text-xs font-medium tabular-nums text-ink-muted mx-1">
                        {page} / {totalPages || 1}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-3 text-xs"
                        onClick={() => onPageChange(page + 1)}
                        disabled={page >= totalPages || isLoading}
                    >
                        {t('common.next')}
                    </Button>
                </div>
            </div>
        </div>
    )
}
