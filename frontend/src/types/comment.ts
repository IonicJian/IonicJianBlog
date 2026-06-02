export interface Comment {
  id: number;
  blog_id: number;
  user_id: number;
  parent_id?: number;
  content: string;
  anchor_start?: string;
  anchor_end?: string;
  anchor_text?: string;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  author?: {
    id: number;
    username: string;
    display_name: string;
    avatar_url: string;
  };
  like_count: number;
  liked_by_me: boolean;
  replies?: Comment[];
}
