'use client'

import { useState } from 'react'

type CommentFormProps = {
  postId: string
  onSubmit: (postId: string, content: string) => Promise<void> | void
  disabled?: boolean
}

export default function CommentForm({ postId, onSubmit, disabled = false }: CommentFormProps) {
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submitComment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextContent = content.trim()

    if (!nextContent) {
      return
    }

    try {
      setSubmitting(true)
      await onSubmit(postId, nextContent)
      setContent('')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={submitComment} className="mt-3 flex items-center gap-2">
      <input
        type="text"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="Write a comment"
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
        disabled={disabled || submitting}
      />
      <button
        type="submit"
        disabled={disabled || submitting || !content.trim()}
        className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {submitting ? 'Sending ...' : 'Comment'}
      </button>
    </form>
  )
}
