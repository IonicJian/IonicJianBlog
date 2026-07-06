import type { Tag } from './tag'
import type { User } from './user'

export type BlogStatus = 'draft' | 'published'
export type BlogSort = 'latest' | 'popular'

export interface Blog {
  id: number
  user_id: number
  title: string
  slug: string
  content: string
  content_html: string
  excerpt: string
  cover_image: string
  status: BlogStatus
  view_count: number
  is_top: boolean
  created_at: string
  updated_at: string
  author?: User
  like_count: number
  liked_by_me: boolean
  category_id?: number
  tags?: Tag[]
  ai_summary?: string
}

export interface BlogListItem {
  id: number
  title: string
  slug: string
  excerpt: string
  cover_image: string
  status: BlogStatus
  view_count: number
  is_top: boolean
  category_id?: number
  created_at: string
  updated_at: string
  author?: User
  like_count: number
  liked_by_me: boolean
  tags?: Tag[]
  ai_summary?: string
}

export interface BlogListQuery {
  page?: number
  page_size?: number
  tag?: string
  category?: string
  status?: BlogStatus
  sort?: BlogSort
  user_id?: number
}

export interface BlogForm {
  title: string
  content: string
  status: BlogStatus
  category_id?: number
  tag_ids?: number[]
  is_top?: boolean
}
