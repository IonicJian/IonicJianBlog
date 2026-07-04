import { SignOut, UserCircle } from '@phosphor-icons/react'
import { useRef, useState, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { uploadAvatar } from '@/api/auth'
import { extractMessage } from '@/api/client'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'

export function UserMenu() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const setUser = useAuthStore((s) => s.setUser)
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cancelHide = () => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current)
      hideTimer.current = null
    }
  }
  const show = () => {
    cancelHide()
    setOpen(true)
  }
  const scheduleHide = () => {
    cancelHide()
    hideTimer.current = setTimeout(() => setOpen(false), 150)
  }

  const handleAvatar = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setOpen(false)
    try {
      const { user: updated } = await uploadAvatar(file)
      setUser(updated)
      toast.success('头像已更新')
    } catch (err) {
      toast.error(extractMessage(err))
    }
    e.target.value = ''
  }

  const initial = user?.display_name?.[0] ?? user?.username?.[0] ?? '?'

  const itemClass =
    'flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors'

  return (
    <div className="relative" onMouseEnter={show} onMouseLeave={scheduleHide}>
      <button
        type="button"
        className="ml-1 flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-gray-950/10 outline-none transition-colors hover:bg-gray-950/5 dark:border-white/10 dark:hover:bg-white/10"
        aria-label="用户菜单"
      >
        {user?.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.display_name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-xs font-medium">{initial}</span>
        )}
      </button>
      {open && (
        <div className="absolute top-full right-0 z-50 mt-1 w-52 rounded-2xl bg-white p-1.5 outline outline-1 outline-gray-950/5 backdrop-blur dark:bg-gray-950 dark:outline-white/10">
          <div className="px-3 py-2">
            <p className="truncate text-sm font-medium text-gray-950 dark:text-white">
              {user?.display_name || user?.username}
            </p>
            <p className="truncate text-xs text-gray-500 dark:text-gray-400">
              {user?.email}
            </p>
          </div>
          <div className="my-1 h-px bg-gray-950/5 dark:bg-white/10" />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className={cn(
              itemClass,
              'text-gray-950 hover:bg-gray-950/5 dark:text-white dark:hover:bg-white/10',
            )}
          >
            <UserCircle size={16} weight="regular" />
            上传头像
          </button>
          {user?.role === 'admin' && (
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                navigate('/admin')
              }}
              className={cn(
                itemClass,
                'text-gray-950 hover:bg-gray-950/5 dark:text-white dark:hover:bg-white/10',
              )}
            >
              管理面板
            </button>
          )}
          <div className="my-1 h-px bg-gray-950/5 dark:bg-white/10" />
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              logout()
            }}
            className={cn(itemClass, 'text-red-600 hover:bg-red-500/10')}
          >
            <SignOut size={16} weight="regular" />
            退出登录
          </button>
        </div>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatar}
      />
    </div>
  )
}
