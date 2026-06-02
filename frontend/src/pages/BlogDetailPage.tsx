import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { blogApi } from '../api/blogs';
import MarkdownRenderer from '../components/common/MarkdownRenderer';
import LikeButton from '../components/like/LikeButton';
import CommentList from '../components/comment/CommentList';
import type { Blog } from '../types/blog';

export default function BlogDetailPage() {
  const { id } = useParams();
  const { isAuthenticated } = useAuthStore();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  // Inline quote state
  const [pendingQuote, setPendingQuote] = useState<{ anchorStart: string; anchorText: string } | null>(null);
  const [activeQuote, setActiveQuote] = useState<{ anchorStart: string; anchorText: string } | null>(null);
  const [iconPos, setIconPos] = useState<{ x: number; y: number } | null>(null);
  const [iconVisible, setIconVisible] = useState(false);
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    blogApi.getById(Number(id))
      .then((res) => {
        if (cancelled) return;
        setBlog(res.data.data);
        blogApi.incrementView(Number(id)).catch(() => {});
      })
      .catch(() => { if (!cancelled) setBlog(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  // Text selection → show floating icon
  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 2) return;
      const target = e.target as HTMLElement;
      if (target.closest('[data-quote-icon]')) return;

      setTimeout(() => {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed || !sel.toString().trim()) {
          setIconVisible(false);
          return;
        }
        const text = sel.toString().trim();
        if (text.length < 2 || text.length > 500) { setIconVisible(false); return; }

        const range = sel.getRangeAt(0);
        let node: Node | null = range.startContainer;
        let anchorStart = '';
        while (node) {
          if (node instanceof HTMLElement) {
            const pid = node.getAttribute('data-p-id');
            if (pid) { anchorStart = pid; break; }
          }
          node = node.parentElement;
        }
        if (!anchorStart) { setIconVisible(false); return; }

        const rect = range.getBoundingClientRect();
        setPendingQuote({ anchorStart, anchorText: text });
        setIconPos({ x: rect.right + 5, y: rect.top + window.scrollY - 5 });
        setIconVisible(true);
      }, 0);
    };
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  // Scroll to comment box and activate quote
  const handleQuoteClick = () => {
    setIconVisible(false);
    setActiveQuote(pendingQuote);
    setTimeout(() => {
      document.getElementById('comment-box')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  if (loading) return <div className="py-12 text-center text-gray-400 dark:text-gray-500">加载中...</div>;
  if (!blog) return (
    <div className="py-12 text-center">
      <p className="text-gray-500 dark:text-gray-400 mb-4">文章不存在。</p>
      <Link to="/blogs" className="text-blue-600 dark:text-blue-400 hover:underline">返回博客列表</Link>
    </div>
  );

  return (
    <div className="py-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <Link to="/blogs" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">&larr; 返回博客列表</Link>
        {isAdmin && (
          <Link to={`/blogs/${blog.id}/edit`} className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
            编辑
          </Link>
        )}
      </div>

      {blog.cover_image && (
        <img src={blog.cover_image} alt={blog.title} className="w-full h-64 object-cover rounded-lg mb-6" />
      )}

      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">{blog.title}</h1>

      <div className="flex items-center gap-4 text-sm text-gray-400 dark:text-gray-500 mb-4">
        <span>{new Date(blog.created_at).toLocaleDateString('zh-CN')}</span>
        <span>{blog.view_count} 阅读</span>
        {blog.tags?.map((tag) => (
          <span key={tag.id} className="px-2 py-0.5 rounded text-xs text-white" style={{ backgroundColor: tag.color }}>{tag.name}</span>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 mb-6">
        <MarkdownRenderer content={blog.content} />
      </div>

      {/* Floating quote icon */}
      {iconVisible && iconPos && isAuthenticated && (
        <button
          data-quote-icon
          onClick={handleQuoteClick}
          className="fixed z-50 bg-blue-600 text-white w-8 h-8 rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 cursor-pointer text-sm"
          style={{ left: iconPos.x, top: iconPos.y }}
        >
          💬
        </button>
      )}

      <div className="flex items-center justify-center mb-8">
        <LikeButton blogId={blog.id} initialLiked={blog.liked_by_me} initialCount={blog.like_count} />
      </div>

      <div id="comment-box" className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <CommentList blogId={blog.id} quoteAnchor={activeQuote?.anchorStart} quoteText={activeQuote?.anchorText} onQuoteClear={() => setActiveQuote(null)} />
      </div>
    </div>
  );
}
