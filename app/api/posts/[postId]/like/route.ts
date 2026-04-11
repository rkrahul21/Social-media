import { NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'

type RouteContext = {
  params: Promise<{
    postId: string
  }>
}

export async function GET(_request: Request, context: RouteContext) {
  const { postId } = await context.params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [{ count, error: countError }, likeResult] = await Promise.all([
    supabase.from('likes').select('id', { count: 'exact', head: true }).eq('post_id', postId),
    user
      ? supabase
          .from('likes')
          .select('id')
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ])

  if (countError || likeResult.error) {
    return NextResponse.json(
      { error: countError?.message ?? likeResult.error?.message ?? 'Failed to load likes.' },
      { status: 400 }
    )
  }

  return NextResponse.json({
    count: count ?? 0,
    liked: Boolean(likeResult.data),
  })
}

export async function POST(_request: Request, context: RouteContext) {
  const { postId } = await context.params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { error } = await supabase
    .from('likes')
    .upsert({ post_id: postId, user_id: user.id }, { onConflict: 'user_id,post_id' })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { postId } = await context.params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { error } = await supabase
    .from('likes')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
