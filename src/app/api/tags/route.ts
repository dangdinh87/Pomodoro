import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

const MAX_TAGS = 10
const MAX_TAG_LENGTH = 50

// GET: Lấy danh sách tags của user
export async function GET() {
    const supabase = await createClient()
    if (!supabase) {
        return NextResponse.json({ error: 'Supabase client is not configured' }, { status: 500 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
        .from('user_tags')
        .select('tags')
        .eq('user_id', user.id)
        .single()

    if (error && error.code !== 'PGRST116') {
        console.error('Error fetching tags', error)
        return NextResponse.json({ error: 'Failed to load tags' }, { status: 500 })
    }

    return NextResponse.json({ tags: data?.tags ?? [] })
}

// POST: Thêm tag mới
export async function POST(request: NextRequest) {
    const supabase = await createClient()
    if (!supabase) {
        return NextResponse.json({ error: 'Supabase client is not configured' }, { status: 500 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: unknown
    try {
        body = await request.json()
    } catch {
        return NextResponse.json({ error: 'Request body must be valid JSON' }, { status: 400 })
    }

    const rawTag = (body as { tag?: unknown } | null)?.tag
    const newTag = typeof rawTag === 'string' ? rawTag.trim().toLowerCase() : ''

    if (!newTag) {
        return NextResponse.json({ error: 'Tag is required' }, { status: 400 })
    }

    if (newTag.length > MAX_TAG_LENGTH) {
        return NextResponse.json({ error: `Tag must be at most ${MAX_TAG_LENGTH} characters` }, { status: 400 })
    }

    // Lấy tags hiện tại
    const { data: existing } = await supabase
        .from('user_tags')
        .select('tags')
        .eq('user_id', user.id)
        .single()

    const currentTags: string[] = existing?.tags ?? []

    // Kiểm tra đã tồn tại
    if (currentTags.includes(newTag)) {
        return NextResponse.json({ error: 'Tag already exists' }, { status: 400 })
    }

    // Kiểm tra max tags
    if (currentTags.length >= MAX_TAGS) {
        return NextResponse.json({ error: `Maximum ${MAX_TAGS} tags allowed` }, { status: 400 })
    }

    const updatedTags = [...currentTags, newTag]

    // Upsert
    const { error } = await supabase
        .from('user_tags')
        .upsert({
            user_id: user.id,
            tags: updatedTags,
            updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })

    if (error) {
        console.error('Error saving tags', error)
        return NextResponse.json({ error: 'Failed to save tags' }, { status: 500 })
    }

    return NextResponse.json({ tags: updatedTags })
}

// DELETE: Xóa tag
export async function DELETE(request: NextRequest) {
    const supabase = await createClient()
    if (!supabase) {
        return NextResponse.json({ error: 'Supabase client is not configured' }, { status: 500 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const tagToDelete = searchParams.get('tag')?.toLowerCase()

    if (!tagToDelete) {
        return NextResponse.json({ error: 'Tag is required' }, { status: 400 })
    }

    // Lấy tags hiện tại
    const { data: existing } = await supabase
        .from('user_tags')
        .select('tags')
        .eq('user_id', user.id)
        .single()

    const currentTags: string[] = existing?.tags ?? []
    const updatedTags = currentTags.filter(t => t !== tagToDelete)

    const { error } = await supabase
        .from('user_tags')
        .upsert({
            user_id: user.id,
            tags: updatedTags,
            updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })

    if (error) {
        console.error('Error saving tags', error)
        return NextResponse.json({ error: 'Failed to save tags' }, { status: 500 })
    }

    return NextResponse.json({ tags: updatedTags })
}
