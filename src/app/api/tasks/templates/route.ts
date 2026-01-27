import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Try to fetch templates - if is_template column doesn't exist, return empty array
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_template', true)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })

    if (error) {
      // Column might not exist yet
      console.error('Error fetching templates:', error.message)
      return NextResponse.json({ templates: [] })
    }

    return NextResponse.json({ templates: data ?? [] })
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json({ templates: [] })
  }
}
