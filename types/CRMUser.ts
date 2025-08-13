export type CRMUserRole = 'admin' | 'staff' | 'manager' | 'sales' | 'marketing' | 'support'

export interface CRMUser {
  id: string
  email: string
  name: string
  phone?: string
  address?: string
  role: CRMUserRole
  isActive: boolean
  profilePictureUrl?: string
  department?: string
  assignedLeads?: string[]
  notes?: string
  permissions?: string[]
  createdAt: string
  updatedAt?: string
  lastLoginAt?: string
  lastActivityAt?: string
}

export interface CRMUserCreateInput {
  email: string
  name: string
  phone?: string
  address?: string
  role: CRMUserRole
  isActive?: boolean
  profilePictureUrl?: string
  department?: string
  assignedLeads?: string[]
  notes?: string
  permissions?: string[]
}

export interface CRMUserUpdatePayload {
  email?: string
  name?: string
  phone?: string
  address?: string
  role?: CRMUserRole
  isActive?: boolean
  profilePictureUrl?: string
  department?: string
  assignedLeads?: string[]
  notes?: string
  permissions?: string[]
}