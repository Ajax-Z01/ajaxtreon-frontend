export type OpportunityStatus = 'open' | 'won' | 'lost'

export interface Opportunity {
  id: string
  leadId: string
  title: string
  value: number
  status: OpportunityStatus
  closeDate?: string
  createdAt: string
  updatedAt: string
}

export interface OpportunityCreateInput {
  leadId: string
  title: string
  value: number
  status?: OpportunityStatus
  closeDate?: string
}

export interface OpportunityUpdatePayload {
  leadId?: string
  title?: string
  value?: number
  status?: OpportunityStatus
  closeDate?: string
}