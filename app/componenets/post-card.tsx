

'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Heart, MessageCircle, MoreHorizontal, Share2 } from 'lucide-react'

import { createClient } from '@/lib/supabase/client'
import type { CommentView, FeedPost } from '@/types/social'

import CommentForm from './comment-form'
import CommentList from './comment-list'

type LikeApiResponse = {
  count?: number
  liked?: boolean
  error?: string
}

type CommentsApiResponse = {
  comments?: CommentView[]
  count?: number
  error?: string
}

type PostCardProps = {
  post: FeedPost
  className?: string
}

export default function PostCard({ post, className = '' }: PostCardProps) {
  const [supabase] = useState(() => createClient())
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(post.likes?.[0]?.count || 0)
  const [comments, setComments] = useState<CommentView[]>(post.comments ?? [])
  const [commentsCount, setCommentsCount] = useState(post.comments?.length ?? 0)
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [loadingEngagement, setLoadingEngagement] = useState(true)

  const formattedDate = new Date(post.created_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

  const authorName = post.author
    ? `${post.author.first_name ?? ''} ${post.author.last_name ?? ''}`.trim() ||
      post.author.username
    : 'Unknown user'

  useEffect(() => {
    let active = true

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (active) {
        setCurrentUserId(user?.id ?? null)
      }
    }

    void loadUser()

    return () => {
      active = false
    }
  }, [supabase])

  useEffect(() => {
    let active = true

    async function loadLikes() {
      const response = await fetch(`/api/posts/${post.id}/like`, {
        cache: 'no-store',
      })
      const result = (await response.json().catch(() => ({}))) as LikeApiResponse

      if (!response.ok) {
        throw new Error(result.error ?? 'Failed to load likes.')
      }

      if (active) {
        setLiked(Boolean(result.liked))
        setLikesCount(result.count ?? 0)
      }
    }

    async function loadComments() {
      const response = await fetch(`/api/posts/${post.id}/comments`, {
        cache: 'no-store',
      })
      const result = (await response.json().catch(() => ({}))) as CommentsApiResponse

      if (!response.ok) {
        throw new Error(result.error ?? 'Failed to load comments.')
      }

      if (active) {
        setComments(result.comments ?? [])
        setCommentsCount(result.count ?? result.comments?.length ?? 0)
      }
    }

    async function loadEngagement() {
      try {
        setLoadingEngagement(true)
        await Promise.all([loadLikes(), loadComments()])
      } catch (error) {
        console.error(error)
      } finally {
        if (active) {
          setLoadingEngagement(false)
        }
      }
    }

    void loadEngagement()

    const channel = supabase
      .channel(`post-engagement-${post.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'likes', filter: `post_id=eq.${post.id}` },
        () => {
          void loadLikes()
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'comments', filter: `post_id=eq.${post.id}` },
        () => {
          void loadComments()
        }
      )
      .subscribe()

    return () => {
      active = false
      void supabase.removeChannel(channel)
    }
  }, [post.id, supabase])

  async function handleLike() {
    if (!currentUserId) {
      alert('Please log in to like posts.')
      return
    }

    const nextLiked = !liked
    setLiked(nextLiked)
    setLikesCount((prev) => (nextLiked ? prev + 1 : Math.max(prev - 1, 0)))

    const response = await fetch(`/api/posts/${post.id}/like`, {
      method: nextLiked ? 'POST' : 'DELETE',
    })

    if (!response.ok) {
      setLiked(!nextLiked)
      setLikesCount((prev) => (!nextLiked ? prev + 1 : Math.max(prev - 1, 0)))
      const result = (await response.json().catch(() => ({}))) as LikeApiResponse
      alert(result.error ?? 'Failed to update like.')
    }
  }

  async function handleCommentSubmit(postId: string, content: string) {
    if (!currentUserId) {
      throw new Error('Please log in to comment on posts.')
    }

    const response = await fetch(`/api/posts/${postId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    })

    const result = (await response.json().catch(() => ({}))) as CommentsApiResponse

    if (!response.ok) {
      throw new Error(result.error ?? 'Failed to save comment.')
    }

    setComments(result.comments ?? [])
    setCommentsCount(result.count ?? result.comments?.length ?? 0)
    setCommentsOpen(true)
  }

  return (
    <article
      className={`flex flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md ${className}`}
    >
      <header className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-slate-100">
            {post.author?.avatar_url ? (
              <Image
                src={post.author.avatar_url}
                alt={authorName}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-amber-400 to-fuchsia-600 text-[10px] font-bold text-white">
                {authorName.substring(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-bold leading-tight text-slate-900">{authorName}</p>
            <p className="text-[11px] text-slate-500">{formattedDate}</p>
          </div>
        </div>
        <button className="rounded-full p-1 hover:bg-slate-50">
          <MoreHorizontal size={20} className="text-slate-400" />
        </button>
      </header>

      <div className="px-4 pb-3">
        <p className="line-clamp-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-800 transition-all duration-300 hover:line-clamp-none">
          {post.content}
        </p>
      </div>

      {post.image_url ? (
        <div className="relative aspect-square w-full overflow-hidden border-y border-slate-100 bg-slate-50">
          <Image
            src={post.image_url}
            alt="Post content"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain transition-transform duration-500 hover:scale-105"
          />
        </div>
      ) : null}

      <div className="mt-auto p-4">
        <div className="mb-3 flex items-center gap-4">
          <button
            onClick={handleLike}
            className={`transition-all active:scale-150 ${liked ? 'text-rose-600' : 'text-slate-700 hover:text-black'}`}
          >
            <Heart size={24} fill={liked ? 'currentColor' : 'none'} />
          </button>

          <button
            onClick={() => setCommentsOpen((open) => !open)}
            className="text-slate-700 transition-colors hover:text-black"
          >
            <MessageCircle size={24} />
          </button>

          <button className="ml-auto text-slate-700 transition-colors hover:text-black">
            <Share2 size={24} />
          </button>
        </div>

        <p className="mb-1 text-sm font-bold text-slate-900">{likesCount.toLocaleString()} likes</p>

        <button
          onClick={() => setCommentsOpen((open) => !open)}
          className="text-xs font-medium text-slate-500 transition hover:text-slate-800"
        >
          View all {commentsCount} comments
        </button>

        <CommentForm
          postId={post.id}
          onSubmit={handleCommentSubmit}
          disabled={loadingEngagement}
        />

        {commentsOpen ? (
          <div className="mt-3 border-t border-slate-200 pt-3 custom-scrollbar">
            <CommentList comments={comments} />
          </div>
        ) : null}
      </div>
    </article>
  )
}
