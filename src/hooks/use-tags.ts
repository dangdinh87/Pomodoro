"use client"

import { useState, useEffect, useCallback } from 'react'

interface UseTagsResult {
    tags: string[]
    isLoading: boolean
    error: string | null
    addTag: (tag: string) => Promise<boolean>
    removeTag: (tag: string) => Promise<boolean>
    refetch: () => Promise<void>
}

export function useTags(): UseTagsResult {
    const [tags, setTags] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchTags = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)
            const res = await fetch('/api/tags')
            if (!res.ok) {
                throw new Error('Failed to fetch tags')
            }
            const data = await res.json()
            setTags(data.tags || [])
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchTags()
    }, [fetchTags])

    const addTag = useCallback(async (tag: string): Promise<boolean> => {
        try {
            setError(null)
            const res = await fetch('/api/tags', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tag }),
            })
            if (!res.ok) {
                const data = await res.json()
                setError(data.error || 'Failed to add tag')
                return false
            }
            const data = await res.json()
            setTags(data.tags || [])
            return true
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
            return false
        }
    }, [])

    const removeTag = useCallback(async (tag: string): Promise<boolean> => {
        try {
            setError(null)
            const res = await fetch(`/api/tags?tag=${encodeURIComponent(tag)}`, {
                method: 'DELETE',
            })
            if (!res.ok) {
                const data = await res.json()
                setError(data.error || 'Failed to remove tag')
                return false
            }
            const data = await res.json()
            setTags(data.tags || [])
            return true
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
            return false
        }
    }, [])

    return {
        tags,
        isLoading,
        error,
        addTag,
        removeTag,
        refetch: fetchTags,
    }
}
