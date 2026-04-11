import type { CommentView } from '@/types/social'

type CommentItemProps = {
  comment: CommentView
}

export default function CommentItem({ comment }: CommentItemProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="mb-2 flex items-center gap-2">
        <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
          {(comment.authorName[0] ?? 'U').toUpperCase()}
        </div>
        <p className="text-sm font-medium text-slate-800">{comment.authorName}</p>
        <p className="text-xs text-slate-500">{new Date(comment.createdAt).toLocaleString()}</p>
      </div>
      <p className="text-sm text-slate-700">{comment.content}</p>
    </article>
  )
}
