export type UserRole = 'admin' | 'user' | 'staff' | 'manager' | 'customer' | 'supplier' | 'seller';

export interface User {
  id: string
  email: string
  name: string
  phone?: string
  address?: string
  role: UserRole
  isActive: boolean
  profilePictureUrl?: string
  createdAt: string
  updatedAt?: string
  lastLoginAt?: string
}

export interface UserUpdateInput {
  id?: string
  name?: string
  email?: string
  phone?: string
  address?: string
  role?: UserRole
  isActive?: boolean
  profilePictureUrl?: string
}

export interface CreateUserInput extends UserUpdateInput {
  email: string
  name: string
  role: UserRole
  isActive?: boolean
}

export interface AuthUser {
  uid: string
  email: string
  role: UserRole
}
