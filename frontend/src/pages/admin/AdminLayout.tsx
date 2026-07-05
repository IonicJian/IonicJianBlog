import { Suspense } from 'react'
import { NavLink, Navigate, Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'

const NAV = [
  { to: '/admin', label: '仪表盘', end: true },
  { to: '/admin/blogs', label: '文章' },
  { to: '/admin/categories', label: '分类' },
  { to: '/admin/tags', label: '标签' },
  { to: '/admin/comments', label: '评论' },
  { to: '/admin/guestbook', label: '留言' },
  { to: '/admin/friend-links', label: '友链' },
  { to: '/admin/photography', label: '摄影' },
]

export function AdminLayout() {
  const user = useAuthStore((s) => s.user)
  const initializing = useAuthStore((s) => s.initializing)

  if (initializing) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-sm text-gray-500 sm:px-6 dark:text-gray-400">
        加载中...
      </div>
    )
  }
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-medium tracking-tight text-gray-950 dark:text-white">
        管理
      </h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[180px_1fr]">
        <aside className="flex flex-col gap-1">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'rounded-md px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-gray-950/5 text-gray-950 dark:bg-white/10 dark:text-white'
                    : 'text-gray-500 hover:bg-gray-950/5 hover:text-gray-950 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </aside>
        <div className="min-w-0">
          <Suspense
            fallback={
              <div className="text-sm text-gray-500 dark:text-gray-400">
                加载中...
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
