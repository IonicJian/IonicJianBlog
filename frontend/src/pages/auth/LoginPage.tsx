import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { IconGitHub } from '../../components/common/Icons';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await login(email, password); navigate('/'); } catch (err: any) { setError(err.response?.data?.message || '登录失败'); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-sm animate-scale-in">
        <h1 className="font-bold text-2xl text-slate-800 dark:text-slate-100 mb-2 text-center">登录</h1>
        <p className="text-sm text-slate-400 dark:text-slate-500 font-light mb-10 text-center">欢迎回来</p>

        <form onSubmit={handleSubmit} className="glass rounded-xl p-8 space-y-5">
          {error && <div className="bg-red-50/80 dark:bg-red-950/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-xs font-light">{error}</div>}

          <div>
            <label className="block text-[10px] font-medium tracking-[0.2em] text-slate-400 uppercase mb-2">邮箱</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="input-underline" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-[10px] font-medium tracking-[0.2em] text-slate-400 uppercase mb-2">密码</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="input-underline" placeholder="········" />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">{loading ? '登录中...' : '登录'}</button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-black/5 dark:bg-white/5" />
            <span className="text-xs text-slate-400 font-light">或</span>
            <div className="flex-1 h-px bg-black/5 dark:bg-white/5" />
          </div>

          <a href="/api/v1/auth/github" className="btn-ghost w-full flex items-center justify-center gap-2 no-underline text-slate-600 dark:text-slate-300">
            <IconGitHub className="w-4 h-4" />
            GitHub
          </a>

          <p className="text-center text-xs text-slate-400 font-light pt-2">
            没有账号？<Link to="/register" className="text-amber-600 dark:text-amber-500 hover:text-amber-700 underline underline-offset-4 transition-colors">注册</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
