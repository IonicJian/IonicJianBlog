export interface Tag {
  id: number
  name: string
  slug: string
  color: string
  created_at: string
  post_count?: number
}

export interface TagForm {
  name: string
  color?: string
}
