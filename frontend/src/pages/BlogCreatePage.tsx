import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MDEditor from '@uiw/react-md-editor';
import { useAuthStore } from '../store/authStore';
import { blogApi } from '../api/blogs';

export default function BlogCreatePage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('# 标题\n\n开始写你的内容...');
  const [status, setStatus] = useState<'draft' | 'published'>('published');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!isAuthenticated) {
    return (
      <div className="py-8 text-center text-gray-500 dark:text-gray-400">
        请先<a href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">登录</a>。
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const res = await blogApi.create({ title, content, status });
      navigate(`/blogs/${res.data.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || '创建失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="py-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">写博客</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-4 py-3 rounded-md text-sm">{error}</div>}

        <input
          type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
          placeholder="文章标题"
          className="w-full border border-gray-200 dark:border-gray-600 rounded-md px-4 py-2.5 text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div data-color-mode="light" className="dark:hidden">
          <MDEditor value={content} onChange={(v) => setContent(v || '')} height={500} preview="live" />
        </div>
        <div data-color-mode="dark" className="hidden dark:block">
          <MDEditor value={content} onChange={(v) => setContent(v || '')} height={500} preview="live" />
        </div>

        <div className="flex items-center gap-4">
          <select value={status} onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
            className="border border-gray-200 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="published">发布</option>
            <option value="draft">草稿</option>
          </select>

          <button type="submit" disabled={saving || !title}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium cursor-pointer">
            {saving ? '保存中...' : '发布'}
          </button>

          <button type="button" onClick={() => navigate(-1)} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
            取消
          </button>
        </div>
      </form>
    </div>
  );
}
