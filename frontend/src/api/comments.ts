import { apiDelete, apiGet, apiPost } from './client'
import type { Comment, CreateCommentPayload } from '@/types/comment'
import type { LikeStatus, PaginatedData } from '@/types/common'

export function listComments(blogId: number, page = 1, page_size = 100) {
  return apiGet<PaginatedData<Comment>>(`/blogs/${blogId}/comments`, {
    params: { page, page_size },
  })
}

export function createComment(blogId: number, payload: CreateCommentPayload) {
  return apiPost<Comment>(`/blogs/${blogId}/comments`, payload)
}

export function deleteComment(id: number) {
  return apiDelete<null>(`/comments/${id}`)
}

export function toggleBlogLike(id: number) {
  return apiPost<LikeStatus>(`/blogs/${id}/like`)
}

export function toggleCommentLike(id: number) {
  return apiPost<LikeStatus>(`/comments/${id}/like`)
}

export function getBlogLikeStatus(id: number) {
  return apiGet<LikeStatus>(`/blogs/${id}/like/status`)
}

export function getCommentLikeStatus(id: number) {
  return apiGet<LikeStatus>(`/comments/${id}/like/status`)
}

export function listAllComments(page = 1, page_size = 20) {
  return apiGet<PaginatedData<Comment>>('/comments', {
    params: { page, page_size },
  })
}
