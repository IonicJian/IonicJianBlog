import { apiGet, apiPost, apiPut } from './client'
import type { AuthResponse, AuthTokens, User } from '@/types/user'

export function register(username: string, email: string, password: string) {
  return apiPost<AuthResponse>('/auth/register', { username, email, password })
}

export function login(email: string, password: string) {
  return apiPost<AuthResponse>('/auth/login', { email, password })
}

export function refresh(refresh_token: string) {
  return apiPost<AuthTokens>('/auth/refresh', { refresh_token })
}

export function logout() {
  return apiPost<null>('/auth/logout')
}

export function githubLogin() {
  window.location.href = '/api/v1/auth/github'
}

export function exchangeCode(code: string) {
  return apiPost<AuthResponse>('/auth/exchange-code', { code })
}

export function getProfile() {
  return apiGet<User>('/users/me')
}

export function updateProfile(data: {
  display_name?: string
  bio?: string
  avatar_url?: string
}) {
  return apiPut<User>('/users/me', data)
}

export function uploadAvatar(file: File) {
  const form = new FormData()
  form.append('avatar', file)
  return apiPost<{ avatar_url: string; user: User }>(
    '/users/me/avatar/upload',
    form,
  )
}
