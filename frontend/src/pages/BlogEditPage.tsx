import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MDEditor from '@uiw/react-md-editor';
import { blogApi, tagApi } from '../api/blogs';
import { categoryApi, type Category } from '../api/categories';
import type { Tag } from '../types/blog';
import MarkdownRenderer from '../components/common/MarkdownRenderer';
import ImageUploadButton from '../components/common/ImageUploadButton';
import { useUIStore } from '../store/uiStore';

function TagCreator({ onCreated }: { onCreated: (tag: Tag) => void }) {
  const [open, setOpen] = useState(false); const [name, setName] = useState(''); const [color, setColor] = useState('#d97706'); const [saving, setSaving] = useState(false);
  const colors = ['#d97706','#ef4444','#3b82f6','#10b981','#8b5cf6','#ec4899','#6366f1','#14b8a6'];
  if (!open) return <button type="button" onClick={() => setOpen(true)} className="px-2.5 py-1 rounded-full text-xs border border-dashed border-slate-300 dark:border-slate-600 text-slate-400 hover:text-slate-600 font-light cursor-pointer transition-colors">+ 新标签</button>;
  return (
    <span className="inline-flex items-center gap-1 glass rounded-full px-2.5 py-1">
      <input value={name} onChange={e => setName(e.target.value)} placeholder="标签名" className="w-14 text-xs bg-transparent border-none outline-none text-slate-800 dark:text-slate-200 font-light" autoFocus />
      <span className="flex gap-0.5">{colors.map(c => <button key={c} onClick={() => setColor(c)} className={`w-3.5 h-3.5 rounded-full border-2 cursor-pointer transition-all ${color===c?'border-slate-800 dark:border-slate-200 scale-110':'border-transparent'}`} style={{backgroundColor:c}} />)}</span>
      <button onClick={async () => { if(!name.trim())return; setSaving(true); try { const r = await tagApi.create({name:name.trim(),color}); onCreated(r.data.data); setName(''); setOpen(false); } catch{} finally { setSaving(false); } }} disabled={saving||!name.trim()} className="text-xs text-amber-600 hover:text-amber-700 font-light disabled:opacity-30 bg-transparent border-none cursor-pointer">确定</button>
      <button onClick={() => setOpen(false)} className="text-xs text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer">×</button>
    </span>
  );
}



