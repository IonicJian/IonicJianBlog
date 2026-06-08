import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { blogApi } from '../../api/blog';
import MarkdownRenderer from '../../components/common/MarkdownRenderer';
import LikeButton from '../../components/like/LikeButton';
import CommentList from '../../components/comment/CommentList';
import { IconQuote, IconArrowLeft } from '../../components/common/Icons';
import Lightbox from '../../components/common/Lightbox';
import TableOfContents from '../../components/common/TableOfContents';
import type { Blog } from '../../types/blog';

export default function BlogDetailPage() {
  const { id } = useParams();
  const { isAuthenticated } = useAuthStore();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingQuote, setPendingQuote] = useState<{ anchorStart: string; anchorText: string } | null>(null);
  const [activeQuote, setActiveQuote] = useState<{ anchorStart: string; anchorText: string } | null>(null);
  const [iconPos, setIconPos] = useState<{ x: number; y: number } | null>(null);
  const [iconVisible, setIconVisible] = useState(false);
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    let cancelled = false; setLoading(true);
    blogApi.getById(Number(id)).then((res) => { if (cancelled) return; setBlog(res.data.data); blogApi.incrementView(Number(id)).catch(() => {}); }).catch(() => { if (!cancelled) setBlog(null); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 2) return;
      if ((e.target as HTMLElement).closest('[data-quote-icon]')) return;
      setTimeout(() => {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed || !sel.toString().trim()) { setIconVisible(false); return; }
        const text = sel.toString().trim();
        if (text.length < 2 || text.length > 500) { setIconVisible(false); return; }
        const range = sel.getRangeAt(0);
        let node: Node | null = range.startContainer; let anchorStart = '';
        while (node) { if (node instanceof HTMLElement) { const pid = node.getAttribute('data-p-id'); if (pid) { anchorStart = pid; break; } } node = node.parentElement; }
        if (!anchorStart) { setIconVisible(false); return; }
        const rect = range.getBoundingClientRect();
        setPendingQuote({ anchorStart, anchorText: text }); setIconPos({ x: rect.right + 5, y: rect.top + window.scrollY - 5 }); setIconVisible(true);
      }, 0);
    };
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  if (loading) return <div className="py-20 text-center text-slate-400 font-light">加载中...</div>;
  if (!blog) return <div className="py-20 text-center"><p className="text-slate-500 mb-4">文章不存在</p><Link to="/blogs" className="text-amber-600 hover:text-amber-700">返回博客列表</Link></div>;

  return (
    <div className="py-10 page-enter max-w-5xl mx-auto">
	<div className="flex gap-10">
<aside className="hidden lg:block w-48 flex-shrink-0 order-first">
      <div className="sticky top-20">
        <TableOfContents content={blog.content} />
      </div>
    </aside>
<div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-10">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-sm no-underline font-light transition-colors bg-transparent border-none cursor-pointer"><IconArrowLeft className="w-3.5 h-3.5" /> 返回</button>
        {isAdmin && <Link to={`/blogs/${blog.id}/edit`} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-sm no-underline font-light transition-colors">编辑</Link>}
      </div>

      {blog.cover_image && <img src={blog.cover_image} alt={blog.title} className="w-full h-64 object-cover rounded-xl mb-10" />}

      <h1 className="font-bold text-3xl text-slate-800 dark:text-slate-100 mb-4 leading-tight">{blog.title}</h1>

      <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500 font-light mb-10">
        <span>{new Date(blog.created_at).toLocaleDateString('zh-CN')}</span>
        <span className="text-slate-300 dark:text-slate-700">·</span>
        <span>{blog.view_count} 阅读</span>
        {blog.category && <><span className="text-slate-300 dark:text-slate-700">·</span><span>{blog.category.name}</span></>}
        {blog.tags?.map(t => <span key={t.id} className="px-1.5 py-0.5 border border-black/5 dark:border-white/5 rounded text-[10px]" style={{ color: t.color }}>{t.name}</span>)}
      </div>

      <div className="border-t border-black/5 dark:border-white/5 pt-10 mb-10">
        <MarkdownRenderer content={blog.content} onImageClick={(src, alt) => setLightbox({ src, alt })} />
      </div>

      {iconVisible && iconPos && isAuthenticated && (
        <button data-quote-icon onClick={() => { setIconVisible(false); setActiveQuote(pendingQuote); setTimeout(() => document.getElementById('comment-box')?.scrollIntoView({ behavior: 'smooth' }), 100); }}
          className="fixed z-50 bg-amber-500 text-white w-8 h-8 rounded-full shadow-lg flex items-center justify-center hover:bg-amber-600 cursor-pointer" style={{ left: iconPos.x, top: iconPos.y }}>
          <IconQuote className="w-4 h-4" />
        </button>
      )}

      <div className="flex items-center justify-center mb-10">
        <LikeButton blogId={blog.id} initialLiked={blog.liked_by_me} initialCount={blog.like_count} />
      </div>

      <div id="comment-box" className="border-t border-black/5 dark:border-white/5 pt-10">
        <CommentList blogId={blog.id} quoteAnchor={activeQuote?.anchorStart} quoteText={activeQuote?.anchorText} onQuoteClear={() => setActiveQuote(null)} />
      </div>

      {lightbox && <Lightbox src={lightbox.src} alt={lightbox.alt} onClose={() => setLightbox(null)} />}
    </div>
</div>
    </div>
  );
}
