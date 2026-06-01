import { useAuthStore } from '../store/authStore';

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !user) {
    return (
      <div className="py-8 text-center text-gray-500">
        Please login to view your profile.
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Profile</h1>
      <div className="bg-white shadow rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-4">
          {user.avatar_url ? (
            <img src={user.avatar_url} alt="" className="w-16 h-16 rounded-full" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-bold">
              {(user.display_name || user.username)[0].toUpperCase()}
            </div>
          )}
          <div>
            <h2 className="text-xl font-semibold">{user.display_name || user.username}</h2>
            <p className="text-gray-500 text-sm">@{user.username}</p>
          </div>
        </div>
        <div className="border-t pt-4">
          <p className="text-sm text-gray-500">Email: {user.email}</p>
          <p className="text-sm text-gray-500">Bio: {user.bio || 'No bio yet.'}</p>
          <p className="text-sm text-gray-500">Role: {user.role}</p>
        </div>
      </div>
    </div>
  );
}
