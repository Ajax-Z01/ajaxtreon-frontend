export type ActivityType =
  | 'call'
  | 'meeting'
  | 'email'
  | 'task'
  | 'follow-up'
  | 'note'
  | 'reminder'

export type ActivityStatus = 'pending' | 'completed' | 'cancelled'

export interface Activity {
  id: string
  title: string
  description?: string
  type: ActivityType
  status: ActivityStatus
  relatedTo: {
    type: 'lead' | 'contact' | 'opportunity'
    id: string
  }
  assignedTo?: string
  dueDate?: string
  completedAt?: string
  createdAt: string
  updatedAt: string
}

export interface ActivityCreateInput {
  title: string
  description?: string
  type: ActivityType
  status: ActivityStatus
  relatedTo: {
    type: 'lead' | 'contact' | 'opportunity'
    id: string
  }
  assignedTo?: string
  dueDate?: string
  completedAt?: string
}

export interface ActivityUpdatePayload {
  title?: string
  description?: string
  type?: ActivityType
  status?: ActivityStatus
  relatedTo?: {
    type: 'lead' | 'contact' | 'opportunity'
    id: string
  }
  assignedTo?: string
  dueDate?: string
  completedAt?: string
}

export type ActivityForEdit = Omit<Activity, 'relatedTo' | 'assignedTo'> & {
  relatedTo: { type: 'lead' | 'contact' | 'opportunity'; name: string }
  assignedTo?: string
}