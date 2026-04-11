import { NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'
import type { CommentView } from '@/types/social'

type RouteContext = {
  params: Promise<{
    postId: string
  }>
}

type CommentRow = {
  id: string
  user_id: string
  content: string
  created_at: string
}

type ProfileRow = {
  id: string
  username: string
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
}

function buildAuthorName(profile: ProfileRow | undefined) {
  if (!profile) {
    return 'Unknown user'
  }

  const fullName = `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim()
  return fullName || profile.username
}

async function getComments(postId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('comments')
    .select('id, user_id, content, created_at')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  const commentRows = (data ?? []) as CommentRow[]
  const userIds = [...new Set(commentRows.map((comment) => comment.user_id))]

  const { data: profileData, error: profileError } = userIds.length
    ? await supabase
        .from('profiles')
        .select('id, username, first_name, last_name, avatar_url')
        .in('id', userIds)
    : { data: [], error: null }

  if (profileError) {
    throw new Error(profileError.message)
  }

  const profileMap = new Map(
    ((profileData ?? []) as ProfileRow[]).map((profile) => [profile.id, profile])
  )

  return commentRows.map((comment) => {
    const profile = profileMap.get(comment.user_id)

    return {
      id: comment.id,
      authorName: buildAuthorName(profile),
      authorAvatarUrl: profile?.avatar_url ?? null,
      content: comment.content,
      createdAt: comment.created_at,
    } satisfies CommentView
  })
}

export async function GET(_request: Request, context: RouteContext) {
  const { postId } = await context.params

  try {
    const comments = await getComments(postId)
    return NextResponse.json({ comments, count: comments.length })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load comments.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function POST(request: Request, context: RouteContext) {
  const { postId } = await context.params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await request.json().catch(() => null)) as { content?: string } | null
  const content = body?.content?.trim() ?? ''

  if (!content) {
    return NextResponse.json({ error: 'Comment content is required.' }, { status: 400 })
  }

  const { error } = await supabase.from('comments').insert({
    post_id: postId,
    user_id: user.id,
    content,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  try {
    const comments = await getComments(postId)
    return NextResponse.json({ success: true, comments, count: comments.length })
  } catch (fetchError) {
    const message =
      fetchError instanceof Error ? fetchError.message : 'Comment saved but refresh failed.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
