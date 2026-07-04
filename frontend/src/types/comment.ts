import type { User } from './user'

export type CommentAuthor = Pick<
  User,
  'id' | 'username' | 'display_name' | 'avatar_url'
>

export interface Comment {
  id: number
  blog_id: number
  user_id: number
  parent_id?: number
  content: string
  anchor_start?: string
  anchor_end?: string
  anchor_text?: string
  is_approved: boolean
  created_at: string
  updated_at: string
  author?: CommentAuthor
  like_count: number
  liked_by_me: boolean
  replies?: Comment[]
}

export interface CreateCommentPayload {
  content: string
  parent_id?: number
  anchor_start?: string
  anchor_end?: string
  anchor_text?: string
}
