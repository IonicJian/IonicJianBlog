import { apiGet } from './client'
import type { User } from '@/types/user'

export function getSiteOwner() {
  return apiGet<User>('/site/owner')
}
