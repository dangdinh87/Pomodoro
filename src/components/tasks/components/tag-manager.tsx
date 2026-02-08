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
import { Badge } from '@/components/ui/badge'
import { Tag, Plus, X, Loader2 } from 'lucide-react'
import { useI18n } from '@/contexts/i18n-context'

interface TagManagerProps {
    tags: string[]
    isLoading?: boolean
    onAddTag: (tag: string) => Promise<boolean> | void
    onRemoveTag: (tag: string) => Promise<boolean> | void
    trigger?: React.ReactNode
}

export function TagManager({ tags, isLoading: isInitialLoading, onAddTag, onRemoveTag, trigger }: TagManagerProps) {
    const { t } = useI18n()
    const [isOpen, setIsOpen] = useState(false)
    const [newTag, setNewTag] = useState('')
    const [isAdding, setIsAdding] = useState(false)
    const [removingTag, setRemovingTag] = useState<string | null>(null)

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
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" className="h-10 px-4 gap-2">
                        <Tag className="h-4 w-4" />
                        {t('tasks.manageTags')}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Tag className="h-5 w-5" />
                        {t('tasks.manageTags')}
                    </DialogTitle>
                    {/* <DialogDescription>
                        {t('tasks.manageTagsDescription')}
                    </DialogDescription> */}
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Add new tag */}
                    <div className="flex gap-2">
                        <Input
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault()
                                    handleAddTag()
                                }
                            }}
                            placeholder={t('tasks.newTagPlaceholder')}
                            className="flex-1"
                            disabled={tags.length >= 10 || isAdding}
                        />
                        <Button
                            onClick={handleAddTag}
                            size="icon"
                            disabled={!newTag.trim() || tags.length >= 10 || isAdding}
                        >
                            {isAdding ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Plus className="h-4 w-4" />
                            )}
                        </Button>
                    </div>

                    {/* Max tags indicator */}
                    <p className="text-xs text-muted-foreground">
                        {tags.length}/10 {t('tasks.tagsLimit')}
                    </p>

                    {/* Tag list */}
                    <div className="space-y-2">
                        {isInitialLoading ? (
                            <div className="flex items-center justify-center py-4">
                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            </div>
                        ) : tags.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                {t('tasks.noTags')}
                            </p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {tags.map((tag) => (
                                    <Badge
                                        key={tag}
                                        variant="secondary"
                                        className="h-8 pl-3 pr-1 gap-2 text-sm"
                                    >
                                        {tag}
                                        <button
                                            onClick={() => handleRemoveTag(tag)}
                                            disabled={removingTag === tag}
                                            className="p-1 hover:bg-destructive/20 rounded-full transition-colors disabled:opacity-50"
                                        >
                                            {removingTag === tag ? (
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                            ) : (
                                                <X className="h-3 w-3" />
                                            )}
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
