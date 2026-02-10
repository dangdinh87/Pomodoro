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
import { Copy, Bookmark, Loader2, MoreHorizontal } from 'lucide-react'
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
        <div className="rounded-xl border border-border bg-background shadow-sm overflow-hidden min-h-[400px] flex flex-col">
            <div className="flex-1 overflow-auto">
                <Table>
                    <TableHeader className="bg-muted/30">
                        <TableRow className="hover:bg-transparent border-border">
                            <TableHead className="w-[45px]"></TableHead>
                            <TableHead className="w-[40px] text-[10px] font-bold uppercase tracking-wider text-muted-foreground">#</TableHead>
                            <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t('tasks.fields.title')}</TableHead>
                            <TableHead className="w-[110px] text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t('tasks.fields.priority')}</TableHead>
                            <TableHead className="w-[120px] text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t('tasks.fields.dueDate')}</TableHead>
                            <TableHead className="hidden md:table-cell text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t('tasks.fields.tags')}</TableHead>
                            <TableHead className="w-[90px] text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t('tasks.fields.progress')}</TableHead>
                            <TableHead className="w-[110px] text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t('common.actions')}</TableHead>
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
                                        "group border-border hover:bg-muted/30 transition-colors relative h-8",
                                        isActive && "bg-primary/10 dark:bg-primary/20 border-l-4 border-l-primary shadow-sm"
                                    )}
                                >
                                    <TableCell className="py-1 w-[45px]">
                                        <div className="relative flex items-center justify-center h-4 w-4 mx-auto">
                                            <Checkbox
                                                checked={isDone}
                                                onCheckedChange={() => onToggleStatus(task)}
                                                className={cn(
                                                    "rounded-full h-4 w-4 border-muted-foreground/30 transition-opacity",
                                                    togglingTaskIds?.has(task.id) && "opacity-50"
                                                )}
                                                disabled={togglingTaskIds?.has(task.id)}
                                                aria-label={isDone ? t('tasks.actions.markIncomplete') : t('tasks.actions.markComplete')}
                                            />
                                            {togglingTaskIds?.has(task.id) && (
                                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                    <Loader2 className={cn(
                                                        "h-2.5 w-2.5 animate-spin",
                                                        isDone ? "text-primary-foreground" : "text-primary"
                                                    )} strokeWidth={3} />
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-1 text-[11px] font-medium text-muted-foreground/50 w-[40px] px-2 text-center">
                                        {(page - 1) * limit + index + 1}
                                    </TableCell>
                                    <TableCell className="py-0.5 pl-4">
                                        <div className="flex flex-col gap-1">
                                            <span className={cn(
                                                "text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug tracking-tight",
                                                isDone && "line-through text-slate-400 dark:text-slate-500 font-normal"
                                            )}>
                                                {task.title}
                                            </span>
                                            {task.isTemplate && (
                                                <div className="flex items-center gap-1 mt-1">
                                                    <Badge variant="outline" className="text-[10px] h-4.5 px-2 rounded-md font-bold border-amber-500/30 text-amber-600 bg-amber-500/10 dark:text-amber-400 dark:border-amber-400/20">
                                                        <Bookmark className="h-2.5 w-2.5 mr-1 fill-current" />
                                                        {t('tasks.templateBadge')}
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-2">
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                "capitalize font-bold border-none px-2 py-0 h-5 rounded-full text-[10px]",
                                                task.priority === 'high' && "bg-red-500/10 text-red-600 dark:text-red-400",
                                                task.priority === 'medium' && "bg-blue-500/10 text-blue-600 dark:text-blue-400",
                                                task.priority === 'low' && "bg-muted text-muted-foreground"
                                            )}
                                        >
                                            {t(`tasks.priorityLevels.${task.priority}`)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="py-2">
                                        {dueDateInfo ? (
                                            <div className={cn(
                                                "text-xs font-medium",
                                                dueDateInfo.overdue && !isDone && "text-destructive",
                                                !dueDateInfo.overdue && "text-muted-foreground"
                                            )}>
                                                {format(dueDateInfo.date, 'MMM d, yyyy')}
                                            </div>
                                        ) : (
                                            <span className="text-sm text-slate-400">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell py-1.5 min-w-[120px]">
                                        <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                                            {task.tags.map((tag) => (
                                                <Badge
                                                    key={tag}
                                                    variant="secondary"
                                                    className="bg-muted/50 text-muted-foreground text-[10px] h-5 px-2 font-medium border-border/50 rounded flex-shrink-0"
                                                >
                                                    {tag}
                                                </Badge>
                                            ))}
                                            {task.tags.length === 0 && <span className="text-muted-foreground/40 text-xs">-</span>}
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-1 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <span className="text-[10px]">🍅</span>
                                            <span className="text-[11px] font-bold text-foreground">
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
                                                <Badge
                                                    className="bg-primary/10 text-primary border-primary/20 text-[9px] h-5 px-2 animate-pulse flex items-center gap-1"
                                                >
                                                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
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
                                                            className="h-7 w-7 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 transition-colors"
                                                            aria-label={t('tasks.actions.edit')}
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
                                                        className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted"
                                                        aria-label={t('common.actions')}
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-40 text-xs shadow-xl ring-1 ring-black/5">
                                                    <DropdownMenuItem onClick={() => onClone?.(task.id)} className="cursor-pointer">
                                                        <Copy className="mr-2 h-3.5 w-3.5" />
                                                        {t('tasks.actions.clone')}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => onSaveAsTemplate?.(task.id)} className="cursor-pointer">
                                                        <Bookmark className="mr-2 h-3.5 w-3.5" />
                                                        {t('tasks.actions.saveAsTemplate')}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive cursor-pointer"
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
                        {tasks.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-20 text-muted-foreground bg-muted/5">
                                    {t('tasks.noTasks')}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-between px-4 py-1.5 bg-background border-t border-border mt-auto h-10">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                        {t('common.total') || 'Total'}: {total} {t('tasks.count')}
                    </span>
                    {isLoading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground/50" />}
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-3 text-[10px] text-muted-foreground border-border hover:bg-muted font-bold transition-all disabled:opacity-30"
                        onClick={() => onPageChange(page - 1)}
                        disabled={page === 1 || isLoading}
                    >
                        {t('common.previous')}
                    </Button>
                    <span className="text-[10px] font-bold tabular-nums text-muted-foreground/60 mx-1">
                        {page} / {totalPages || 1}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-3 text-[10px] text-muted-foreground border-border hover:bg-muted font-bold transition-all disabled:opacity-30"
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
