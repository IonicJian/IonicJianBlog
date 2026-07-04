import { PencilSimple, Plus, Trash } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteBlog, listBlogs } from '@/api/blogs'
import { extractMessage } from '@/api/client'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { BlogListItem, BlogStatus } from '@/types/blog'

export function AdminBlogs() {
  const [blogs, setBlogs] = useState<BlogListItem[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [status, setStatus] = useState<BlogStatus>('published')

  const load = () => {
    listBlogs({ page, page_size: 20, status }).then((d) => {
      setBlogs(d.items || [])
      setTotalPages(d.total_pages)
    })
  }
  useEffect(load, [page, status])

  const handleDelete = async (id: number) => {
    if (!window.confirm('删除这篇文章?此操作不可撤销。')) return
    try {
      await deleteBlog(id)
      toast.success('已删除')
      load()
    } catch (e) {
      toast.error(extractMessage(e))
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          {(['published', 'draft'] as BlogStatus[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setStatus(s)
                setPage(1)
              }}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                status === s
                  ? 'bg-gray-950 text-white dark:bg-white dark:text-gray-950'
                  : 'bg-gray-950/5 text-gray-950 hover:bg-gray-950/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15',
              )}
            >
              {s === 'published' ? '已发布' : '草稿'}
            </button>
          ))}
        </div>
        <Button asChild size="sm">
          <Link to="/admin/blogs/create">
            <Plus size={14} weight="regular" />
            新建
          </Link>
        </Button>
      </div>
      <div className="overflow-hidden rounded-2xl bg-white outline outline-1 outline-gray-950/5 dark:bg-gray-950 dark:outline-white/10">
        {blogs.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
            暂无文章
          </p>
        ) : (
          blogs.map((b) => (
            <div
              key={b.id}
              className="flex items-center justify-between border-b border-gray-950/5 px-4 py-3 last:border-0 dark:border-white/10"
            >
              <div className="min-w-0 flex-1">
                <Link
                  to={`/blogs/${b.id}`}
                  className="truncate font-medium text-gray-950 transition-colors hover:text-sky-500 dark:text-white"
                >
                  {b.title}
                </Link>
                <p className="mt-0.5 text-xs text-gray-500 tabular-nums dark:text-gray-400">
                  {b.status === 'published' ? '已发布' : '草稿'} ·{' '}
                  {new Date(b.created_at).toLocaleDateString('zh-CN')} ·{' '}
                  {b.view_count} 阅读
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button asChild variant="ghost" size="sm">
                  <Link to={`/admin/blogs/${b.id}/edit`}>
                    <PencilSimple size={14} weight="regular" />
                    编辑
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600"
                  onClick={() => handleDelete(b.id)}
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
