import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { friendLinkApi } from '../../api/social';
import type { FriendLink } from '../../types/friendLink';

export default function FriendLinksPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const [links, setLinks] = useState<FriendLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<FriendLink | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState(''); const [url, setUrl] = useState('');
  const [description, setDescription] = useState(''); const [logoUrl, setLogoUrl] = useState('');
  const [sortOrder, setSortOrder] = useState(0);

  const fetchLinks = () => { setLoading(true); friendLinkApi.list().then(r => setLinks(r.data.data || [])).catch(()=>{}).finally(()=>setLoading(false)); };
  useEffect(() => { fetchLinks(); }, []);
  const resetForm = () => { setName(''); setUrl(''); setDescription(''); setLogoUrl(''); setSortOrder(0); setEditing(null); setShowForm(false); setError(''); };
  const openEdit = (l: FriendLink) => { setName(l.name); setUrl(l.url); setDescription(l.description); setLogoUrl(l.logo_url); setSortOrder(l.sort_order); setEditing(l); setShowForm(true); };
  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); if(!name.trim()||!url.trim())return; setSaving(true); setError(''); try { editing ? await friendLinkApi.update(editing.id,{name,url,description,logo_url:logoUrl,sort_order:sortOrder}) : await friendLinkApi.create({name,url,description,logo_url:logoUrl,sort_order:sortOrder}); resetForm(); fetchLinks(); } catch(err:any){ setError(err.response?.data?.message||'操作失败'); } finally { setSaving(false); } };
  const handleDelete = async (l: FriendLink) => { if(!confirm(`删除「${l.name}」？`))return; try { await friendLinkApi.delete(l.id); fetchLinks(); } catch{} };

  return (
    <div className="py-10 page-enter">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-bold text-3xl text-slate-800 dark:text-slate-100 mb-1">友链</h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 font-light">朋友们</p>
        </div>
        {isAdmin && !showForm && <button onClick={() => setShowForm(true)} className="btn-primary !text-xs">添加友链</button>}
      </div>

      {isAdmin && showForm && (
        <form onSubmit={handleSubmit} className="glass rounded-xl p-6 hover-lift mb-8 space-y-4 animate-scale-in">
          <h3 className="text-base font-medium text-slate-800 dark:text-slate-200">{editing ? '编辑' : '添加'}友链</h3>
          {error && <div className="bg-red-50/80 dark:bg-red-950/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-xs font-light">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            {[{p:'名称 *',v:name,s:setName},{p:'链接 *',v:url,s:setUrl,t:'url'},{p:'描述',v:description,s:setDescription},{p:'Logo URL',v:logoUrl,s:setLogoUrl,t:'url'},{p:'排序',v:sortOrder,s:(v:number)=>setSortOrder(v),t:'number'}].map(f=>(
              <input key={f.p} type={f.t||'text'} value={f.v as any} onChange={e=>f.s((f.t==='number'?Number(e.target.value):e.target.value)as any)} placeholder={f.p} className="input-underline" />
            ))}
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="btn-primary !text-xs !py-2">{saving?'保存中...':'保存'}</button>
            <button type="button" onClick={resetForm} className="btn-ghost !text-xs !py-2">取消</button>
          </div>
        </form>
      )}

      {loading ? <p className="text-center py-16 text-slate-400 font-light">加载中...</p>
      : links.length === 0 ? <p className="text-center py-16 text-slate-400 font-light">{isAdmin?'点击「添加友链」开始':'暂无友链'}</p>
      : <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {links.map((link,i) => (
            <div key={link.id} className="glass rounded-xl p-5 hover-lift relative group animate-fade-up" style={{animationDelay:`${0.06*i}s`}}>
              <a href={link.url} target="_blank" rel="noopener noreferrer" className="no-underline flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden flex-shrink-0 ring-1 ring-black/5 dark:ring-white/5">
                  {link.logo_url ? <img src={link.logo_url} alt="" className="w-full h-full object-cover" /> : <span className="text-slate-400 text-lg font-light">{link.name[0]}</span>}
                </div>
                <div>
                  <span className="text-base font-medium text-slate-800 dark:text-slate-200">{link.name}</span>
                  {link.description && <p className="text-sm text-slate-400 font-light mt-1">{link.description}</p>}
                </div>
              </a>
              {isAdmin && (
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button onClick={() => openEdit(link)} className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer text-slate-600 dark:text-slate-400">编辑</button>
                  <button onClick={() => handleDelete(link)} className="text-[10px] bg-red-50 dark:bg-red-950/30 text-red-500 px-2 py-0.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/50 cursor-pointer">删除</button>
                </div>
              )}
            </div>
          ))}
        </div>}
    </div>
  );
}
