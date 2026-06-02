import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { friendLinkApi, type FriendLink } from '../api/friendLinks';

export default function FriendLinksPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const [links, setLinks] = useState<FriendLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<FriendLink | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Form fields
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [sortOrder, setSortOrder] = useState(0);

  const fetchLinks = () => {
    setLoading(true);
    friendLinkApi.list()
      .then((res) => setLinks(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchLinks(); }, []);

  const resetForm = () => {
    setName(''); setUrl(''); setDescription(''); setLogoUrl(''); setSortOrder(0);
    setEditing(null); setShowForm(false); setError('');
  };

  const openEdit = (link: FriendLink) => {
    setName(link.name); setUrl(link.url); setDescription(link.description);
    setLogoUrl(link.logo_url); setSortOrder(link.sort_order);
    setEditing(link); setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;
    setSaving(true);
    setError('');
    try {
      if (editing) {
        await friendLinkApi.update(editing.id, { name, url, description, logo_url: logoUrl, sort_order: sortOrder });
      } else {
        await friendLinkApi.create({ name, url, description, logo_url: logoUrl, sort_order: sortOrder });
      }
      resetForm();
      fetchLinks();
    } catch (err: any) {
      setError(err.response?.data?.message || '操作失败');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (link: FriendLink) => {
    if (!confirm(`确定删除友链「${link.name}」？`)) return;
    try {
      await friendLinkApi.delete(link.id);
      fetchLinks();
    } catch {}
  };

  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">友链</h1>
        {isAdmin && !showForm && (
          <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 cursor-pointer">
            添加友链
          </button>
        )}
      </div>

      {/* Admin form */}
      {isAdmin && showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6 space-y-3">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{editing ? '编辑友链' : '添加友链'}</h3>
          {error && <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-3 py-2 rounded text-xs">{error}</div>}
          <div className="grid grid-cols-2 gap-3">
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="名称 *" required
              className="border border-gray-200 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="链接 *" required
              className="border border-gray-200 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="描述"
              className="border border-gray-200 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input type="url" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="Logo URL"
              className="border border-gray-200 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} placeholder="排序"
              className="border border-gray-200 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex items-center gap-2">
            <button type="submit" disabled={saving}
              className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-700 disabled:opacity-50 cursor-pointer">
              {saving ? '保存中...' : '保存'}
            </button>
            <button type="button" onClick={resetForm} className="text-gray-500 dark:text-gray-400 text-sm hover:text-gray-700">取消</button>
          </div>
        </form>
      )}

      {/* Link list */}
      {loading ? (
        <div className="text-center py-12 text-gray-400 dark:text-gray-500">加载中...</div>
      ) : links.length === 0 ? (
        <div className="text-center py-12 text-gray-400 dark:text-gray-500">
          {isAdmin ? '点击「添加友链」开始。' : '暂无友链。'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {links.map((link) => (
            <div key={link.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow relative group">
              <a href={link.url} target="_blank" rel="noopener noreferrer" className="no-underline">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {link.logo_url ? (
                      <img src={link.logo_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-400 text-lg">{link.name[0]}</span>
                    )}
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{link.name}</span>
                </div>
                {link.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">{link.description}</p>
                )}
              </a>
              {isAdmin && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button onClick={() => openEdit(link)} className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer">编辑</button>
                  <button onClick={() => handleDelete(link)} className="text-xs bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded hover:bg-red-100 cursor-pointer">删除</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
