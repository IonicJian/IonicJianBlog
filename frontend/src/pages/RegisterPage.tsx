import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const register = useAuthStore((s) => s.register);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await register(username, email, password); navigate('/'); } catch (err: any) { setError(err.response?.data?.message || '注册失败'); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-sm animate-scale-in">
        <h1 className="font-bold text-2xl text-slate-800 dark:text-slate-100 mb-2 text-center">注册</h1>
        <p className="text-sm text-slate-400 dark:text-slate-500 font-light mb-10 text-center">创建你的账号</p>

        <form onSubmit={handleSubmit} className="glass rounded-xl p-8 space-y-5">
          {error && <div className="bg-red-50/80 dark:bg-red-950/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-xs font-light">{error}</div>}

          {[{l:'用户名',t:'text',v:username,s:setUsername,p:'yourname',m:3},{l:'邮箱',t:'email',v:email,s:setEmail,p:'you@example.com'},{l:'密码',t:'password',v:password,s:setPassword,p:'至少 6 位',m:6}].map(f => (
            <div key={f.l}>
              <label className="block text-[10px] font-medium tracking-[0.2em] text-slate-400 uppercase mb-2">{f.l}</label>
              <input type={f.t} value={f.v} onChange={e => f.s(e.target.value)} required minLength={f.m} className="input-underline" placeholder={f.p} />
            </div>
          ))}

          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">{loading ? '注册中...' : '注册'}</button>

          <p className="text-center text-xs text-slate-400 font-light pt-2">
            已有账号？<Link to="/login" className="text-amber-600 dark:text-amber-500 hover:text-amber-700 underline underline-offset-4 transition-colors">登录</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
