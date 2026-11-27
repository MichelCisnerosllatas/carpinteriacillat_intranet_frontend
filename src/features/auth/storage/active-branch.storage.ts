// src/features/auth/storage/active-branch.storage.ts
import type { AuthSession } from '@/features/auth/model/session.type'

/**
 * Sucursal ACTIVA de la sesión (donde se registran ventas y proformas).
 *
 * Se guarda en localStorage y `apiClient` la envía en cada petición con el header
 * `X-Branch-Id`. El backend la valida (BranchScope::resolveForCreate) y, si no sirve, usa la
 * sucursal por defecto del usuario.
 */
const KEY = 'active_branch_id'

export const ActiveBranchStorage = {
  get(): number | null {
    if (typeof window === 'undefined') return null
    try {
      const raw = window.localStorage.getItem(KEY)
      const id = raw ? Number(raw) : NaN
      return Number.isFinite(id) && id > 0 ? id : null
    } catch {
      return null
    }
  },

  set(id: number | null) {
    if (typeof window === 'undefined') return
    try {
      if (id && id > 0) window.localStorage.setItem(KEY, String(id))
      else window.localStorage.removeItem(KEY)
    } catch {
      // localStorage bloqueado: el backend usará la sucursal por defecto.
    }
  },

  clear() {
    ActiveBranchStorage.set(null)
  },

  /**
   * Ajusta la sucursal guardada a la sesión: si la guardada ya no está entre las sucursales
   * del usuario (`session.user.branches`), vuelve a la por defecto (o la primera).
   * Devuelve la resultante.
   */
  reconcile(session: AuthSession | null | undefined): number | null {
    const branches = session?.user.branches ?? []
    const current = ActiveBranchStorage.get()

    if (current && branches.some((b) => b.id === current)) return current

    // Por defecto: la marcada con is_default; si no, la del filtro; si no, la primera.
    const byFlag = branches.find((b) => b.is_default)?.id ?? null
    const byFilter = session?.branch_filter.default_branch_id ?? null

    let next: number | null = branches[0]?.id ?? null
    if (byFlag) {
      next = byFlag
    } else if (byFilter && branches.some((b) => b.id === byFilter)) {
      next = byFilter
    }

    ActiveBranchStorage.set(next)
    return next
  },
}
