import { Link } from 'react-router-dom'
import type { BlogListItem } from '@/types/blog'

interface BlogRowProps {
  blog: BlogListItem
}

function formatDate(s: string): string {
  return new Date(s).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

export function BlogRow({ blog }: BlogRowProps) {
  return (
    <div className="bp-line">
      <div className="flex flex-col gap-2 px-4 py-8 sm:px-6 lg:grid lg:grid-cols-[14rem_2.5rem_minmax(0,1fr)] lg:gap-0">
        <div className="font-mono text-sm font-medium tracking-widest text-gray-500 tabular-nums uppercase">
          {formatDate(blog.created_at)}
        </div>
        <div className="hidden lg:block" />
        <div className="lg:pl-2">
          {blog.is_top && (
            <span className="mr-2 text-xs font-medium text-sky-500 dark:text-sky-400">
              置顶
            </span>
          )}
          <Link
            to={`/blogs/${blog.id}`}
            className="font-semibold text-gray-950 transition-colors hover:text-sky-500 dark:text-white dark:hover:text-sky-400"
          >
            {blog.title}
          </Link>
          {blog.excerpt && (
            <p className="mt-4 line-clamp-3 leading-7 text-gray-600 dark:text-gray-300">
              {blog.excerpt}
            </p>
          )}
          <Link
            to={`/blogs/${blog.id}`}
            className="mt-4 inline-block text-sm font-semibold text-sky-500 transition-colors hover:text-sky-600 dark:text-sky-400 dark:hover:text-sky-500"
          >
            阅读更多
          </Link>
        </div>
      </div>
    </div>
  )
}
