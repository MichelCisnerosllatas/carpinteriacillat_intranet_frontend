import { create } from 'zustand'
import { saleGoalsService } from '../services/sale-goals.service'
import type { SaleGoalApiItem } from '../model/salegoal.dto'

/** Montos por mes: índice 0 = enero … 11 = diciembre. Se guardan como texto porque son lo que
 * el usuario escribe en los inputs (vacío = sin meta). */
type MonthAmounts = string[]

type State = {
  year: number
  currency: string
  amounts: MonthAmounts
  isLoading: boolean
  isSaving: boolean
  error: string | null
  fieldErrors: Record<string, string[]> | null
}

type Action = {
  load: (year: number, currency: string) => Promise<void>
  setAmount: (monthIndex: number, value: string) => void
  save: () => Promise<boolean>
}

const emptyAmounts = (): MonthAmounts => Array.from({ length: 12 }, () => '')

// El backend solo manda los meses con meta: se ubican en su posición y el resto queda vacío.
const toMonthAmounts = (items: SaleGoalApiItem[]): MonthAmounts => {
  const amounts = emptyAmounts()
  items.forEach((g) => {
    if (g.month >= 1 && g.month <= 12) amounts[g.month - 1] = String(Number(g.amount))
  })
  return amounts
}

export const useSaleGoalStore = create<State & Action>((set, get) => ({
  year: new Date().getFullYear(),
  currency: 'PEN',
  amounts: emptyAmounts(),
  isLoading: false,
  isSaving: false,
  error: null,
  fieldErrors: null,

  load: async (year, currency) => {
    set({ year, currency, isLoading: true, error: null, fieldErrors: null })
    try {
      const res = await saleGoalsService.getList({ year, currency })
      if (!res.success) throw new Error(res.message)
      set({ isLoading: false, amounts: toMonthAmounts(res.data) })
    } catch (error: any) {
      set({
        isLoading: false,
        amounts: emptyAmounts(),
        error: error?.response?.data?.message ?? error?.message ?? 'No se pudieron cargar las metas.',
      })
    }
  },

  setAmount: (monthIndex, value) =>
    set({ amounts: get().amounts.map((a, i) => (i === monthIndex ? value : a)) }),

  save: async () => {
    const { year, currency, amounts } = get()
    set({ isSaving: true, error: null, fieldErrors: null })
    try {
      // Se mandan los 12 meses: vacío o 0 = el backend borra la meta de ese mes.
      const res = await saleGoalsService.put({
        year,
        currency,
        goals: amounts.map((a, i) => ({ month: i + 1, amount: a.trim() === '' ? null : Number(a) })),
      })
      if (!res.success) {
        set({ isSaving: false, error: res.message, fieldErrors: res.errors ?? null })
        return false
      }
      set({ isSaving: false, amounts: toMonthAmounts(res.data) })
      return true
    } catch (error: any) {
      set({
        isSaving: false,
        error: error?.response?.data?.message ?? error?.message ?? 'No se pudieron guardar las metas.',
        fieldErrors: error?.response?.data?.errors ?? null,
      })
      return false
    }
  },
}))
