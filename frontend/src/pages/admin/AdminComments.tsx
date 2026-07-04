import { ArrowRight, Trash } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteComment, listAllComments } from '@/api/comments'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import type { Comment } from '@/types/comment'

function formatTime(s: string): string {
  return new Date(s).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function AdminComments() {
  const [comments, setComments] = useState<Comment[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)

  const load = () =>
    listAllComments(page, 20).then((d) => {
      setComments(d.items || [])
      setTotalPages(d.total_pages)
    })
  useEffect(() => {
    load()
  }, [page])

  const handleDelete = async (id: number) => {
    if (!window.confirm('删除这条评论?')) return
    try {
      await deleteComment(id)
      load()
      toast.success('已删除')
    } catch {
      toast.error('删除失败')
    }
  }

  return (
    <div>
      <div className="overflow-hidden rounded-2xl bg-white outline outline-1 outline-gray-950/5 dark:bg-gray-950 dark:outline-white/10">
        {comments.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
            暂无评论
          </p>
        ) : (
          comments.map((c) => (
            <div
              key={c.id}
              className="border-b border-gray-950/5 px-4 py-3 last:border-0 dark:border-white/10"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-950 dark:text-white">
                  {c.author?.display_name || c.author?.username || '匿名'}
                </span>
                <Link
                  to={`/blogs/${c.blog_id}`}
                  className="flex items-center gap-1 text-xs text-sky-500 hover:underline dark:text-sky-400"
                >
                  查看文章
                  <ArrowRight size={12} weight="regular" />
                </Link>
              </div>
              {c.anchor_text && (
                <p className="mt-1 border-l-2 border-sky-500 pl-2 text-xs text-gray-500 dark:text-gray-400">
                  {c.anchor_text}
                </p>
              )}
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                {c.content}
              </p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-gray-500 tabular-nums dark:text-gray-400">
                  {formatTime(c.created_at)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600"
                  onClick={() => handleDelete(c.id)}
                >
                  <Trash size={14} weight="regular" />
                  删除
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 py-6">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            上一页
          </Button>
          <span className="text-sm text-gray-500 tabular-nums dark:text-gray-400">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            下一页
          </Button>
        </div>
      )}
    </div>
  )
}
