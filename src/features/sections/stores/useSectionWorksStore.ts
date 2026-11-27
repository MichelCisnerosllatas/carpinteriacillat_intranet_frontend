// Datos de la pestaña "Trabajos" del detalle de sección (Galería y Restauración), guardados en
// memoria para que al cambiar de pestaña y volver NO se vuelva a mostrar el indicador de carga:
//   - Primera vez: se muestra la carga (no hay nada que enseñar todavía).
//   - Al volver: se muestran al instante los datos guardados y se pide la versión nueva por
//     detrás, en silencio. Si ese refresco falla, se mantienen los datos y se avisa con un toast.
// Mismo criterio que los demás stores de lista del intranet (hasLoaded / isFetching).

import { create } from 'zustand'
import { toastError } from '@/shared/lib/toast'
import { webWorksService, type WebWorkApiItem } from '@/features/web-works'
import { typeworksService } from '@/features/typeworks'

/** Lista de una sección (modo 'manage', ej. Restauración). */
export type SectionWorksList = { works: WebWorkApiItem[]; total: number }

/** Resumen de la Galería (modo 'summary'). */
export type SectionWorksTypeCount = { key: string; name: string; total: number; visible: number }
export type SectionWorksSummaryData = { total: number; visible: number; byType: SectionWorksTypeCount[] }

/** Clave de la lista: el typework_key que muestra la sección, o 'all' (todos los tipos). */
const listKey = (typeworkKey: string | null) => typeworkKey ?? 'all'

type State = {
  /** Listas ya cargadas, por clave (ver listKey). */
  lists: Record<string, SectionWorksList>
  /** Clave → se está pidiendo ahora. */
  listFetching: Record<string, boolean>
  /** Clave → falló la PRIMERA carga (sin datos que mostrar). */
  listError: Record<string, boolean>

  summary: SectionWorksSummaryData | null
  summaryFetching: boolean
  summaryError: boolean
}

type Action = {
  /** Pide la lista de trabajos de esa sección (con fotos y pares: include=media). */
  loadList: (typeworkKey: string | null) => Promise<void>
  /** Pide el resumen de la Galería (total, visibles, por tipo). */
  loadSummary: () => Promise<void>
}

/** Cuántos trabajos cumplen el filtro (se pide 1 por página: alcanza con `meta.total`). */
async function countWorks(filters: { state?: number; typework_key?: string }): Promise<number> {
  const res = await webWorksService.getList({ page: 1, per_page: 1, ...filters })
  if (!res.success) throw new Error(res.message)
  return res.meta?.total ?? res.data.length
}

export const useSectionWorksStore = create<State & Action>((set, get) => ({
  lists: {},
  listFetching: {},
  listError: {},
  summary: null,
  summaryFetching: false,
  summaryError: false,

  loadList: async (typeworkKey) => {
    const key = listKey(typeworkKey)
    set((s) => ({ listFetching: { ...s.listFetching, [key]: true }, listError: { ...s.listError, [key]: false } }))
    try {
      const res = await webWorksService.getMediaList({ typework_key: typeworkKey ?? undefined })
      if (!res.success) throw new Error(res.message)
      set((s) => ({ lists: { ...s.lists, [key]: { works: res.data, total: res.meta?.total ?? res.data.length } } }))
    } catch (error: any) {
      // Con datos ya mostrados: se quedan y se avisa. Sin datos: pantalla de error.
      if (get().lists[key]) toastError('No se pudo actualizar la lista', error?.response?.data?.message ?? 'Se muestran los datos anteriores.')
      else set((s) => ({ listError: { ...s.listError, [key]: true } }))
    } finally {
      set((s) => ({ listFetching: { ...s.listFetching, [key]: false } }))
    }
  },

  loadSummary: async () => {
    set({ summaryFetching: true, summaryError: false })
    try {
      const types = await typeworksService.getForSelect()
      const [total, visible, byType] = await Promise.all([
        countWorks({}),
        countWorks({ state: 1 }),
        Promise.all((types.success ? types.data : []).map(async (t) => ({
          key: t.typework_key,
          name: t.typework_name,
          total: await countWorks({ typework_key: t.typework_key }),
          visible: await countWorks({ typework_key: t.typework_key, state: 1 }),
        }))),
      ])
      set({ summary: { total, visible, byType } })
    } catch (error: any) {
      if (get().summary) toastError('No se pudo actualizar el resumen', error?.response?.data?.message ?? 'Se muestran los datos anteriores.')
      else set({ summaryError: true })
    } finally {
      set({ summaryFetching: false })
    }
  },
}))
