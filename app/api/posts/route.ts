import { NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'
import { getFeedPosts } from '@/lib/feed'

export async function GET(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('user_id')
  try {
    const posts = await getFeedPosts({ authorId: userId ?? undefined })
    return NextResponse.json({ posts })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load posts.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
