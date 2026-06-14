import { useState, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api/auth';

export default function UserMenu() {
  const user = useAuthStore(s => s.user); const logout = useAuthStore(s => s.logout);
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  if (!user) return null;

  const avatarUrl = user.avatar_url
    ? user.avatar_url.startsWith('http')
      ? user.avatar_url
      : `http://localhost:8080${user.avatar_url}`
    : null;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadErr('');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      await authApi.uploadAvatar(formData);
      // Refresh user info
      const profileRes = await authApi.getProfile();
      useAuthStore.getState().setUser(profileRes.data.data);
    } catch (err: any) {
      setUploadErr(err.response?.data?.message || '上传失败');
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setOpen(false);
  };

  const openMenu = () => {
    clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const closeMenu = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 200);
  };

  return (
    <div className="relative" onMouseEnter={openMenu} onMouseLeave={closeMenu}>
      {/* Trigger */}
      <button className="flex items-center gap-2 bg-transparent border-none cursor-pointer p-0">
        <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs font-medium text-slate-400 dark:text-slate-400">
              {user.display_name?.[0] || user.username?.[0] || '?'}
            </span>
          )}
        </div>
        <span className="text-sm text-slate-500 dark:text-slate-300">
          {user.display_name || user.username}
        </span>
      </button>

      {/* Hidden file input — always mounted so onChange fires */}
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={handleUpload}
      />

      {/* Hover panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg border border-black/5 dark:border-white/5 shadow-lg z-50 p-4">
          {/* Avatar preview */}
          <div className="flex flex-col items-center mb-3">
            <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden mb-2">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="w-full h-full flex items-center justify-center text-2xl font-light text-slate-400">
                  {user.display_name?.[0] || user.username?.[0] || '?'}
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
              {user.display_name || user.username}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-400">{user.email}</p>
          </div>

          {uploadErr && (
            <p className="text-xs text-red-500 mb-2 text-center">{uploadErr}</p>
          )}

          {/* Upload button */}
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full text-xs text-center py-2 rounded-md border border-black/5 dark:border-white/10 text-slate-400 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 bg-transparent cursor-pointer transition-colors mb-2"
          >
            {uploading ? '上传中...' : '更换头像'}
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full text-xs text-center py-2 rounded-md text-slate-400 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 bg-transparent border-none cursor-pointer transition-colors"
          >
            退出登录
          </button>
        </div>
      )}
    </div>
  );
}
