export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  sort_order: number;
  parent_id?: number | null;
  children?: Category[];
  created_at: string;
}
