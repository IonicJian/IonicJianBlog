import { apiDelete, apiGet, apiPost, apiPut } from './client'
import type {
  Blog,
  BlogForm,
  BlogListItem,
  BlogListQuery,
} from '@/types/blog'
import type { PaginatedData } from '@/types/common'
import type { Category, CategoryForm } from '@/types/category'
import type { Tag, TagForm } from '@/types/tag'

export function listBlogs(query: BlogListQuery = {}) {
  return apiGet<PaginatedData<BlogListItem>>('/blogs', { params: query })
}

export function searchBlogs(q: string, page = 1, page_size = 10) {
  return apiGet<PaginatedData<BlogListItem>>('/blogs/search', {
    params: { q, page, page_size },
  })
}

export function getTopBlogs() {
  return apiGet<BlogListItem[]>('/blogs/top')
}

export function getBlog(id: number) {
  return apiGet<Blog>(`/blogs/${id}`)
}

export function getBlogBySlug(slug: string) {
  return apiGet<Blog>(`/blogs/slug/${slug}`)
}

export function createBlog(form: BlogForm) {
  return apiPost<Blog>('/blogs', form)
}

export function updateBlog(id: number, form: Partial<BlogForm>) {
  return apiPut<Blog>(`/blogs/${id}`, form)
}

export function deleteBlog(id: number) {
  return apiDelete<null>(`/blogs/${id}`)
}

export function generateBlogSummary(id: number) {
  return apiPost<null>(`/blogs/${id}/summary`)
}

export function incrementView(id: number) {
  return apiPost<null>(`/blogs/${id}/view`)
}

export function listTags() {
  return apiGet<Tag[]>('/tags')
}

export function createTag(form: TagForm) {
  return apiPost<Tag>('/tags', form)
}

export function updateTag(id: number, form: TagForm) {
  return apiPut<Tag>(`/tags/${id}`, form)
}

export function deleteTag(id: number) {
  return apiDelete<null>(`/tags/${id}`)
}

export function listCategories() {
  return apiGet<Category[]>('/categories').then((c) => c || [])
}

export function createCategory(form: CategoryForm) {
  return apiPost<Category>('/categories', form)
}

export function updateCategory(id: number, form: CategoryForm) {
  return apiPut<Category>(`/categories/${id}`, form)
}

export function deleteCategory(id: number) {
  return apiDelete<null>(`/categories/${id}`)
}

export function uploadImage(file: File) {
  const form = new FormData()
  form.append('image', file)
  return apiPost<{ url: string }>('/upload/image', form)
}