function CategoryCreator({ onCreated, categories }: { onCreated: (cat: Category) => void; categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const flatCats = (cats: Category[], depth = 0): { id: number; name: string; depth: number }[] => {
    const result: { id: number; name: string; depth: number }[] = [];
    for (const c of cats) { result.push({ id: c.id, name: c.name, depth }); if (c.children) result.push(...flatCats(c.children, depth + 1)); }
    return result;
  };
  if (!open) return <button type="button" onClick={() => setOpen(true)} className="text-xs text-amber-600 hover:text-amber-700 font-light bg-transparent border border-dashed border-amber-300 dark:border-amber-700 rounded-lg px-2 py-1.5 cursor-pointer transition-colors">+ 分类</button>;
  return (
    <span className="inline-flex items-center gap-1.5">
      <input value={name} onChange={e => setName(e.target.value)} placeholder="分类名" className="w-20 text-xs bg-transparent border-b border-black/10 dark:border-white/10 outline-none text-slate-800 dark:text-slate-200 py-0.5 font-light" autoFocus />
      <select value={parentId ?? ''} onChange={e => setParentId(e.target.value ? Number(e.target.value) : null)} className="bg-transparent border border-black/10 dark:border-white/10 rounded text-[10px] text-slate-500 font-light">
        <option value="">顶级</option>
        {flatCats(categories).map(c => <option key={c.id} value={c.id}>{'└'.repeat(c.depth)} {c.name}</option>)}
      </select>
      <button onClick={async () => { if(!name.trim())return; setSaving(true); try { const r = await categoryApi.create({name:name.trim(), parent_id:parentId}); onCreated(r.data.data); setName(''); setOpen(false); } catch{} finally { setSaving(false); } }} disabled={saving||!name.trim()} className="text-xs text-amber-600 hover:text-amber-700 font-light disabled:opacity-30 bg-transparent border-none cursor-pointer">确定</button>
      <button onClick={() => setOpen(false)} className="text-xs text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer">×</button>
    </span>
  );
}

export default function BlogEditPage() {
  const { id } = useParams(); const navigate = useNavigate();
  const [title, setTitle] = useState(''); const [content, setContent] = useState('');
  const [status, setStatus] = useState<'draft'|'published'>('published');
  const [categoryId, setCategoryId] = useState<number|null>(null);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [saving, setSaving] = useState(false); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]); const [tags, setTags] = useState<Tag[]>([]);
  const theme = useUIStore(s => s.theme);

  useEffect(() => {
    if (!id) return;
    blogApi.getById(Number(id)).then(res => { const b=res.data.data; setTitle(b.title); setContent(b.content); setStatus(b.status as'draft'|'published'); setCategoryId(b.category_id??null); setSelectedTags(b.tags?.map(t=>t.id)||[]); }).catch(()=>setError('文章不存在')).finally(()=>setLoading(false));
    categoryApi.list().then(r=>setCategories(r.data.data||[])).catch(()=>{});
    tagApi.list().then(r=>setTags(r.data.data||[])).catch(()=>{});
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); setError(''); setSaving(true); try { await blogApi.update(Number(id),{title,content,status,category_id:categoryId??undefined,tag_ids:selectedTags}); navigate(`/blogs/${id}`); } catch(err:any){ setError(err.response?.data?.message||'更新失败'); } finally { setSaving(false); } };
  const handleDelete = async () => { try { await blogApi.delete(Number(id)); navigate('/blogs'); } catch(err:any){ setError(err.response?.data?.message||'删除失败'); } };

  if (loading) return <div className="py-20 text-center text-slate-400 font-light">加载中...</div>;

  return (
    <div className="py-8">
      <h1 className="font-bold text-4xl text-slate-800 dark:text-slate-100 mb-8">编辑博客</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <div className="bg-red-50/80 dark:bg-red-950/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-xs font-light">{error}</div>}

        <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="input-underline !text-xl !py-3" />

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <select value={categoryId??''} onChange={e => setCategoryId(e.target.value?Number(e.target.value):null)} className="bg-transparent border border-black/5 dark:border-white/5 rounded-xl px-3 py-2 text-sm text-slate-600 dark:text-slate-400 font-light focus:outline-none focus:border-amber-500/50">
              <option value="">选择分类</option>
              {categories.flatMap((c: any) => { const items = [{ id: c.id, name: c.name, depth: 0 }]; const flatten = (cats: any[], d: number) => { for (const x of cats) { items.push({ id: x.id, name: x.name, depth: d }); if (x.children) flatten(x.children, d + 1); } }; if (c.children) flatten(c.children, 1); return items; }).map((c: any) => (<option key={c.id} value={c.id}>{(Array(c.depth).fill('└ ').join(''))}{c.name}</option>))}
            </select>
            <CategoryCreator categories={categories} onCreated={(cat: any) => { setCategories((prev: any) => [...prev, cat]); setCategoryId(cat.id); }} />
          </div>
          <select value={status} onChange={e => setStatus(e.target.value as'draft'|'published')} className="bg-transparent border border-black/5 dark:border-white/5 rounded-xl px-3 py-2 text-sm text-slate-600 dark:text-slate-400 font-light focus:outline-none focus:border-amber-500/50">
            <option value="published">发布</option><option value="draft">草稿</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {tags.map(t => <button key={t.id} type="button" onClick={() => setSelectedTags(prev => prev.includes(t.id)?prev.filter(x=>x!==t.id):[...prev,t.id])} className={`px-2.5 py-1 rounded-full text-xs font-light border cursor-pointer transition-all ${selectedTags.includes(t.id)?'text-white border-transparent':'border-black/5 dark:border-white/10 text-slate-500 hover:border-black/15 dark:hover:border-white/20'}`} style={selectedTags.includes(t.id)?{backgroundColor:t.color}:{}}>{t.name}</button>)}
          <TagCreator onCreated={tag => { setTags(prev => [...prev,tag]); setSelectedTags(prev => [...prev,tag.id]); }} />
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div data-color-mode={theme==='dark'?'dark':'light'}>
            <div className="flex items-center gap-2 mb-2">
              <ImageUploadButton onInsert={md => setContent(prev => prev+'\n'+md+'\n')} />
              <span className="text-[10px] text-slate-400 font-light tracking-wider uppercase">图片</span>
            </div>
            <MDEditor value={content} onChange={v => setContent(v||'')} height={500} preview="edit" />
          </div>
          <div className="glass rounded-xl overflow-auto h-[500px]">
            <div className="px-4 py-2.5 border-b border-black/5 dark:border-white/5 text-[10px] text-slate-400 font-medium tracking-[0.2em] uppercase">预览</div>
            <div className="p-5"><MarkdownRenderer content={content} /></div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-4">
            <button type="submit" disabled={saving||!title} className="btn-primary">{saving?'保存中...':'保存'}</button>
            <button type="button" onClick={() => navigate(-1)} className="btn-ghost">取消</button>
          </div>
          {!deleteConfirm ? <button type="button" onClick={() => setDeleteConfirm(true)} className="text-sm text-red-500 hover:text-red-600 font-light bg-transparent border-none cursor-pointer transition-colors">删除</button>
          : <div className="flex items-center gap-2"><span className="text-sm text-red-500 font-light">确认删除？</span><button type="button" onClick={handleDelete} className="text-sm bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 cursor-pointer font-light">确认</button><button type="button" onClick={() => setDeleteConfirm(false)} className="text-sm text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer font-light">取消</button></div>}
        </div>
      </form>
    </div>
  );
}
