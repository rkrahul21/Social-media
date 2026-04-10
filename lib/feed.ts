import { createAdminClient } from '@/lib/supabase/admin'
import type { FeedPost } from '@/types/social'

type PostRow = {
  id: string
  author_id: string
  content: string
  image_url: string | null
  created_at: string
}

type ProfileRow = {
  id: string
  username: string
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
}

type GetFeedPostsOptions = {
  authorId?: string
}

export async function getFeedPosts(options: GetFeedPostsOptions = {}) {
  const supabase = createAdminClient()
  const { authorId } = options

  let query = supabase
    .from('posts')
    .select('id, author_id, content, image_url, created_at')
    .order('created_at', { ascending: false })

  if (authorId) {
    query = query.eq('author_id', authorId)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(error.message)
  }

  const postRows = (data ?? []) as PostRow[]
  const authorIds = [...new Set(postRows.map((row) => row.author_id))]

  const { data: profileData, error: profileError } = authorIds.length
    ? await supabase
        .from('profiles')
        .select('id, username, first_name, last_name, avatar_url')
        .in('id', authorIds)
    : { data: [], error: null }

  if (profileError) {
    throw new Error(profileError.message)
  }

  const profileMap = new Map(
    ((profileData ?? []) as ProfileRow[]).map((profile) => [profile.id, profile])
  )

  const posts: FeedPost[] = postRows.map((row) => ({
    id: row.id,
    author_id: row.author_id,
    content: row.content,
    image_url: row.image_url,
    created_at: row.created_at,
    author: profileMap.has(row.author_id)
      ? {
          username: profileMap.get(row.author_id)?.username ?? '',
          first_name: profileMap.get(row.author_id)?.first_name ?? null,
          last_name: profileMap.get(row.author_id)?.last_name ?? null,
          avatar_url: profileMap.get(row.author_id)?.avatar_url ?? null,
        }
      : null,
  }))

  return posts
}
