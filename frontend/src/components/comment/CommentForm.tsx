import { Quotes, X } from '@phosphor-icons/react'
import { useState } from 'react'
import { createComment } from '@/api/comments'
import { extractMessage } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'
import { Link } from 'react-router-dom'
import type { Comment } from '@/types/comment'

interface QuoteData {
  text: string
  start: string
}

interface CommentFormProps {
  blogId: number
  replyTo: Comment | null
  quote: QuoteData | null
  onSubmitted: () => void
  onCancelReply: () => void
  onCancelQuote: () => void
}

export function CommentForm({
  blogId,
  replyTo,
  quote,
  onSubmitted,
  onCancelReply,
  onCancelQuote,
}: CommentFormProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async () => {
    if (!content.trim()) return
    setSubmitting(true)
    try {
      await createComment(blogId, {
        content: content.trim(),
        parent_id: replyTo?.id,
        anchor_text: quote?.text,
        anchor_start: quote?.start,
      })
      setContent('')
      onSubmitted()
      onCancelReply()
      onCancelQuote()
      toast.success('评论已发布')
    } catch (err) {
      toast.error(extractMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <p className="text-sm text-muted-foreground">
        请先
        <Link to="/login" className="px-1 text-primary underline">
          登录
        </Link>
        后参与评论
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {replyTo && (
        <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs">
          <span className="text-muted-foreground">
            回复 @{replyTo.author?.display_name || replyTo.author?.username}:
          </span>
          <span className="flex-1 truncate">{replyTo.content}</span>
          <button type="button" onClick={onCancelReply} aria-label="取消回复">
            <X size={14} weight="regular" />
          </button>
        </div>
      )}
      {quote && (
        <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs">
          <Quotes size={14} weight="regular" className="text-primary" />
          <span className="flex-1 truncate text-muted-foreground">
            {quote.text}
          </span>
          <button type="button" onClick={onCancelQuote} aria-label="取消引用">
            <X size={14} weight="regular" />
          </button>
        </div>
      )}
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={
          replyTo
            ? `回复 @${replyTo.author?.display_name || ''}`
            : '写下你的评论...'
        }
        rows={3}
      />
      <div className="flex justify-end">
        <Button
          type="button"
          onClick={submit}
          disabled={submitting || !content.trim()}
          size="sm"
        >
          {submitting ? '发送中...' : '发送'}
        </Button>
      </div>
    </div>
  )
}
