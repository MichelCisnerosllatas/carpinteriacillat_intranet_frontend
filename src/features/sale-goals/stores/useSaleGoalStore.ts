import { create } from 'zustand'
import { saleGoalsService } from '../services/sale-goals.service'
import type { SaleGoalApiItem } from '../model/salegoal.dto'

/** Montos por mes: índice 0 = enero … 11 = diciembre. Se guardan como texto porque son lo que
 * el usuario escribe en los inputs (vacío = sin meta). */
export type MonthAmounts = string[]

/** Qué meta se está guardando: 'general' o el id del vendedor. */
type SavingKey = 'general' | number | null

type State = {
  year: number
  currency: string
  /** Meta general del negocio (user_id = null). */
  general: MonthAmounts
  /** Metas por vendedor: { [userId]: 12 montos }. Solo están los vendedores que tienen alguna
   * meta guardada o que se empezaron a editar en pantalla. */
  bySeller: Record<number, MonthAmounts>
  /** Nombre de cada vendedor que vino con metas (para listarlos sin esperar a /sellers). */
  sellerNames: Record<number, string>
  isLoading: boolean
  savingKey: SavingKey
  error: string | null
  fieldErrors: Record<string, string[]> | null
}

type Action = {
  load: (year: number, currency: string) => Promise<void>
  setGeneralAmount: (monthIndex: number, value: string) => void
  setSellerAmount: (userId: number, monthIndex: number, value: string) => void
  /** Guarda el año de una meta: null = la general, número = la de ese vendedor. */
  save: (userId: number | null) => Promise<boolean>
}

export const emptyAmounts = (): MonthAmounts => Array.from({ length: 12 }, () => '')

// El backend solo manda los meses con meta: se ubican en su posición y el resto queda vacío.
const toMonthAmounts = (items: SaleGoalApiItem[]): MonthAmounts => {
  const amounts = emptyAmounts()
  items.forEach((g) => {
    if (g.month >= 1 && g.month <= 12) amounts[g.month - 1] = String(Number(g.amount))
  })
  return amounts
}

/** Separa la respuesta (todas las metas del año) en la general y una por vendedor. */
const splitGoals = (items: SaleGoalApiItem[]) => {
  const bySeller: Record<number, MonthAmounts> = {}
  const sellerNames: Record<number, string> = {}
  const sellerIds = [...new Set(items.filter((g) => g.user_id != null).map((g) => g.user_id as number))]
  sellerIds.forEach((id) => {
    const own = items.filter((g) => g.user_id === id)
    bySeller[id] = toMonthAmounts(own)
    sellerNames[id] = own[0]?.seller_name ?? `Vendedor #${id}`
  })
  return { general: toMonthAmounts(items.filter((g) => g.user_id == null)), bySeller, sellerNames }
}

export const useSaleGoalStore = create<State & Action>((set, get) => ({
  year: new Date().getFullYear(),
  currency: 'PEN',
  general: emptyAmounts(),
  bySeller: {},
  sellerNames: {},
  isLoading: false,
  savingKey: null,
  error: null,
  fieldErrors: null,

  load: async (year, currency) => {
    set({ year, currency, isLoading: true, error: null, fieldErrors: null })
    try {
      // user_id=all: generales + por vendedor en una sola llamada.
      const res = await saleGoalsService.getList({ year, currency, user_id: 'all' })
      if (!res.success) throw new Error(res.message)
      set({ isLoading: false, ...splitGoals(res.data) })
    } catch (error: any) {
      set({
        isLoading: false,
        general: emptyAmounts(),
        bySeller: {},
        sellerNames: {},
        error: error?.response?.data?.message ?? error?.message ?? 'No se pudieron cargar las metas.',
      })
    }
  },

  setGeneralAmount: (monthIndex, value) =>
    set({ general: get().general.map((a, i) => (i === monthIndex ? value : a)) }),

  setSellerAmount: (userId, monthIndex, value) => {
    const current = get().bySeller[userId] ?? emptyAmounts()
    set({
      bySeller: {
        ...get().bySeller,
        [userId]: current.map((a, i) => (i === monthIndex ? value : a)),
      },
    })
  },

  save: async (userId) => {
    const { year, currency, general, bySeller } = get()
    const amounts = userId == null ? general : (bySeller[userId] ?? emptyAmounts())
    set({ savingKey: userId ?? 'general', error: null, fieldErrors: null })
    try {
      // Se mandan los 12 meses: vacío o 0 = el backend borra la meta de ese mes.
      const res = await saleGoalsService.put({
        year,
        currency,
        user_id: userId,
        goals: amounts.map((a, i) => ({ month: i + 1, amount: a.trim() === '' ? null : Number(a) })),
      })
      if (!res.success) {
        set({ savingKey: null, error: res.message, fieldErrors: res.errors ?? null })
        return false
      }
      // La respuesta trae la lista del año de esa meta: se actualiza solo esa parte.
      const own = res.data.filter((g) => (g.user_id ?? null) === userId)
      if (userId == null) set({ general: toMonthAmounts(own) })
      else set({ bySeller: { ...get().bySeller, [userId]: toMonthAmounts(own) } })
      set({ savingKey: null })
      return true
    } catch (error: any) {
      set({
        savingKey: null,
        error: error?.response?.data?.message ?? error?.message ?? 'No se pudieron guardar las metas.',
        fieldErrors: error?.response?.data?.errors ?? null,
      })
      return false
    }
  },
}))
