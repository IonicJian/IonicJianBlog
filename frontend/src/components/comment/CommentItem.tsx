import { ChatCircle, Trash } from '@phosphor-icons/react'
import { deleteComment, toggleCommentLike } from '@/api/comments'
import { LikeButton } from '@/components/like/LikeButton'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'
import type { Comment } from '@/types/comment'

interface CommentItemProps {
  comment: Comment
  onReply: (comment: Comment) => void
  onChanged: () => void
}

function formatDate(s: string): string {
  return new Date(s).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function CommentItem({ comment, onReply, onChanged }: CommentItemProps) {
  const user = useAuthStore((s) => s.user)
  const canDelete =
    !!user && (user.role === 'admin' || user.id === comment.user_id)
  const author = comment.author
  const name = author?.display_name || author?.username || '匿名'

  const handleDelete = async () => {
    if (!window.confirm('确定删除这条评论?')) return
    try {
      await deleteComment(comment.id)
      onChanged()
    } catch {
      toast.error('删除失败')
    }
  }

  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-card text-xs font-medium">
        {author?.avatar_url ? (
          <img
            src={author.avatar_url}
            alt={name}
            className="h-full w-full object-cover"
          />
        ) : (
          name[0]
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{name}</span>
          <span className="text-xs text-muted-foreground tabular-nums">
            {formatDate(comment.created_at)}
          </span>
        </div>
        {comment.anchor_text && (
          <blockquote className="mt-1 border-l-2 border-primary pl-2 text-xs text-muted-foreground">
            {comment.anchor_text}
          </blockquote>
        )}
        <p className="mt-1 whitespace-pre-wrap text-sm">{comment.content}</p>
        <div className="mt-2 flex items-center gap-4">
          <LikeButton
            count={comment.like_count}
            liked={comment.liked_by_me}
            onToggle={() => toggleCommentLike(comment.id)}
            size={14}
          />
          <button
            type="button"
            onClick={() => onReply(comment)}
            className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChatCircle size={14} weight="regular" />
            回复
          </button>
          {canDelete && (
            <button
              type="button"
              onClick={handleDelete}
              className={cn(
                'flex items-center gap-1 text-xs text-muted-foreground transition-colors',
                'hover:text-destructive',
              )}
            >
              <Trash size={14} weight="regular" />
              删除
            </button>
          )}
        </div>
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 flex flex-col gap-4 border-l border-border pl-4">
            {comment.replies.map((r) => (
              <CommentItem
                key={r.id}
                comment={r}
                onReply={onReply}
                onChanged={onChanged}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
