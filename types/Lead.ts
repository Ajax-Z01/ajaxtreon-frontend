export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'lost' | 'converted'

export interface Lead {
  id: string
  name: string
  email?: string
  phone?: string
  company?: string
  status: LeadStatus
  assignedTo?: string
  source?: string
  notes?: string
  createdAt: string
  updatedAt: string
  lastContactedAt?: string
  expectedValue?: number
  tags?: string[]
}

export interface LeadCreateInput {
  name: string
  email?: string
  phone?: string
  company?: string
  status?: LeadStatus
  assignedTo?: string
  source?: string
  notes?: string
  lastContactedAt?: string
  expectedValue?: number
  tags?: string[]
}

export interface LeadUpdatePayload {
  name?: string
  email?: string
  phone?: string
  company?: string
  status?: LeadStatus
  assignedTo?: string
  source?: string
  notes?: string
  lastContactedAt?: string
  expectedValue?: number
  tags?: string[]
}