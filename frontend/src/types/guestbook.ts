export interface GuestbookMessage {
  id: number;
  user_id?: number;
  nickname: string;
  content: string;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}
