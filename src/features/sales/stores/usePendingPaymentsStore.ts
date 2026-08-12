// src/features/sales/stores/usePendingPaymentsStore.ts
import { create } from 'zustand'

/** Un pago/adelanto agregado ANTES de que la venta tenga id — vive solo en memoria hasta que la
 * cabecera se registra. Mismo patrón que `PendingCartItem` (usePendingCartItemsStore) pero para
 * pagos: el usuario no necesita saber que "hay que guardar la venta primero" — puede cargar el
 * adelanto ya mismo, y se sube solo apenas la venta obtiene su id real (ver
 * `uploadPendingPayments` en lib/sale-form/submit-sale-header.ts). */
export type PendingPayment = {
  tempId: string
  amount: number
  paymentDate: string
  paymentMethod: string
  observation: string
}

let nextTempId = 0

type State = {
  pendingPayments: PendingPayment[]
  /** tempId del pago que se está subiendo al backend ahora mismo (o null si ninguno). */
  uploadingTempId: string | null
}

type Action = {
  addPendingPayment: (payment: Omit<PendingPayment, 'tempId'>) => void
  updatePendingPayment: (tempId: string, changes: Partial<Omit<PendingPayment, 'tempId'>>) => void
  removePendingPayment: (tempId: string) => void
  setUploadingTempId: (tempId: string | null) => void
  /** Vacía la lista — se llama al cerrar/cancelar el formulario de creación. */
  clearPendingPayments: () => void
}

export const usePendingPaymentsStore = create<State & Action>((set) => ({
  pendingPayments: [],
  uploadingTempId: null,

  addPendingPayment: (payment) => set((state) => ({
    pendingPayments: [...state.pendingPayments, { ...payment, tempId: `pending-payment-${++nextTempId}` }],
  })),

  updatePendingPayment: (tempId, changes) => set((state) => ({
    pendingPayments: state.pendingPayments.map((p) => (p.tempId === tempId ? { ...p, ...changes } : p)),
  })),

  removePendingPayment: (tempId) => set((state) => ({
    pendingPayments: state.pendingPayments.filter((p) => p.tempId !== tempId),
  })),

  setUploadingTempId: (tempId) => set({ uploadingTempId: tempId }),

  clearPendingPayments: () => set({ pendingPayments: [], uploadingTempId: null }),
}))
