'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type PostComposerProps = {
  authorId: string
}

const POSTS_BUCKET = 'posts'

export default function PostComposer({ authorId }: PostComposerProps) {
  const [supabase] = useState(() => createClient())
  const router = useRouter()
  const [content, setContent] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function uploadImageIfNeeded() {
    if (!file) {
      return null
    }

    const fileExt = file.name.split('.').pop()
    const filePath = `${authorId}/post-${Date.now()}.${fileExt}`

    const { error } = await supabase.storage.from(POSTS_BUCKET).upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

    if (error) {
      throw new Error(`Image upload failed: ${error.message}`)
    }

    const { data } = supabase.storage.from(POSTS_BUCKET).getPublicUrl(filePath)
    return data.publicUrl
  }

  async function createPost(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!content.trim()) {
      alert('Post content cannot be empty.')
      return
    }

    if (content.trim().length > 280) {
      alert('Post content cannot exceed 280 characters.')
      return
    }

    try {
      setSubmitting(true)

      const { data: profileRow, error: profileCheckError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', authorId)
        .maybeSingle()

      if (profileCheckError) {
        throw new Error(profileCheckError.message)
      }

      if (!profileRow) {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
          throw new Error('Unable to verify your account. Please sign in again.')
        }

        const fallbackUsername =
          typeof user.user_metadata?.username === 'string' &&
          user.user_metadata.username.trim().length >= 3
            ? user.user_metadata.username.trim()
            : (user.email?.split('@')[0] ?? `user-${authorId.slice(0, 8)}`).slice(0, 15)

        const { error: ensureProfileError } = await supabase.from('profiles').upsert({
          id: authorId,
          username: fallbackUsername,
          first_name:
            typeof user.user_metadata?.first_name === 'string'
              ? user.user_metadata.first_name
              : null,
          last_name:
            typeof user.user_metadata?.last_name === 'string'
              ? user.user_metadata.last_name
              : null,
        })

        if (ensureProfileError) {
          throw new Error(
            'We could not prepare your profile for posting. Please try signing in again.'
          )
        }
      }

      const imageUrl = await uploadImageIfNeeded()

      const { error } = await supabase.from('posts').insert({
        author_id: authorId,
        content: content.trim(),
        image_url: imageUrl,
      })

      if (error) {
        throw new Error(error.message)
      }

      setContent('')
      setFile(null)
      router.push('/')
      router.refresh()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create post.'
      alert(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={createPost} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <label htmlFor="post-content" className="mb-2 block text-sm font-semibold text-slate-800">
        Create a post
      </label>
      <textarea
        id="post-content"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        maxLength={280}
        rows={4}
        placeholder="What's on your mind?"
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
      />
      <p className="mt-1 text-xs text-slate-500">{content.length}/280</p>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="file"
          accept="image/*"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          className="text-sm text-slate-600"
          disabled={submitting}
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {submitting ? 'Posting ...' : 'Post'}
        </button>
      </div>
    </form>
  )
}
