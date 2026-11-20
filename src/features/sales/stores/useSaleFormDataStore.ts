import { create } from 'zustand'
import { salesService } from '../services/sales.service'
import type { SaleFormDataDocumentTypeDto, SaleFormDataOptionDto } from '../model/saleformdata.dto'

type State = {
  documentTypes: SaleFormDataDocumentTypeDto[]
  igvEnabled: boolean
  igvRate: number
  currencies: SaleFormDataOptionDto[]
  hasLoaded: boolean
  isLoading: boolean
  isError: boolean
  message: string | null
}

type Action = {
  /** force = true vuelve a pedirlo aunque ya esté cargado (ej. tras cambiar la config. de IGV). */
  load: (force?: boolean) => Promise<void>
}

// Si el backend no manda monedas, se usan estas dos (las únicas permitidas, contrato §2).
const DEFAULT_CURRENCIES: SaleFormDataOptionDto[] = [
  { value: 'PEN', label: 'Soles (S/)' },
  { value: 'USD', label: 'Dólares ($)' },
]

/**
 * Datos de arranque de "Realizar venta" (GET /sales/form-data). Se pide al entrar a la
 * pantalla: el IGV puede haber cambiado en Configuración de Ventas, así que siempre se refresca
 * con `load(true)` al montar, pero el resto del tiempo se reutiliza lo ya cargado.
 */
export const useSaleFormDataStore = create<State & Action>((set, get) => ({
  documentTypes: [],
  igvEnabled: true,
  igvRate: 18,
  currencies: DEFAULT_CURRENCIES,
  hasLoaded: false,
  isLoading: false,
  isError: false,
  message: null,

  load: async (force = false) => {
    if (get().isLoading) return
    if (get().hasLoaded && !force) return
    set({ isLoading: true, isError: false, message: null })
    try {
      const res = await salesService.getFormData()
      if (!res.success) throw new Error(res.message)
      set({
        documentTypes: res.data.document_types ?? [],
        igvEnabled: Boolean(res.data.igv?.enabled),
        igvRate: Number(res.data.igv?.rate ?? 0),
        currencies: res.data.currencies?.length ? res.data.currencies : DEFAULT_CURRENCIES,
        hasLoaded: true,
        isLoading: false,
      })
    } catch (error: any) {
      set({
        isLoading: false,
        isError: true,
        message:
          error?.response?.data?.message ?? error?.message ?? 'No se pudieron cargar los datos.',
      })
    }
  },
}))
