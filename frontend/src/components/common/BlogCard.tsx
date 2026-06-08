import { Link } from 'react-router-dom';
import type { BlogListItem } from '../../types/blog';

interface Props { blog: BlogListItem; variant?: 'glass' | 'simple'; }

export default function BlogCard({ blog, variant = 'glass' }: Props) {
  if (variant === 'simple') {
    return (
      <Link to={`/blogs/${blog.id}`} className="no-underline block group animate-fade-up">
        <div className="flex items-start justify-between gap-8 py-5 px-6 rounded-xl border border-slate-200/60 dark:border-slate-700/40 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-600/40 transition-all duration-200">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              {blog.is_top && <span className="text-[11px] text-amber-600 dark:text-amber-500 font-light border border-amber-300 dark:border-amber-700 px-1.5 py-0.5 rounded">置顶</span>}
              {blog.category && <span className="text-[11px] text-slate-400 dark:text-slate-500 font-light">{blog.category.name}</span>}
            </div>
            <h3 className="text-base font-medium text-slate-800 dark:text-slate-200 mb-1 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors">{blog.title}</h3>
            <p className="text-sm text-slate-400 dark:text-slate-500 font-light line-clamp-1">{blog.excerpt}</p>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500 font-light flex-shrink-0 pt-0.5">
            {blog.tags?.slice(0, 2).map(t => <span key={t.id} className="px-1.5 py-0.5 border border-slate-200/60 dark:border-slate-700/40 rounded" style={{color:t.color,fontSize:'11px'}}>{t.name}</span>)}
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span>{new Date(blog.created_at).toLocaleDateString('zh-CN')}</span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span>{blog.view_count} 阅读</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/blogs/${blog.id}`} className="no-underline block group animate-fade-up">
      <div className="glass rounded-xl p-6">
        <div className="flex items-start justify-between gap-10">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {blog.is_top && <span className="text-[11px] text-amber-600 dark:text-amber-500 font-light border border-amber-300 dark:border-amber-700 px-1.5 py-0.5 rounded">置顶</span>}
              {blog.category && <span className="text-[11px] text-slate-400 dark:text-slate-500 font-light">{blog.category.name}</span>}
            </div>
            <h3 className="text-base font-medium text-slate-800 dark:text-slate-200 mb-1.5 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors">{blog.title}</h3>
            <p className="text-sm text-slate-400 dark:text-slate-500 font-light line-clamp-1">{blog.excerpt}</p>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500 font-light flex-shrink-0 pt-0.5">
            {blog.tags?.slice(0, 2).map(t => <span key={t.id} className="px-1.5 py-0.5 border border-black/5 dark:border-white/5 rounded" style={{color:t.color,fontSize:'11px'}}>{t.name}</span>)}
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span>{new Date(blog.created_at).toLocaleDateString('zh-CN')}</span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span>{blog.view_count} 阅读</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
