import { create } from 'zustand'

export type Notification = {
  id: string
  title: string
  description: string
  time: string
  read: boolean
  type: 'info' | 'success' | 'warning' | 'error'
}

type NotificationState = {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
}

// Sample notifications — replace with real API calls
const SAMPLE_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'New user registered',
    description: 'John Doe just created an account.',
    time: '2 min ago',
    read: false,
    type: 'info',
  },
  {
    id: '2',
    title: 'Deployment successful',
    description: 'Production build v2.3.1 deployed.',
    time: '1 hour ago',
    read: false,
    type: 'success',
  },
  {
    id: '3',
    title: 'Server warning',
    description: 'CPU usage above 80% on node-3.',
    time: '3 hours ago',
    read: true,
    type: 'warning',
  },
]

export const useNotificationStore = create<NotificationState>()((set, get) => ({
  notifications: SAMPLE_NOTIFICATIONS,
  unreadCount: SAMPLE_NOTIFICATIONS.filter((n) => !n.read).length,

  markAsRead: (id) => {
    set((state) => {
      const notifications = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
      return { notifications, unreadCount: notifications.filter((n) => !n.read).length }
    })
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }))
  },

  removeNotification: (id) => {
    set((state) => {
      const notifications = state.notifications.filter((n) => n.id !== id)
      return { notifications, unreadCount: notifications.filter((n) => !n.read).length }
    })
  },
}))
