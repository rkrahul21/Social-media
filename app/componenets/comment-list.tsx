import CommentItem from './comment-item'
import type { CommentView } from '@/types/social'

type CommentListProps = {
  comments: CommentView[]
}

export default function CommentList({ comments }: CommentListProps) {
  if (!comments.length) {
    return <p className="text-sm text-slate-500">No comments yet.</p>
  }

  return (
    <div className="space-y-2">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </div>
  )
}
