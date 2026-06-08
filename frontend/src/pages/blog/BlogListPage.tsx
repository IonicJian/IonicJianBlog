import { useState, useEffect } from 'react';
import { blogApi, tagApi } from '../../api/blog';
import { categoryApi } from '../../api/blog';
import type { Category } from '../../types/category';
import { useAuthStore } from '../../store/authStore';
import type { BlogListItem, Tag } from '../../types/blog';
import BlogCard from '../../components/common/BlogCard';


function CategoryItem({ cat, activeCat, onClick, setPage, depth, isAdmin, onDelete }: { cat: any; activeCat: string; onClick: (s: string) => void; setPage: (n: number) => void; depth: number; isAdmin?: boolean; onDelete?: (id: number) => void }) {
  const [expanded, setExpanded] = useState(false);
  const hasKids = cat.children && cat.children.length > 0;
  return (
    <li>
      <div className="flex items-center gap-0.5 cursor-pointer" style={{ paddingLeft: `${depth * 12}px` }}
        onClick={() => { if (hasKids) setExpanded(!expanded); else { onClick(activeCat===cat.slug?'':cat.slug); setPage(1); } }}>
        <button
          onClick={(e) => { e.stopPropagation(); onClick(activeCat===cat.slug?'':cat.slug); setPage(1); }}
          className={`text-sm cursor-pointer bg-transparent border-none p-0 font-light transition-colors ${activeCat===cat.slug ? 'text-amber-600 dark:text-amber-500' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'}`}
        >
          {cat.name}
        </button>
        {hasKids && <span className="text-[10px] text-slate-400 ml-1">{expanded ? '▾' : '▸'}</span>}
        {isAdmin && onDelete && (
          <button onClick={(e) => { e.stopPropagation(); if(confirm('删除分类「'+cat.name+'」？文章将保留。')) onDelete(cat.id); }}
            className="text-[10px] text-slate-300 hover:text-red-500 bg-transparent border-none cursor-pointer ml-1 p-0 leading-none opacity-0 group-hover:opacity-100 transition-opacity">
            ×
          </button>
        )}
      </div>
      {hasKids && expanded && (
        <ul className="space-y-0.5 mt-0.5">
          {cat.children!.map((child: any) => (
            <CategoryItem key={child.id} cat={child} activeCat={activeCat} onClick={onClick} setPage={setPage} depth={depth + 1} isAdmin={isAdmin} onDelete={onDelete} />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function BlogListPage() {
  const { user: _u } = useAuthStore();
  const isAdmin = _u?.role === 'admin';
  const [blogs, setBlogs] = useState<BlogListItem[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [activeCat, setActiveCat] = useState('');
  const [showTagForm, setShowTagForm] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#d97706');
  const [tagSaving, setTagSaving] = useState(false);

  const loadData = () => {
    setLoading(true);
    const params: any = { page, page_size: 10 };
    if (search) {
      blogApi.search(search, page).then(res => { setBlogs(res.data.data.items || []); setTotal(res.data.data.total); }).finally(() => setLoading(false));
    } else {
      if (activeTags.length > 0) params.tag = activeTags.join(',');
      if (activeCat) params.category = activeCat;
      blogApi.list(params).then(res => { setBlogs(res.data.data.items || []); setTotal(res.data.data.total); }).finally(() => setLoading(false));
    }
    tagApi.list().then(r => setTags(r.data.data || [])).catch(() => {});
    categoryApi.list().then(r => setCats(r.data.data || [])).catch(() => {});
  };
  useEffect(() => { loadData(); }, [page, search, activeTags, activeCat]);

  const handleTagClick = (slug: string) => { setActiveTags(prev => prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]); setPage(1); };
  const handleCreateTag = async () => { if (!newTagName.trim()) return; setTagSaving(true); try { await tagApi.create({ name: newTagName.trim(), color: newTagColor }); setNewTagName(''); setShowTagForm(false); loadData(); } catch {} finally { setTagSaving(false); } };
  const totalPages = Math.ceil(total / 10);
  const presetColors = ['#d97706','#ef4444','#3b82f6','#10b981','#8b5cf6','#ec4899','#6366f1','#14b8a6'];

  return (
    <div className="py-8 page-enter">
      <h1 className="font-bold text-3xl text-slate-800 dark:text-slate-100 mb-1">博客</h1>
      <p className="text-sm text-slate-400 dark:text-slate-500 font-light mb-8">思考与记录</p>
      <div className="flex gap-10">
              <aside className="hidden lg:block w-48 flex-shrink-0">
          <div className="glass rounded-xl p-5 hover-lift sticky top-20">
            <h3 className="text-[10px] font-medium tracking-[0.2em] text-slate-400 uppercase mb-4">分类</h3>
            {cats.length === 0 ? <p className="text-xs text-slate-400 font-light">暂无</p> : <ul className="space-y-1.5">{cats.map(c => <CategoryItem key={c.id} cat={c} activeCat={activeCat} onClick={setActiveCat} setPage={setPage} depth={0} isAdmin={isAdmin} onDelete={(id) => { categoryApi.delete(id).then(() => loadData()).catch(()=>{}); }} />)}</ul>}
            <h3 className="text-[10px] font-medium tracking-[0.2em] text-slate-400 uppercase mb-4 mt-8">标签</h3>
            {tags.length === 0 ? <p className="text-xs text-slate-400 font-light">暂无</p> : <div className="flex flex-wrap gap-1.5">{tags.map(t => <button key={t.id} onClick={() => handleTagClick(t.slug)} className={`text-[11px] font-light border cursor-pointer transition-all px-2 py-0.5 rounded-full ${activeTags.includes(t.slug)?'text-white border-transparent':'border-black/5 dark:border-white/10 text-slate-500 hover:border-black/15'}`} style={activeTags.includes(t.slug)?{backgroundColor:t.color}:{}}>{t.name}</button>)}</div>}
            {activeTags.length > 0 && <button onClick={() => setActiveTags([])} className="mt-3 text-[11px] text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer font-light">清除 ({activeTags.length})</button>}
            {isAdmin && <div className="mt-6 pt-4 border-t border-black/5 dark:border-white/5">
              {!showTagForm ? <button onClick={() => setShowTagForm(true)} className="text-[11px] text-amber-600 hover:text-amber-700 bg-transparent border-none cursor-pointer font-light">+ 新建标签</button>
              : <div className="space-y-2"><input value={newTagName} onChange={e => setNewTagName(e.target.value)} placeholder="标签名" className="w-full input-underline !text-xs" /><div className="flex gap-1">{presetColors.map(c => <button key={c} onClick={() => setNewTagColor(c)} className={`w-4 h-4 rounded-full border-2 cursor-pointer transition-all ${newTagColor===c?'border-slate-800 dark:border-slate-200 scale-110':'border-transparent'}`} style={{backgroundColor:c}} />)}</div><div className="flex gap-2"><button onClick={handleCreateTag} disabled={tagSaving||!newTagName.trim()} className="text-[11px] bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-800 px-3 py-1 rounded-lg hover:bg-slate-700 dark:hover:bg-slate-300 disabled:opacity-30 cursor-pointer font-light">创建</button><button onClick={() => setShowTagForm(false)} className="text-[11px] text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer">取消</button></div></div>}
            </div>}
          </div>
        </aside>
<div className="flex-1 min-w-0">
          <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="搜索文章..." className="input-underline mb-8" />
          {loading ? <p className="text-center py-16 text-slate-400 font-light">加载中...</p>
          : blogs.length === 0 ? <p className="text-center py-16 text-slate-400 font-light">暂无文章</p>
          : <div className="space-y-3">
              {blogs.map(blog => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-12">
              {Array.from({length: totalPages}, (_, i) => (
                <button key={i} onClick={() => setPage(i+1)} className={`w-8 h-8 rounded-lg text-xs font-light cursor-pointer border transition-colors ${page===i+1?'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-800 border-transparent':'border-black/5 dark:border-white/10 text-slate-500 hover:border-black/15'}`}>{i+1}</button>
              ))}
            </div>
          )}
        </div>
  
      </div>
    </div>
  );
}
