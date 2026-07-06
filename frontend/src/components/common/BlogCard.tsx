import { ArrowUpRight, Eye } from '@phosphor-icons/react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import type { BlogListItem } from '@/types/blog'

interface BlogCardProps {
  blog: BlogListItem
  className?: string
}

function formatDate(s: string): string {
  return new Date(s).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

function firstParagraph(s?: string): string {
  if (!s) return ''
  return s.split(/\n+/)[0]?.trim() || ''
}

export function BlogCard({ blog, className }: BlogCardProps) {
  const tag = blog.tags?.[0]
  return (
    <Link
      to={`/blogs/${blog.id}`}
      className={cn(
        'group isolate flex flex-col gap-3 overflow-hidden rounded-2xl bg-white p-5 outline outline-1 outline-gray-950/5 transition-colors hover:bg-gray-950/2.5 dark:bg-gray-950 dark:outline-white/10 dark:hover:bg-white/2.5',
        className,
      )}
    >
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        {blog.is_top && (
          <span className="font-medium text-sky-500 dark:text-sky-400">置顶</span>
        )}
        {tag && <span>{tag.name}</span>}
        <span className="tabular-nums">{formatDate(blog.created_at)}</span>
      </div>
      <h3 className="text-lg font-semibold tracking-tight text-gray-950 text-balance transition-colors group-hover:text-sky-500 dark:text-white dark:group-hover:text-sky-400">
        {blog.title}
      </h3>
      {(firstParagraph(blog.ai_summary) || blog.excerpt) && (
        <p className="line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
          {firstParagraph(blog.ai_summary) || blog.excerpt}
        </p>
      )}
      <div className="mt-auto flex items-center justify-between pt-2">
        <span className="flex items-center gap-1 text-xs text-gray-500 tabular-nums dark:text-gray-400">
          <Eye size={14} weight="regular" />
          {blog.view_count}
        </span>
        <ArrowUpRight
          size={16}
          weight="regular"
          className="text-gray-500 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-sky-500 dark:text-gray-400 dark:group-hover:text-sky-400"
        />
      </div>
    </Link>
  )
}
