import { create } from 'zustand'

export type MessageType = 'info' | 'success' | 'warning' | 'error'
export type DownloadStatus = 'running' | 'done' | 'error' | 'cancelled'

export type MessageNotification = {
  id: string
  kind: 'message'
  title: string
  description: string
  time: string
  read: boolean
  type: MessageType
}

/** Una descarga masiva en curso (o terminada) — ver `shared/lib/bulk-download.ts`. Vive en
 * el mismo store que las notificaciones normales para que la campanita del header sea un
 * único centro de avisos, en vez de agregar un botón aparte solo para esto. */
export type DownloadNotification = {
  id: string
  kind: 'download'
  label: string
  route: string
  total: number
  completed: number
  errors: number
  status: DownloadStatus
  time: string
  read: boolean
}

export type Notification = MessageNotification | DownloadNotification

type NotificationState = {
  notifications: Notification[]
  unreadCount: number
  /** Id de la descarga que debe mostrarse ahora mismo como "peek" flotante junto a la
   * campanita (ver `widgets/header/notification-dropdown.tsx`). Vive en el store — no en
   * estado local del componente — porque `<Header>` se remonta en cada navegación (cada
   * page.tsx lo renderiza de nuevo): si esto fuera estado local, cada remount "olvidaría"
   * qué ya mostró y volvería a disparar el peek para descargas viejas. */
  peekId: string | null
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void

  // ── Descargas masivas ──────────────────────────────────────────────────
  startDownload: (params: { label: string; route: string; total: number }) => string
  reportDownloadProgress: (id: string, delta: { completed?: number; errors?: number }) => void
  finishDownload: (id: string, status: Exclude<DownloadStatus, 'running'>) => void
  cancelDownload: (id: string) => void
  isDownloadCancelled: (id: string) => boolean
  dismissPeek: () => void
}

const countUnread = (notifications: Notification[]) => notifications.filter((n) => !n.read).length

let downloadCounter = 0
// Bandera de cancelación fuera del state de Zustand: se consulta en cada iteración del loop
// de descarga (shared/lib/bulk-download.ts) sin necesidad de disparar un re-render por eso.
const cancelFlags = new Map<string, boolean>()

// Temporizador del peek — a nivel de módulo, no de componente ni de store: así sigue
// corriendo aunque el Header (y por tanto NotificationDropdown) se destruya y se vuelva a
// montar durante ese lapso al navegar. Un solo peek a la vez: uno nuevo cancela el anterior.
let peekTimer: ReturnType<typeof setTimeout> | null = null
const PEEK_DURATION_MS = 4000

export const useNotificationStore = create<NotificationState>()((set, get) => ({
  notifications: [],
  unreadCount: 0,
  peekId: null,

  markAsRead: (id) => {
    set((state) => {
      const notifications = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
      return { notifications, unreadCount: countUnread(notifications) }
    })
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }))
  },

  removeNotification: (id) => {
    cancelFlags.delete(id)
    set((state) => {
      const notifications = state.notifications.filter((n) => n.id !== id)
      return { notifications, unreadCount: countUnread(notifications) }
    })
  },

  startDownload: ({ label, route, total }) => {
    const id = `dl_${++downloadCounter}_${Date.now()}`
    cancelFlags.set(id, false)
    set((state) => {
      const notifications: Notification[] = [
        { id, kind: 'download', label, route, total, completed: 0, errors: 0, status: 'running', time: 'ahora', read: false },
        ...state.notifications,
      ]
      return { notifications, unreadCount: countUnread(notifications), peekId: id }
    })

    if (peekTimer) clearTimeout(peekTimer)
    peekTimer = setTimeout(() => {
      // Solo lo limpia si sigue siendo EL peek activo — si mientras tanto arrancó otra
      // descarga (que ya tomó el peek para sí), no le pisa el suyo.
      if (get().peekId === id) set({ peekId: null })
    }, PEEK_DURATION_MS)

    return id
  },

  reportDownloadProgress: (id, delta) => set((state) => ({
    notifications: state.notifications.map((n) =>
      n.kind === 'download' && n.id === id
        ? { ...n, completed: n.completed + (delta.completed ?? 0), errors: n.errors + (delta.errors ?? 0) }
        : n
    ),
  })),

  finishDownload: (id, status) => set((state) => {
    const notifications = state.notifications.map((n) =>
      n.kind === 'download' && n.id === id ? { ...n, status } : n
    )
    return { notifications, unreadCount: countUnread(notifications) }
  }),

  cancelDownload: (id) => cancelFlags.set(id, true),

  isDownloadCancelled: (id) => cancelFlags.get(id) ?? false,

  dismissPeek: () => {
    if (peekTimer) { clearTimeout(peekTimer); peekTimer = null }
    set({ peekId: null })
  },
}))
