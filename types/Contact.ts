export interface Contact {
  id: string
  leadId: string
  firstName: string
  lastName?: string
  email?: string
  phone?: string
  company?: string
  position?: string
  createdAt: string
  updatedAt: string
}

export interface ContactCreateInput {
  leadId: string
  firstName: string
  lastName?: string
  email?: string
  phone?: string
  company?: string
  position?: string
}

export interface ContactUpdatePayload {
  leadId?: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  company?: string
  position?: string
}
