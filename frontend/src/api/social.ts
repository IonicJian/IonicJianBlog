import { apiDelete, apiGet, apiPost, apiPut } from './client'
import type { PaginatedData } from '@/types/common'
import type {
  FriendLink,
  FriendLinkForm,
  GuestbookForm,
  GuestbookMessage,
} from '@/types/social'
import type { TrendingRepo, TrendingResult } from '@/types/trending'

export function listGuestbook(page = 1, page_size = 10) {
  return apiGet<PaginatedData<GuestbookMessage>>('/guestbook', {
    params: { page, page_size },
  })
}

export function createGuestbook(form: GuestbookForm) {
  return apiPost<GuestbookMessage>('/guestbook', form)
}

export function deleteGuestbook(id: number) {
  return apiDelete<null>(`/guestbook/${id}`)
}

export function listFriendLinks() {
  return apiGet<FriendLink[]>('/friend-links').then((l) => l || [])
}

export function createFriendLink(form: FriendLinkForm) {
  return apiPost<FriendLink>('/friend-links', form)
}

export function updateFriendLink(id: number, form: FriendLinkForm) {
  return apiPut<FriendLink>(`/friend-links/${id}`, form)
}

export function deleteFriendLink(id: number) {
  return apiDelete<null>(`/friend-links/${id}`)
}

export function getTrending() {
  return apiGet<TrendingResult>('/trending/github')
}
