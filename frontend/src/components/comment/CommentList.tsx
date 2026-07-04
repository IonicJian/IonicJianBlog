import { useEffect, useState } from 'react'
import { listComments } from '@/api/comments'
import type { Comment } from '@/types/comment'
import { CommentItem } from './CommentItem'

interface CommentListProps {
  blogId: number
  refreshKey: number
  onReply: (comment: Comment) => void
  onChanged: () => void
}

export function CommentList({
  blogId,
  refreshKey,
  onReply,
  onChanged,
}: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    listComments(blogId)
      .then((data) => {
        if (cancelled) return
        setComments(data.items || [])
        setTotal(data.total)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [blogId, refreshKey])

  if (loading) {
    return <p className="text-sm text-muted-foreground">加载评论中...</p>
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted-foreground tabular-nums">
        {total} 条评论
      </p>
      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          还没有评论,来说点什么吧
        </p>
      ) : (
        comments.map((c) => (
          <CommentItem
            key={c.id}
            comment={c}
            onReply={onReply}
            onChanged={onChanged}
          />
        ))
      )}
    </div>
  )
}
