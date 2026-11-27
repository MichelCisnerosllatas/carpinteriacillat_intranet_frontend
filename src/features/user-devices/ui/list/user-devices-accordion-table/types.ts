import type { UserDevice } from '../../../data/schema'

// ─── Grupo por usuario ────────────────────────────────────────────────────────

export type UserGroup = {
  userId: number
  userName: string
  userEmail: string
  userRole: string
  devices: UserDevice[]
}
