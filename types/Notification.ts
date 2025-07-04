export type NotificationType = 'info' | 'warning' | 'success' | 'error'

export interface Notification {
  id: string
  title: string
  message: string
  type: NotificationType
  userId?: string | null
  read: boolean
  createdAt: string
}
