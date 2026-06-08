import { useState, useEffect } from 'react';
import { trendingApi, type TrendingRepo } from '../../api/trending';
import { IconStar, IconGitFork } from '../../components/common/Icons';

const langColors: Record<string, string> = { Go:'bg-cyan-500',JavaScript:'bg-yellow-400',TypeScript:'bg-blue-500',Python:'bg-green-500',Rust:'bg-orange-600',Java:'bg-red-500','C++':'bg-pink-500',C:'bg-slate-500',Ruby:'bg-red-600',Swift:'bg-orange-500',Kotlin:'bg-purple-500' };

export default function TrendingPage() {
  const [repos, setRepos] = useState<TrendingRepo[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { trendingApi.get().then(r => setRepos(r.data.data||[])).catch(()=>{}).finally(()=>setLoading(false)); }, []);

  return (
    <div className="py-10 page-enter max-w-3xl mx-auto">
      <h1 className="font-bold text-3xl text-slate-800 dark:text-slate-100 mb-1">GitHub 趋势</h1>
      <p className="text-sm text-slate-400 dark:text-slate-500 font-light mb-10">本周热门开源项目</p>

      {loading ? <p className="text-center py-16 text-slate-400 font-light">加载中...</p>
      : repos.length === 0 ? <p className="text-center py-16 text-slate-400 font-light">暂无数据</p>
      : <div className="space-y-3">
          {repos.map((repo, i) => (
            <a key={repo.full_name} href={repo.url} target="_blank" rel="noopener noreferrer" className="no-underline block">
              <div className="glass rounded-xl p-5 hover-lift hover:border-amber-500/30 transition-all duration-300 animate-fade-up" style={{animationDelay:`${0.04*i}s`}}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-slate-400 font-light w-5">{i+1}</span>
                      <span className="text-slate-400 text-xs font-light">/{repo.full_name}</span>
                    </div>
                    <h3 className="text-base font-medium text-slate-800 dark:text-slate-200 mb-1">{repo.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-light line-clamp-2 mb-3">{repo.description||'暂无描述'}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-400 font-light">
                      {repo.language && <span className="flex items-center gap-1"><span className={`w-2.5 h-2.5 rounded-full ${langColors[repo.language]||'bg-slate-400'}`} />{repo.language}</span>}
                      <span className="inline-flex items-center gap-1"><IconStar className="w-3.5 h-3.5" />{repo.stars.toLocaleString()}</span>
                      <span className="inline-flex items-center gap-1"><IconGitFork className="w-3.5 h-3.5" />{repo.forks.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>}
    </div>
  );
}
