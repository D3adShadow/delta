export interface User {
  id: string;
  full_name: string;
  points: number;
  is_instructor?: boolean;
  created_at?: string;
}