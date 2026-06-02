import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { guestbookApi, type GuestbookMessage } from '../api/guestbook';

export default function GuestbookPage() {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<GuestbookMessage[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [nickname, setNickname] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchMessages = useCallback(() => {
    setLoading(true);
    guestbookApi.list(page).then((res) => {
      setMessages(res.data.data.items || []);
      setTotal(res.data.data.total);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await guestbookApi.create(nickname.trim() || user?.username || '匿名', content.trim());
      setContent('');
      if (page === 1) fetchMessages(); else setPage(1);
    } catch (err: any) {
      setError(err.response?.data?.message || '发送失败');
    } finally {
      setSubmitting(false);
    }
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="py-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">留言墙</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6 space-y-3">
        {error && <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-3 py-2 rounded text-sm">{error}</div>}
        {!user && (
          <input
            type="text" value={nickname} onChange={(e) => setNickname(e.target.value)}
            placeholder="你的昵称（选填）"
            className="w-full border border-gray-200 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )}
        <textarea
          value={content} onChange={(e) => setContent(e.target.value)}
          placeholder="留下你想说的话..."
          rows={3} required
          className="w-full border border-gray-200 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
        />
        <button type="submit" disabled={submitting || !content.trim()}
          className="bg-blue-600 text-white px-5 py-2 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50 cursor-pointer">
          {submitting ? '发送中...' : '留言'}
        </button>
      </form>

      {/* Messages */}
      {loading ? (
        <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">加载中...</div>
      ) : messages.length === 0 ? (
        <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">暂无留言，来留下第一条吧！</div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                  {msg.nickname || '匿名'}
                </span>
                <span className="text-xs text-gray-400">{new Date(msg.created_at).toLocaleDateString('zh-CN')}</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{msg.content}</p>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} onClick={() => setPage(i + 1)}
              className={`px-3 py-1 rounded text-xs cursor-pointer ${page === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'}`}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
