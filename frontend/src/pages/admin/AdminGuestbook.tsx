import { Trash } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { deleteGuestbook, listGuestbook } from '@/api/social'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import type { GuestbookMessage } from '@/types/social'

function formatTime(s: string): string {
  return new Date(s).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function AdminGuestbook() {
  const [messages, setMessages] = useState<GuestbookMessage[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)

  const load = () =>
    listGuestbook(page, 20).then((d) => {
      setMessages(d.items || [])
      setTotalPages(d.total_pages)
    })
  useEffect(() => {
    load()
  }, [page])

  const handleDelete = async (id: number) => {
    if (!window.confirm('删除这条留言?')) return
    try {
      await deleteGuestbook(id)
      load()
      toast.success('已删除')
    } catch {
      toast.error('删除失败')
    }
  }

  return (
    <div>
      <div className="overflow-hidden rounded-2xl bg-white outline outline-1 outline-gray-950/5 dark:bg-gray-950 dark:outline-white/10">
        {messages.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
            暂无留言
          </p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className="border-b border-gray-950/5 px-4 py-3 last:border-0 dark:border-white/10"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-950 dark:text-white">
                  {m.author?.display_name || m.nickname || '匿名'}
                </span>
                <span className="text-xs text-gray-500 tabular-nums dark:text-gray-400">
                  {formatTime(m.created_at)}
                </span>
              </div>
              <p className="mt-1 whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-300">
                {m.content}
              </p>
              <div className="mt-2 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600"
                  onClick={() => handleDelete(m.id)}
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
