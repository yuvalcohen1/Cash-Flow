export interface User {
  id: string; // UUID
  name: string;
  email: string;
  password_hash: string;
  created_at: Date;
}