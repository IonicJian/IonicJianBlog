import { useEffect, useState } from 'react'
import { createGuestbook, listGuestbook } from '@/api/social'
import { extractMessage } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useAuthStore } from '@/store/authStore'
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

export function GuestbookSection() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [messages, setMessages] = useState<GuestbookMessage[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [content, setContent] = useState('')
  const [anonymous, setAnonymous] = useState(false)
  const [posting, setPosting] = useState(false)

  const load = (p: number) =>
    listGuestbook(p).then((d) => {
      setMessages(d.items || [])
      setTotalPages(d.total_pages)
    })

  useEffect(() => {
    load(page)
  }, [page])

  const submit = async () => {
    if (!content.trim()) return
    setPosting(true)
    try {
      await createGuestbook({
        content: content.trim(),
        nickname: anonymous ? '匿名访客' : undefined,
      })
      setContent('')
      toast.success('留言已发布')
      if (page === 1) load(1)
      else setPage(1)
    } catch (err) {
      toast.error(extractMessage(err))
    } finally {
      setPosting(false)
    }
  }

  return (
    <section className="bp-line mt-16 pt-16">
      <h2 className="px-4 text-4xl font-medium tracking-tighter text-gray-950 sm:px-6 dark:text-white">
        留言
      </h2>
      <div className="mx-auto mt-10 max-w-[66%] px-4 sm:px-6">
        <div className="flex flex-col gap-3">
          {isAuthenticated ? (
            <>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="写下你的留言..."
                rows={3}
              />
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <input
                    type="checkbox"
                    checked={anonymous}
                    onChange={(e) => setAnonymous(e.target.checked)}
                    className="accent-sky-500"
                  />
                  匿名
                </label>
                <Button
                  size="sm"
                  onClick={submit}
                  disabled={posting || !content.trim()}
                >
                  {posting ? '发送中...' : '发送'}
                </Button>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              请先登录后留言
            </p>
          )}
        </div>
        <div className="mt-8 flex flex-col gap-4">
          {messages.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">暂无留言</p>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className="rounded-2xl bg-white p-4 outline outline-1 outline-gray-950/5 dark:bg-gray-950 dark:outline-white/10"
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
              </div>
            ))
          )}
        </div>
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-3">
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
    </section>
  )
}
