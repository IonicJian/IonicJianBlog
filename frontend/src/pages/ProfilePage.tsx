import { useAuthStore } from '../store/authStore';

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !user) {
    return (
      <div className="py-8 text-center text-gray-500 dark:text-gray-400">
        请先登录。
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto py-12">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">个人中心</h1>
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          {user.avatar_url ? (
            <img src={user.avatar_url} alt="" className="w-16 h-16 rounded-full" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 text-xl font-bold">
              {(user.display_name || user.username)[0].toUpperCase()}
            </div>
          )}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{user.display_name || user.username}</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">@{user.username}</p>
          </div>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-1">
          <p className="text-sm text-gray-500 dark:text-gray-400">邮箱：{user.email}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">简介：{user.bio || '暂无简介'}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">角色：{user.role === 'admin' ? '管理员' : '用户'}</p>
        </div>
      </div>
    </div>
  );
}
