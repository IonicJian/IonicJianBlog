import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';

export default function Header() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { theme, toggleTheme } = useUIStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="text-xl font-bold text-gray-800 dark:text-gray-100 no-underline">
            My Blog
          </Link>

          <nav className="flex items-center gap-4 text-sm">
            <Link to="/blogs" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white no-underline">
              博客
            </Link>
            <Link to="/friends" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white no-underline">
              友链
            </Link>
            <Link to="/guestbook" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white no-underline">
              留言墙
            </Link>
            <Link to="/trending" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white no-underline">
              趋势
            </Link>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? '切换浅色模式' : '切换深色模式'}
              className="text-lg bg-transparent border-none cursor-pointer px-1 leading-none"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            <div className="ml-2 flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  {user?.role === 'admin' && (
                    <Link to="/blogs/create" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 no-underline font-medium">
                      写博客
                    </Link>
                  )}
                  <Link to="/profile" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white no-underline">
                    {user?.display_name || user?.username}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 bg-transparent border-none cursor-pointer"
                  >
                    退出
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white no-underline">
                    登录
                  </Link>
                  <Link
                    to="/register"
                    className="bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 no-underline text-sm"
                  >
                    注册
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
