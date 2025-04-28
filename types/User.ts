export interface User {
  uid: string;
  email: string;
  displayName?: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}
  
export interface AuthUser {
  email: string;
  uid: string;
  role: 'admin' | 'user';
}
  