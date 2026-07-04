import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { exchangeCode } from '@/api/auth'
import { extractMessage } from '@/api/client'
import { useAuthStore } from '@/store/authStore'

export function OAuthCallbackPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const loginWithTokens = useAuthStore((s) => s.loginWithTokens)
  const [message, setMessage] = useState('正在处理登录...')

  useEffect(() => {
    const code = params.get('code')
    const err = params.get('error')
    if (err) {
      setMessage(`登录失败: ${err}`)
      setTimeout(() => navigate('/login'), 2000)
      return
    }
    if (!code) {
      setMessage('缺少授权码')
      setTimeout(() => navigate('/login'), 2000)
      return
    }
    exchangeCode(code)
      .then((res) => {
        loginWithTokens(res)
        navigate('/')
      })
      .catch((e) => {
        setMessage(extractMessage(e))
        setTimeout(() => navigate('/login'), 2000)
      })
  }, [params, navigate, loginWithTokens])

  return (
    <div className="mx-auto max-w-md px-6 py-16 text-center text-sm text-muted-foreground">
      {message}
    </div>
  )
}
