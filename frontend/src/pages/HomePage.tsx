import { useState, useEffect, useRef } from 'react';
import { blogApi } from '../api/blogs';
import apiClient from '../api/client';
import type { BlogListItem } from '../types/blog';
import BlogCard from '../components/common/BlogCard';

type Tab = 'latest' | 'recommended';

export default function HomePage() {
  const [blogs, setBlogs] = useState<BlogListItem[]>([]);
  const [topBlogs, setTopBlogs] = useState<BlogListItem[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('latest');
  const [panelOpen, setPanelOpen] = useState(false);
  const [owner, setOwner] = useState({ display_name: 'Zane', avatar_url: '' });
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    blogApi.list({ page: 1, page_size: 50 }).then((res) => {
      const items = res.data.data.items || [];
      setBlogs(items);
      setTopBlogs(items.filter((b) => b.is_top));
    }).catch(() => {});
    apiClient.get('/site/owner').then((res: any) => {
      if (res.data?.data) setOwner(res.data.data);
    }).catch(() => {});
  }, []);

  const openPanel = (tab: Tab) => { clearTimeout(closeTimer.current); setActiveTab(tab); setPanelOpen(true); };
  const closePanel = () => { closeTimer.current = setTimeout(() => setPanelOpen(false), 600); };
  const cancelClose = () => clearTimeout(closeTimer.current);

  const displayBlogs = activeTab === 'recommended' && topBlogs.length > 0 ? topBlogs : blogs;
  const avatarSrc = owner.avatar_url ? (owner.avatar_url.startsWith('http') ? owner.avatar_url : `http://localhost:8080${owner.avatar_url}`) : null;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-geo-lines" style={{ position: 'fixed', inset: 0 }}>
      {/* ===== Hero — fills remaining space above tab bar ===== */}
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-50/20 via-transparent to-transparent dark:from-amber-950/15 dark:to-transparent pointer-events-none" />

        <div className="flex flex-col items-center transition-all duration-500 ease-out"
          style={{
            transform: panelOpen ? 'scale(0.65) translateY(-8%)' : 'scale(1) translateY(0)',
            opacity: panelOpen ? 0.35 : 1,
          }}>
          <div className="mb-8">
            <div className="w-24 h-24 rounded-full overflow-hidden ring-1 ring-black/5 dark:ring-white/10 ring-offset-4 ring-offset-transparent">
              {avatarSrc ? (
                <img src={avatarSrc} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <span className="text-3xl font-bold text-slate-400 dark:text-slate-500">{owner.display_name?.[0] || 'Z'}</span>
                </div>
              )}
            </div>
          </div>

          <h1 className="font-bold text-6xl md:text-7xl text-slate-800 dark:text-slate-100 mb-4 animate-fade-up stagger-1 tracking-tight">
            {owner.display_name}
          </h1>

          <p className="text-sm font-light tracking-[0.3em] text-slate-400 dark:text-slate-500 mb-2 animate-fade-up stagger-2 uppercase">
            Software Engineer
          </p>

          <div className="w-8 h-px bg-amber-500/40 my-6 animate-fade-up stagger-3" />

          <p className="text-sm text-slate-400 dark:text-slate-500 font-light animate-fade-up stagger-3">
            思考 · 构建 · 分享
          </p>
        </div>
      </div>

      {/* ===== Tab bar — browser-tab style, merges with panel ===== */}
      <div className="flex-shrink-0 flex items-end justify-center gap-0"
        onMouseEnter={cancelClose} onMouseLeave={closePanel}>
        {(['recommended', 'latest'] as Tab[]).map(tab => (
          <button
            key={tab}
            className={`group relative bg-transparent border border-transparent cursor-pointer inline-flex flex-col items-center justify-center w-44 pt-2.5 pb-1.5 rounded-t-xl transition-all duration-300 ${
              activeTab === tab && panelOpen
                ? 'bg-white dark:bg-slate-800 !rounded-b-none !border-b-0 !shadow-none'
                : 'hover:bg-white/30 dark:hover:bg-slate-800/30'
            }`}
            onMouseEnter={() => openPanel(tab)}
          >
            <span className={`text-sm font-light tracking-[0.15em] transition-colors duration-300 ${
              activeTab === tab && panelOpen ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'
            }`}>{tab === 'recommended' ? '推荐阅读' : '最新文章'}</span>
            <span className={`h-0.5 bg-amber-500 rounded-full transition-all duration-300 mt-0.5 ${
              activeTab === tab && panelOpen ? 'w-1/2' : 'w-0 group-hover:w-1/2'
            }`} />
          </button>
        ))}
      </div>

      {/* ===== Blog panel ===== */}
      <div className="overflow-hidden flex-shrink-0"
        style={{
          height: panelOpen ? '66vh' : '0px',
          transition: 'height 0.5s ease-out',
          willChange: 'height',
        }}
        onMouseEnter={cancelClose} onMouseLeave={closePanel}>
        <div className="h-full overflow-y-auto !rounded-t-none bg-white dark:bg-slate-800" style={{ borderTop: 'none', transform: 'translateZ(0)' }}>
          <div className="max-w-3xl mx-auto px-8 py-6">
            {displayBlogs.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-slate-600 font-light tracking-wider py-16 text-center">暂无文章</p>
            ) : (
              <div className="space-y-3">
                {displayBlogs.map(blog => <BlogCard key={blog.id} blog={blog} variant="simple" />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
