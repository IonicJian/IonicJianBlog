import axios, {
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios'
import type { ApiResponse } from '@/types/common'
import type { AuthTokens } from '@/types/user'

const ACCESS_KEY = 'access_token'
const REFRESH_KEY = 'refresh_token'

const client = axios.create({
  baseURL: '/api/v1',
  timeout: 15000,
})

client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem(ACCESS_KEY)
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  if (config.data instanceof FormData) {
    config.headers.delete('Content-Type')
  }
  return config
})

let refreshing: Promise<void> | null = null

async function doRefresh(): Promise<void> {
  const refresh = localStorage.getItem(REFRESH_KEY)
  if (!refresh) throw new Error('no refresh token')
  const res = await axios.post<ApiResponse<AuthTokens>>(
    '/api/v1/auth/refresh',
    { refresh_token: refresh },
  )
  const data = res.data.data
  localStorage.setItem(ACCESS_KEY, data.access_token)
  localStorage.setItem(REFRESH_KEY, data.refresh_token)
}

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }
    const isAuthCall = original.url?.includes('/auth/')
    if (error.response?.status === 401 && !original._retry && !isAuthCall) {
      original._retry = true
      try {
        if (!refreshing) {
          refreshing = doRefresh().finally(() => {
            refreshing = null
          })
        }
        await refreshing
        return client(original)
      } catch {
        localStorage.removeItem(ACCESS_KEY)
        localStorage.removeItem(REFRESH_KEY)
      }
    }
    return Promise.reject(error)
  },
)

export async function apiGet<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  const res = await client.get<ApiResponse<T>>(url, config)
  return res.data.data
}

export async function apiPost<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const res = await client.post<ApiResponse<T>>(url, body, config)
  return res.data.data
}

export async function apiPut<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const res = await client.put<ApiResponse<T>>(url, body, config)
  return res.data.data
}

export async function apiDelete<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  const res = await client.delete<ApiResponse<T>>(url, config)
  return res.data.data
}

export function extractMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const resp = (error as { response?: { data?: { message?: string } } })
      .response
    if (resp?.data?.message) return resp.data.message
  }
  if (error instanceof Error) return error.message
  return '请求失败,请稍后重试'
}

export default client
