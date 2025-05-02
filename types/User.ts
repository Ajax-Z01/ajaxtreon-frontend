export type User = {
  id: string
  name: string
  email: string
  role: 'admin' | 'user'
}
  
export interface AuthUser {
  email: string;
  uid: string;
  role: 'admin' | 'user';
}
  