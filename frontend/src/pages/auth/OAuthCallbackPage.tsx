import { useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api/auth';

export default function OAuthCallbackPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { setAuthFromResponse } = useAuthStore();
  const exchanged = useRef(false);

  useEffect(() => {
    if (exchanged.current) return;
    exchanged.current = true;

    const code = params.get('code');

    if (!code) {
      navigate('/login?error=oauth_failed', { replace: true });
      return;
    }

    authApi.exchangeCode(code)
      .then((res) => {
        setAuthFromResponse(res.data.data);
        navigate('/', { replace: true });
      })
      .catch(() => {
        navigate('/login?error=oauth_failed', { replace: true });
      });
  }, [params, navigate, setAuthFromResponse]);

  return (
    <div className="py-20 text-center text-slate-400 dark:text-slate-400">
      登录中...
    </div>
  );
}
