import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { IconSun, IconMoon } from '../common/Icons';
import UserMenu from './UserMenu';

export default function Header() {
  const { isAuthenticated, user } = useAuthStore();
  const { theme, toggleTheme } = useUIStore();
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-strong transition-all duration-500" style={{ borderRadius: 0 }}>
      <div className="max-w-5xl mx-auto px-6 flex items-center justify-between h-14">
        <Link to="/" className="font-bold text-xl text-slate-800 dark:text-slate-100 no-underline tracking-tight">
          Zane
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          <Link to="/blogs" className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 no-underline font-light tracking-wide transition-colors link-underline">博客</Link>
          <Link to="/friends" className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 no-underline font-light tracking-wide transition-colors link-underline">友链</Link>
          <Link to="/guestbook" className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 no-underline font-light tracking-wide transition-colors link-underline">留言</Link>
          <Link to="/trending" className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 no-underline font-light tracking-wide transition-colors link-underline">趋势</Link>

          <button onClick={toggleTheme} title="切换主题"
            className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 bg-transparent border-none cursor-pointer p-1 transition-colors">
            {theme === 'dark' ? <IconSun className="w-4 h-4" /> : <IconMoon className="w-4 h-4" />}
          </button>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {user?.role === 'admin' && (
                  <Link to="/blogs/create" className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 no-underline text-sm font-light tracking-wide transition-colors">写博客</Link>
                )}
                <UserMenu />
              </>
            ) : (
              <>
                <Link to="/login" className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 no-underline text-sm font-light tracking-wide transition-colors">登录</Link>
                <Link to="/register" className="btn-primary !py-1.5 !px-4 !text-xs no-underline">注册</Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
