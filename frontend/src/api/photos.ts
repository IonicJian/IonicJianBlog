import { apiDelete, apiGet, apiPost } from './client'
import type { Photo } from '@/types/photo'

export function listPhotos() {
  return apiGet<Photo[]>('/photos')
}

export function uploadPhoto(file: File, title: string, sortOrder = 0) {
  const form = new FormData()
  form.append('file', file)
  form.append('title', title)
  form.append('sort_order', String(sortOrder))
  return apiPost<Photo>('/photos', form)
}

export function deletePhoto(id: number) {
  return apiDelete<null>(`/photos/${id}`)
}
