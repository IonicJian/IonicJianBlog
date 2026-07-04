import { List, Moon, Sun, X } from '@phosphor-icons/react'
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { UserMenu } from './UserMenu'

const NAV = [
  { to: '/', label: '首页' },
  { to: '/blogs', label: '博客' },
  { to: '/photography', label: '摄影' },
  { to: '/trending', label: '趋势' },
  { to: '/friends', label: '友链' },
]

function ThemeToggle() {
  const theme = useUIStore((s) => s.theme)
  const toggle = useUIStore((s) => s.toggleTheme)
  return (
    <Button variant="ghost" size="icon" onClick={toggle} aria-label="切换主题">
      {theme === 'dark' ? (
        <Sun size={16} weight="regular" />
      ) : (
        <Moon size={16} weight="regular" />
      )}
    </Button>
  )
}

export function Header() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="fixed inset-x-0 top-0 z-10 h-14 border-b border-gray-950/5 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-gray-950/80">
      <div className="relative mx-auto h-14 max-w-7xl">
        <Link
          to="/"
          className="absolute top-1/2 left-[16px] -translate-y-1/2 text-sm font-semibold tracking-tight text-gray-950 sm:left-[24px] dark:text-white"
        >
          IonicJ
        </Link>
        <nav className="absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-1 md:flex">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'rounded-md px-3 py-1.5 text-sm transition-colors',
                  isActive
                    ? 'text-gray-950 dark:text-white'
                    : 'text-gray-500 hover:text-gray-950 dark:text-gray-400 dark:hover:text-white',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute top-1/2 right-[16px] flex -translate-y-1/2 items-center gap-1 sm:right-[24px]">
          <ThemeToggle />
          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="hidden md:inline-flex"
            >
              <Link to="/login">登录</Link>
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="菜单"
          >
            {mobileOpen ? (
              <X size={16} weight="regular" />
            ) : (
              <List size={16} weight="regular" />
            )}
          </Button>
        </div>
      </div>
      {mobileOpen && (
        <nav className="border-t border-gray-950/5 dark:border-white/10 md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col px-4 py-2 sm:px-6">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'rounded-md px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'text-gray-950 dark:text-white'
                      : 'text-gray-500 hover:bg-gray-950/5 hover:text-gray-950 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
            {!isAuthenticated && (
              <NavLink
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2 text-sm text-gray-500 hover:bg-gray-950/5 hover:text-gray-950 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
              >
                登录
              </NavLink>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}
