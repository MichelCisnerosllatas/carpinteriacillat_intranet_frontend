import { create } from 'zustand'
import { todayLocal } from '../lib/sale-pos/calculate'
import type { CartLine, PaymentMode, PosClient, ProductToAdd } from '../lib/sale-pos/types'
import type { Sale } from '../data/schema'
import type { ProformaSaleDraftDto } from '@/features/proformas'

/**
 * TODO el borrador de "Realizar venta" vive en este único store: cliente, comprobante, carrito y
 * pago. Nada se guarda en el backend hasta que se pulsa "Emitir venta" (una sola petición
 * POST /sales/full). Así se evita el flujo viejo de 3 etapas con stores de "pendientes".
 */
type State = {
  /** Id de la venta que se edita (null al crear). */
  saleId: number | null
  client: PosClient | null
  /** true cuando el usuario eligió explícitamente "Cliente varios" (client_id null). */
  isGenericClient: boolean
  documentTypeId: number | null
  issueDate: string
  currency: string
  observation: string
  /** Proforma de la que se importó el carrito — se manda como proforma_id al crear. */
  proforma: { id: number; code: string } | null
  lines: CartLine[]
  paymentMode: PaymentMode
  /** Solo se usa en "Adelanto" — en "Completo" el monto siempre es el total. */
  paymentAmount: number
  paymentMethod: string | null
  /** Vendedor elegido (solo con `sales.view_all`). null = el usuario actual (lo decide el hook). */
  sellerId: number | null
}

type Action = {
  setClient: (client: PosClient | null) => void
  setGenericClient: () => void
  setDocumentTypeId: (id: number) => void
  setIssueDate: (date: string) => void
  setCurrency: (currency: string) => void
  setObservation: (text: string) => void
  /** Agrega un producto con cantidad 1; si ya está en el carrito, le suma 1. Devuelve la key. */
  addProduct: (product: ProductToAdd) => string
  /** Agrega una línea sin producto del catálogo. Devuelve la key para enfocarla. */
  addFreeLine: () => string
  updateLine: (key: string, patch: Partial<Omit<CartLine, 'key'>>) => void
  removeLine: (key: string) => void
  setPaymentMode: (mode: PaymentMode) => void
  setPaymentAmount: (amount: number) => void
  setPaymentMethod: (method: string) => void
  setSellerId: (id: number | null) => void
  loadFromDraft: (draft: ProformaSaleDraftDto) => void
  clearProforma: () => void
  loadFromSale: (sale: Sale) => void
  reset: () => void
}

// Contador simple para las keys locales — no hace falta nada más sofisticado.
let keyCounter = 0
const newKey = () => `line-${Date.now()}-${keyCounter++}`

const initialState = (): State => ({
  saleId: null,
  client: null,
  isGenericClient: false,
  documentTypeId: null,
  issueDate: todayLocal(),
  currency: 'PEN',
  observation: '',
  proforma: null,
  lines: [],
  paymentMode: 'full',
  paymentAmount: 0,
  // Efectivo por defecto: es el caso más común en caja y ahorra un paso.
  paymentMethod: 'EFECTIVO',
  sellerId: null,
})

export const useSalePosStore = create<State & Action>((set, get) => ({
  ...initialState(),

  setClient: (client) => set({ client, isGenericClient: false }),
  setGenericClient: () => set({ client: null, isGenericClient: true }),
  setDocumentTypeId: (id) => set({ documentTypeId: id }),
  setIssueDate: (date) => set({ issueDate: date }),
  setCurrency: (currency) => set({ currency }),
  setObservation: (text) => set({ observation: text }),

  addProduct: (product) => {
    const existing = get().lines.find((l) => l.productServiceId === product.id)
    if (existing) {
      set({
        lines: get().lines.map((l) =>
          l.key === existing.key ? { ...l, quantity: l.quantity + 1 } : l
        ),
      })
      return existing.key
    }
    const line: CartLine = {
      key: newKey(),
      detailId: null,
      productServiceId: product.id,
      description: product.name,
      unit: product.unit ?? '',
      quantity: 1,
      unitPrice: Number(product.default_price) || 0,
      discount: 0,
    }
    set({ lines: [...get().lines, line] })
    return line.key
  },

  addFreeLine: () => {
    const line: CartLine = {
      key: newKey(),
      detailId: null,
      productServiceId: null,
      description: '',
      unit: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
    }
    set({ lines: [...get().lines, line] })
    return line.key
  },

  updateLine: (key, patch) =>
    set({ lines: get().lines.map((l) => (l.key === key ? { ...l, ...patch } : l)) }),

  removeLine: (key) => set({ lines: get().lines.filter((l) => l.key !== key) }),

  setPaymentMode: (mode) => set({ paymentMode: mode }),
  setPaymentAmount: (amount) => set({ paymentAmount: amount }),
  setPaymentMethod: (method) => set({ paymentMethod: method }),
  setSellerId: (id) => set({ sellerId: id }),

  // Reemplaza cliente, moneda y líneas con lo que trae la proforma. El IGV NO se copia: se
  // recalcula con la configuración vigente (contrato §6).
  loadFromDraft: (draft) =>
    set({
      proforma: { id: draft.proforma_id, code: draft.proforma_code },
      client: draft.client
        ? {
            id: draft.client.id,
            name: draft.client.business_name,
            document: draft.client.document_number,
          }
        : null,
      isGenericClient: false,
      currency: draft.currency === 'USD' ? 'USD' : 'PEN',
      lines: draft.details.map((d) => ({
        key: newKey(),
        detailId: null,
        productServiceId: d.product_service_id,
        description: d.description,
        unit: d.unit ?? '',
        quantity: Number(d.quantity) || 1,
        unitPrice: Number(d.unit_price) || 0,
        discount: Number(d.discount) || 0,
      })),
    }),

  clearProforma: () => set({ proforma: null }),

  // Edición: precarga una venta GUARDADA. El pago no se toca acá — en edición se usa la sección
  // de pagos existente (sale-payments).
  loadFromSale: (sale) =>
    set({
      ...initialState(),
      saleId: sale.id,
      // Al editar se conserva el vendedor original de la venta.
      sellerId: sale.userId,
      client: sale.clientId
        ? { id: sale.clientId, name: sale.clientBusinessName ?? 'Cliente', document: null }
        : null,
      isGenericClient: sale.clientId == null,
      documentTypeId: sale.saleDocumentTypeId,
      issueDate: sale.issueDate?.slice(0, 10) ?? todayLocal(),
      currency: sale.currency,
      observation: sale.observation ?? '',
      proforma: sale.proformaId ? { id: sale.proformaId, code: sale.proformaCode ?? '' } : null,
      lines: sale.details.map((d) => ({
        key: newKey(),
        detailId: d.id,
        productServiceId: d.productServiceId,
        description: d.description,
        unit: d.unit ?? '',
        quantity: d.quantity,
        unitPrice: d.unitPrice,
        discount: d.discount,
      })),
    }),

  reset: () => set(initialState()),
}))
