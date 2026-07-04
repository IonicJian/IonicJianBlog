import type { User } from './user'

export interface FriendLink {
  id: number
  name: string
  url: string
  description: string
  logo_url: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface FriendLinkForm {
  name: string
  url: string
  description?: string
  logo_url?: string
  sort_order?: number
}

export interface GuestbookMessage {
  id: number
  user_id?: number
  nickname: string
  content: string
  is_approved: boolean
  created_at: string
  updated_at: string
  author?: User
}

export interface GuestbookForm {
  content: string
  nickname?: string
}
