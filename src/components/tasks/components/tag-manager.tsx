"use client"

import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Trash, CircleNotch } from '@phosphor-icons/react/dist/ssr';
import { useI18n } from '@/contexts/i18n-context'

const MAX_TAGS = 10

interface TagManagerProps {
    tags: string[]
    isLoading?: boolean
    onAddTag: (tag: string) => Promise<boolean> | void
    onRemoveTag: (tag: string) => Promise<boolean> | void
    trigger?: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function TagManager({ tags, isLoading: isInitialLoading, onAddTag, onRemoveTag, trigger, open, onOpenChange }: TagManagerProps) {
    const { t } = useI18n()
    const [innerOpen, setInnerOpen] = useState(false)
    const isOpen = open ?? innerOpen
    const setIsOpen = onOpenChange ?? setInnerOpen
    const [newTag, setNewTag] = useState('')
    const [isAdding, setIsAdding] = useState(false)
    const [removingTag, setRemovingTag] = useState<string | null>(null)

    const atLimit = tags.length >= MAX_TAGS

    const handleAddTag = async () => {
        const trimmed = newTag.trim().toLowerCase()
        if (trimmed && !tags.includes(trimmed)) {
            setIsAdding(true)
            try {
                await onAddTag(trimmed)
                setNewTag('')
            } finally {
                setIsAdding(false)
            }
        }
    }

    const handleRemoveTag = async (tag: string) => {
        setRemovingTag(tag)
        try {
            await onRemoveTag(tag)
        } finally {
            setRemovingTag(null)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="sm:max-w-[420px]">
                <DialogHeader>
                    <DialogTitle>{t('tasks.manageTags')}</DialogTitle>
                    <DialogDescription>{t('tasks.manageTagsDescription')}</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <form
                        className="flex gap-2"
                        onSubmit={(e) => {
                            e.preventDefault()
                            handleAddTag()
                        }}
                    >
                        <Input
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            placeholder={t('tasks.newTagPlaceholder')}
                            aria-label={t('tasks.newTagPlaceholder')}
                            maxLength={30}
                            className="flex-1"
                            disabled={atLimit || isAdding}
                        />
                        <Button type="submit" variant="secondary" disabled={!newTag.trim() || atLimit || isAdding} className="shrink-0 gap-1.5">
                            {isAdding ? <CircleNotch size={16} className="animate-spin" /> : <Plus size={14} />}
                            {t('common.add')}
                        </Button>
                    </form>

                    {isInitialLoading ? (
                        <div className="flex items-center justify-center py-6">
                            <CircleNotch size={20} className="animate-spin text-ink-muted" />
                        </div>
                    ) : tags.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-border-strong px-4 py-8 text-center">
                            <p className="text-sm font-medium text-ink">{t('tasks.noTags')}</p>
                            <p className="mt-1 text-[0.8125rem] text-ink-muted">{t('tasksUi.noTagsHint')}</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
                            {tags.map((tag) => (
                                <li key={tag} className="flex items-center justify-between gap-3 py-1.5 pl-3 pr-1.5">
                                    <span className="min-w-0 truncate text-sm text-ink">{tag}</span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 shrink-0 text-ink-muted hover:text-danger-ink"
                                        onClick={() => handleRemoveTag(tag)}
                                        disabled={removingTag === tag}
                                        aria-label={`${t('common.delete')} ${tag}`}
                                    >
                                        {removingTag === tag ? <CircleNotch size={14} className="animate-spin" /> : <Trash size={15} />}
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    )}

                    <p className="text-xs tabular-nums text-ink-muted">{t('tasksUi.tagsUsed', { count: tags.length, max: MAX_TAGS })}</p>
                </div>
            </DialogContent>
        </Dialog>
    )
}
