import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { guestbookApi, type GuestbookMessage } from '../api/guestbook';

export default function GuestbookPage() {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<GuestbookMessage[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [nickname, _setNickname] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchMessages = useCallback(() => {
    setLoading(true);
    guestbookApi.list(page).then((res) => { setMessages(res.data.data.items || []); setTotal(res.data.data.total); }).catch(() => {}).finally(() => setLoading(false));
  }, [page]);
  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!content.trim()) return; setSubmitting(true); setError('');
    try { await guestbookApi.create(anonymous ? '匿名' : (nickname.trim() || user?.username || '匿名'), content.trim()); setContent(''); if (page === 1) fetchMessages(); else setPage(1); } catch (err: any) { setError(err.response?.data?.message || '发送失败'); } finally { setSubmitting(false); }
  };
  const totalPages = Math.ceil(total / 20);

  return (
    <div className="py-10 page-enter max-w-2xl mx-auto">
      <h1 className="font-bold text-3xl text-slate-800 dark:text-slate-100 mb-1">留言墙</h1>
      <p className="text-sm text-slate-400 dark:text-slate-500 font-light mb-10">留下你的足迹</p>

      {!user ? (
        <div className="glass rounded-xl p-8 text-center">
          <p className="text-slate-500 dark:text-slate-400 font-light mb-4">登录后即可留言</p>
          <Link to="/login" className="btn-primary no-underline">登录</Link>
        </div>
      ) : (
      <form onSubmit={handleSubmit} className="glass rounded-xl p-6 hover-lift mb-8 space-y-4 animate-scale-in">
        {error && <div className="bg-red-50/80 dark:bg-red-950/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-xs font-light">{error}</div>}
        <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="留下你想说的话..." rows={3} required className="w-full bg-transparent border border-black/5 dark:border-white/5 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-300 dark:placeholder-slate-600 focus:outline-none focus:border-amber-500/50 resize-y font-light" />
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs text-slate-400 font-light cursor-pointer">
            <input type="checkbox" checked={anonymous} onChange={e => setAnonymous(e.target.checked)} className="rounded" />
            匿名发送
          </label>
          <button type="submit" disabled={submitting || !content.trim()} className="btn-primary">{submitting ? '发送中...' : '留言'}</button>
        </div>
      </form>
      )}

      {loading ? <p className="text-center py-16 text-slate-400 font-light">加载中...</p>
      : messages.length === 0 ? <p className="text-center py-16 text-slate-400 font-light">暂无留言，来留下第一条吧</p>
      : <div className="space-y-3">
          {messages.map(msg => (
            <div key={msg.id} className="glass rounded-xl p-5 hover-lift animate-fade-up">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{msg.nickname || '匿名'}</span>
                <span className="text-xs text-slate-400 font-light">{new Date(msg.created_at).toLocaleDateString('zh-CN')}</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-light whitespace-pre-wrap leading-relaxed">{msg.content}</p>
            </div>
          ))}
        </div>}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          {Array.from({length: totalPages}, (_, i) => (
            <button key={i} onClick={() => setPage(i+1)} className={`w-8 h-8 rounded-lg text-xs font-light cursor-pointer border transition-colors ${page===i+1?'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-800 border-transparent':'border-black/5 dark:border-white/10 text-slate-500 hover:border-black/15'}`}>{i+1}</button>
          ))}
        </div>
      )}
    </div>
  );
}
