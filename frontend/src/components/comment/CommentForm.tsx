import { Eye, PencilSimple, Quotes, X } from '@phosphor-icons/react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { createComment } from '@/api/comments'
import { extractMessage } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'
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
  const [mode, setMode] = useState<'edit' | 'preview'>('edit')

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
      setMode('edit')
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
      <p className="text-sm text-gray-500 dark:text-gray-400">
        请先
        <Link to="/login" className="px-1 text-sky-500 underline">
          登录
        </Link>
        后参与评论
      </p>
    )
  }

  const tabClass = (active: boolean) =>
    cn(
      'flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors',
      active
        ? 'bg-gray-950 text-white dark:bg-white dark:text-gray-950'
        : 'bg-gray-950/5 text-gray-500 hover:text-gray-950 dark:bg-white/10 dark:text-gray-400 dark:hover:text-white',
    )

  return (
    <div className="flex flex-col gap-3">
      {replyTo && (
        <div className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-xs outline outline-1 outline-gray-950/5 dark:bg-gray-950 dark:outline-white/10">
          <span className="text-gray-500 dark:text-gray-400">
            回复 @{replyTo.author?.display_name || replyTo.author?.username}:
          </span>
          <span className="flex-1 truncate">{replyTo.content}</span>
          <button type="button" onClick={onCancelReply} aria-label="取消回复">
            <X size={14} weight="regular" />
          </button>
        </div>
      )}
      {quote && (
        <div className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-xs outline outline-1 outline-gray-950/5 dark:bg-gray-950 dark:outline-white/10">
          <Quotes size={14} weight="regular" className="text-sky-500" />
          <span className="flex-1 truncate text-gray-500 dark:text-gray-400">
            {quote.text}
          </span>
          <button type="button" onClick={onCancelQuote} aria-label="取消引用">
            <X size={14} weight="regular" />
          </button>
        </div>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode('edit')}
          className={tabClass(mode === 'edit')}
        >
          <PencilSimple size={12} weight="regular" />
          编辑
        </button>
        <button
          type="button"
          onClick={() => setMode('preview')}
          className={tabClass(mode === 'preview')}
        >
          <Eye size={12} weight="regular" />
          预览
        </button>
      </div>
      {mode === 'edit' ? (
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            replyTo
              ? `回复 @${replyTo.author?.display_name || ''}`
              : '写下你的评论... 支持 Markdown'
          }
          rows={4}
        />
      ) : (
        <div className="markdown-body min-h-[120px] rounded-2xl bg-white p-4 outline outline-1 outline-gray-950/5 dark:bg-gray-950 dark:outline-white/10">
          {content.trim() ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              urlTransform={(url) =>
                !url || /^(https?:|mailto:|tel:|#|\/|\.)/i.test(url)
                  ? url
                  : ''
              }
            >
              {content}
            </ReactMarkdown>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              没有内容可预览
            </p>
          )}
        </div>
      )}
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
