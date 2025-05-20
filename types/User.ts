export type UserRole = 'admin' | 'user' | 'staff' | 'manager'

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role: UserRole;
  isActive: boolean;
  profilePictureUrl?: string;
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string;
}

export interface AuthUser {
  uid: string;
  email: string;
  role: UserRole;
}
