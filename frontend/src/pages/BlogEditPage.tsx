import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MDEditor from '@uiw/react-md-editor';
import { blogApi } from '../api/blogs';

export default function BlogEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('published');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!id) return;
    blogApi.getById(Number(id))
      .then((res) => {
        const b = res.data.data;
        setTitle(b.title);
        setContent(b.content);
        setStatus(b.status as 'draft' | 'published');
      })
      .catch(() => setError('文章不存在'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await blogApi.update(Number(id), { title, content, status });
      navigate(`/blogs/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || '更新失败');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await blogApi.delete(Number(id));
      navigate('/blogs');
    } catch (err: any) {
      setError(err.response?.data?.message || '删除失败');
    }
  };

  if (loading) return <div className="py-12 text-center text-gray-400 dark:text-gray-500">加载中...</div>;

  return (
    <div className="py-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">编辑博客</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-4 py-3 rounded-md text-sm">{error}</div>}

        <input
          type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
          placeholder="文章标题"
          className="w-full border border-gray-200 dark:border-gray-600 rounded-md px-4 py-2.5 text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div data-color-mode="light" className="dark:hidden">
          <MDEditor value={content} onChange={(v) => setContent(v || '')} height={500} preview="live" />
        </div>
        <div data-color-mode="dark" className="hidden dark:block">
          <MDEditor value={content} onChange={(v) => setContent(v || '')} height={500} preview="live" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <select value={status} onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
              className="border border-gray-200 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
              <option value="published">发布</option>
              <option value="draft">草稿</option>
            </select>

            <button type="submit" disabled={saving || !title}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium cursor-pointer">
              {saving ? '保存中...' : '保存'}
            </button>

            <button type="button" onClick={() => navigate(-1)} className="text-gray-500 dark:text-gray-400 hover:text-gray-700">
              取消
            </button>
          </div>

          {!deleteConfirm ? (
            <button type="button" onClick={() => setDeleteConfirm(true)} className="text-red-500 dark:text-red-400 hover:text-red-700 text-sm">
              删除
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm text-red-600 dark:text-red-400">确认删除？</span>
              <button type="button" onClick={handleDelete} className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">确认</button>
              <button type="button" onClick={() => setDeleteConfirm(false)} className="text-gray-500 text-sm">取消</button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
