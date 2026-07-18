import { create } from 'zustand'
import { proformaTemplateTextsService } from '../services/proforma-template-texts.service'
import type { ProformaTemplateText } from '../data/schema'
import { DEFAULT_TEMPLATE_TEXTS, TEMPLATE_TEXT_KEYS, type TemplateTextKey } from '../data/data'

export type DraftTextRow = {
  localId: string
  id: number | null
  key: TemplateTextKey
  title: string
  content: string
  visible: boolean
  order: number
  deleted: boolean
}

let localIdSeq = 0
const nextLocalId = () => `text-${++localIdSeq}`

const toDraft = (item: ProformaTemplateText): DraftTextRow => ({
  localId: `db-${item.id}`,
  id: item.id,
  key: item.key as TemplateTextKey,
  title: item.title ?? '',
  content: item.content ?? '',
  visible: item.visible,
  order: item.order,
  deleted: false,
})

type State = {
  rows: DraftTextRow[]
  // Evita que un segundo render con la misma lista de la API pise ediciones que el usuario ya
  // hizo en el borrador (ver template-texts-manager.tsx).
  initializedForTemplateId: number | null
  // Evita volver a poner el texto por defecto si el usuario ya borró todo a propósito.
  seededDefaults: boolean
}

type Action = {
  setFromExisting: (templateId: number, items: ProformaTemplateText[]) => void
  // Plantilla NUEVA (sin templateId todavía): arranca con el redactado estándar de la empresa en
  // vez de una pantalla vacía — el usuario lo edita o lo borra igual que cualquier otra versión.
  seedDefaults: () => void
  addRow: (key: TemplateTextKey) => void
  updateRow: (localId: string, patch: Partial<Pick<DraftTextRow, 'title' | 'content'>>) => void
  // El backend solo imprime la primera versión activa (por `order`) de cada grupo — las demás
  // "activas" se ignoran en silencio. Para que la UI nunca mienta, "Activo" se comporta como
  // selección única por grupo: prender una apaga automáticamente las otras del mismo `key`.
  setActiveInGroup: (key: TemplateTextKey, localId: string) => void
  deactivate: (localId: string) => void
  removeRow: (localId: string) => void
  reorderGroup: (key: TemplateTextKey, orderedLocalIds: string[]) => void
  // Aplica el borrador contra el backend: crea las versiones nuevas, actualiza las existentes y
  // borra las marcadas — se llama recién después de que la plantilla padre ya tiene `templateId`
  // (ver onSubmit en proforma-template-form.tsx).
  syncToTemplate: (templateId: number) => Promise<{ ok: boolean; error?: string }>
  reset: () => void
}

