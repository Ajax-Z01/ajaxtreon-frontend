export interface Contact {
  id: string
  leadId: string
  name: string
  email?: string
  phone?: string
  position?: string
  createdAt: string
  updatedAt: string
}

export interface ContactCreateInput {
  leadId: string
  name: string
  email?: string
  phone?: string
  position?: string
}

export interface ContactUpdatePayload {
  leadId?: string
  name?: string
  email?: string
  phone?: string
  position?: string
}