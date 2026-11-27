import { create } from 'zustand'
import { proformasService } from '../services/proformas.service'

/** Fila liviana del modal "Importar proforma" de ventas — solo lo que se muestra en la tabla. */
export type AcceptedProformaOption = {
  id: number
  code: string
  clientName: string
  issueDate: string
  total: number
  currency: string
}

type State = {
  options: AcceptedProformaOption[]
  isLoading: boolean
  isError: boolean
}

type Action = {
  load: () => Promise<void>
}

/**
 * Proformas ACEPTADAS que todavía no tienen venta. A diferencia de los otros *SelectStore, NO
 * cachea: se vuelve a pedir cada vez que se abre el modal, porque una proforma deja de ser
 * convertible apenas se registra su venta (y eso pasa justo en esta misma pantalla).
 */
export const useAcceptedProformaSelectStore = create<State & Action>((set, get) => ({
  options: [],
  isLoading: false,
  isError: false,

  load: async () => {
    if (get().isLoading) return
    set({ isLoading: true, isError: false })
    try {
      const res = await proformasService.getAcceptedForSale()
      if (!res.success) {
        set({ isLoading: false, isError: true })
        return
      }
      set({
        isLoading: false,
        options: res.data
          // Por si el backend todavía no filtra las que ya tienen venta asociada.
          .filter((p) => !p.sale_id)
          .map((p) => ({
            id: p.id,
            code: p.code,
            clientName: p.client_name ?? 'Sin cliente',
            issueDate: p.issue_date?.slice(0, 10) ?? '',
            total: Number(p.total),
            currency: p.currency,
          })),
      })
    } catch {
      set({ isLoading: false, isError: true })
    }
  },
}))