export const useProformaTemplateTextDraftStore = create<State & Action>((set, get) => ({
  rows: [],
  initializedForTemplateId: null,
  seededDefaults: false,

  setFromExisting: (templateId, items) => {
    if (get().initializedForTemplateId === templateId) return
    set({ rows: items.map(toDraft), initializedForTemplateId: templateId })
  },

  seedDefaults: () => {
    if (get().seededDefaults || get().rows.length > 0) return
    const rows: DraftTextRow[] = TEMPLATE_TEXT_KEYS.map(({ key }) => ({
      localId: nextLocalId(),
      id: null,
      key,
      title: DEFAULT_TEMPLATE_TEXTS[key].title,
      content: DEFAULT_TEMPLATE_TEXTS[key].content,
      visible: true,
      order: 1,
      deleted: false,
    }))
    set({ rows, seededDefaults: true })
  },

  addRow: (key) => {
    set((state) => {
      const group = state.rows.filter((r) => r.key === key && !r.deleted)
      const order = group.length ? Math.max(...group.map((r) => r.order)) + 1 : 1
      // Si el grupo ya tiene una versión activa, la nueva nace apagada (de respaldo) para no
      // crear una segunda "activa" ambigua — si el grupo estaba vacío, nace activa.
      const groupHasActive = group.some((r) => r.visible)
      const row: DraftTextRow = {
        localId: nextLocalId(),
        id: null,
        key,
        title: '',
        content: '',
        visible: !groupHasActive,
        order,
        deleted: false,
      }
      return { rows: [...state.rows, row] }
    })
  },

  updateRow: (localId, patch) => {
    set((state) => ({
      rows: state.rows.map((r) => (r.localId === localId ? { ...r, ...patch } : r)),
    }))
  },

  setActiveInGroup: (key, localId) => {
    set((state) => ({
      rows: state.rows.map((r) =>
        r.key === key && !r.deleted ? { ...r, visible: r.localId === localId } : r
      ),
    }))
  },

  deactivate: (localId) => {
    set((state) => ({
      rows: state.rows.map((r) => (r.localId === localId ? { ...r, visible: false } : r)),
    }))
  },

  removeRow: (localId) => {
    set((state) => {
      const row = state.rows.find((r) => r.localId === localId)
      if (!row) return state
      // Un borrador que nunca se guardó no necesita DELETE al backend: se descarta directo.
      const withoutRow =
        row.id === null
          ? state.rows.filter((r) => r.localId !== localId)
          : state.rows.map((r) => (r.localId === localId ? { ...r, deleted: true } : r))

      // Si se quitó la versión activa, se promueve automáticamente la de menor `order` que
      // quede en el grupo — así el grupo no queda "sin nada que imprimir" por accidente.
      const groupRemaining = withoutRow.filter((r) => r.key === row.key && !r.deleted)
      if (row.visible && groupRemaining.length > 0 && !groupRemaining.some((r) => r.visible)) {
        const promoted = groupRemaining.sort((a, b) => a.order - b.order)[0]
        return {
          rows: withoutRow.map((r) =>
            r.localId === promoted.localId ? { ...r, visible: true } : r
          ),
        }
      }
      return { rows: withoutRow }
    })
  },

  reorderGroup: (key, orderedLocalIds) => {
    set((state) => ({
      rows: state.rows.map((r) => {
        if (r.key !== key) return r
        const idx = orderedLocalIds.indexOf(r.localId)
        return idx === -1 ? r : { ...r, order: idx + 1 }
      }),
    }))
  },

  syncToTemplate: async (templateId) => {
    const rows = get().rows
    const toCreate = rows.filter((r) => r.id === null)
    const toUpdate = rows.filter((r) => r.id !== null && !r.deleted)
    const toDelete = rows.filter((r) => r.id !== null && r.deleted)

    try {
      const created = await Promise.all(
        toCreate.map((r) =>
          proformaTemplateTextsService.post({
            template_id: templateId,
            key: r.key,
            title: r.title || undefined,
            content: r.content || undefined,
            visible: r.visible ? 1 : 0,
            order: r.order,
          })
        )
      )
      const updated = await Promise.all(
        toUpdate.map((r) =>
          proformaTemplateTextsService.patch(r.id!, {
            title: r.title || undefined,
            content: r.content || undefined,
            visible: r.visible ? 1 : 0,
            order: r.order,
          })
        )
      )
      const deleted = await Promise.all(
        toDelete.map((r) => proformaTemplateTextsService.delete(r.id!))
      )

      if (
        created.some((r) => !r.success) ||
        updated.some((r) => !r.success) ||
        deleted.some((ok) => !ok)
      ) {
        return { ok: false, error: 'Algunos bloques de texto no se pudieron guardar.' }
      }

      set({
        initializedForTemplateId: templateId,
        rows: rows
          .filter((r) => !r.deleted)
          .map((r) => {
            if (r.id !== null) return r
            const idx = toCreate.indexOf(r)
            return { ...r, id: created[idx].data.id }
          }),
      })
      return { ok: true }
    } catch (error: any) {
      return {
        ok: false,
        error: error?.response?.data?.message ?? error?.message ?? 'Error al guardar los textos.',
      }
    }
  },

  reset: () => set({ rows: [], initializedForTemplateId: null, seededDefaults: false }),
}))
