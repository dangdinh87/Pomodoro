"use client"

import { Task } from '@/stores/task-store'
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useI18n } from '@/contexts/i18n-context'
import { Skeleton } from '@/components/ui/skeleton'
import { TaskTableRow } from './task-table-row'

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
                        {tasks.map((task, index) => (
                            <TaskTableRow
                                key={task.id}
                                task={task}
                                index={index}
                                page={page}
                                isActive={activeTaskId === task.id}
                                isToggling={togglingTaskIds?.has(task.id) ?? false}
                                onToggleStatus={onToggleStatus}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onClone={onClone}
                                onSaveAsTemplate={onSaveAsTemplate}
                            />
                        ))}
                    </TableBody>
                </Table>
                {tasks.length === 0 && (
                    <div className="text-center py-20 text-muted-foreground bg-muted/5 border-t border-border">
                        {t('tasks.noTasks')}
                    </div>
                )}
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
