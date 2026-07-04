export interface Category {
  id: number
  name: string
  slug: string
  description: string
  sort_order: number
  parent_id?: number
  children?: Category[]
  created_at: string
}

export interface CategoryForm {
  name: string
  parent_id?: number
}
