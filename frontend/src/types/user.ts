export type UserRole = 'admin' | 'user'

export interface User {
  id: number
  username: string
  email: string
  display_name: string
  avatar_url: string
  bio: string
  github_id?: number
  role: UserRole
  created_at: string
  updated_at: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  expires_in: number
}

export interface AuthResponse {
  user: User
  access_token: string
  refresh_token: string
  expires_in: number
}
