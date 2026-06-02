export interface Blog {
  id: number;
  user_id: number;
  title: string;
  slug: string;
  content: string;
  content_html: string;
  excerpt: string;
  cover_image: string;
  status: 'draft' | 'published';
  view_count: number;
  is_top: boolean;
  created_at: string;
  updated_at: string;
  author?: import('./user').User;
  like_count: number;
  liked_by_me: boolean;
  tags?: Tag[];
}

export interface BlogListItem {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  cover_image: string;
  status: string;
  view_count: number;
  is_top: boolean;
  created_at: string;
  updated_at: string;
  like_count: number;
  liked_by_me: boolean;
  tags?: Tag[];
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  color: string;
  post_count?: number;
  created_at?: string;
}
