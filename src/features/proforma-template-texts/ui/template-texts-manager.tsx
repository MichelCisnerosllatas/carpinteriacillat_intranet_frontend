'use client'

import { useEffect, useState } from 'react'
import { Loader2, Plus, Save, Trash2, GripVertical } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Switch } from '@/shared/ui/switch'
import { Label } from '@/shared/ui/label'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { FieldTip } from '@/shared/ui/field-tip'
import { cn } from '@/shared/lib/utils'
import { toastError, toastSuccess } from '@/shared/lib/toast'
import { swalDeleteConfirm } from '@/shared/lib/swal'
import { useProformaTemplateTextListStore } from '../stores/useProformaTemplateTextListStore'
import { useProformaTemplateTextFormStore } from '../stores/useProformaTemplateTextFormStore'
import { useProformaTemplateTextDeleteStore } from '../stores/useProformaTemplateTextDeleteStore'
import type { ProformaTemplateText } from '../data/schema'

type RowState = {
  localId: string
  id: number | null
  key: string
  title: string
  content: string
  visible: boolean
  order: number
}

let localIdSeq = 0
const nextLocalId = () => `new-${++localIdSeq}`

const toRow = (item: ProformaTemplateText): RowState => ({
  localId: `db-${item.id}`,
  id: item.id,
  key: item.key,
  title: item.title ?? '',
  content: item.content ?? '',
  visible: item.visible,
  order: item.order,
})

interface TemplateTextsManagerProps {
  templateId: number
}

export function TemplateTextsManager({ templateId }: TemplateTextsManagerProps) {
  const { items, isFetching, isError, loadByTemplateText: loadByTemplate } = useProformaTemplateTextListStore()
  const { isSubmitting, create, update } = useProformaTemplateTextFormStore()
  const { isLoading: isDeleting, deleteItem } = useProformaTemplateTextDeleteStore()

  const [rows, setRows] = useState<RowState[]>([])
  const [savingRow, setSavingRow] = useState<string | null>(null)
  const [deletingRow, setDeletingRow] = useState<string | null>(null)

  useEffect(() => { void loadByTemplate(templateId) }, [templateId])

  useEffect(() => { setRows(items.map(toRow)) }, [items])

  const updateField = <K extends keyof RowState>(localId: string, field: K, value: RowState[K]) => {
    setRows((prev) => prev.map((r) => (r.localId === localId ? { ...r, [field]: value } : r)))
  }

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      { localId: nextLocalId(), id: null, key: '', title: '', content: '', visible: true, order: prev.length + 1 },
    ])
  }

  const saveRow = async (row: RowState) => {
    if (!row.key.trim()) {
      toastError('Falta la clave', 'La clave interna (key) es requerida.')
      return
    }
    setSavingRow(row.localId)
    try {
      const payload = {
        template_id: templateId,
        key: row.key,
        title: row.title || undefined,
        content: row.content || undefined,
        visible: row.visible ? 1 : 0,
        order: row.order,
      }
      const ok = row.id ? await update(row.id, payload) : await create(payload)
      if (ok) {
        toastSuccess('Texto guardado', row.key)
        await loadByTemplate(templateId)
      } else {
        toastError('Error al guardar', 'Revisa los datos del bloque de texto.')
      }
    } finally {
      setSavingRow(null)
    }
  }

  const removeRow = async (row: RowState) => {
    if (!row.id) {
      setRows((prev) => prev.filter((r) => r.localId !== row.localId))
      return
    }
    await swalDeleteConfirm(
      `¿Eliminar el bloque "${row.key}"?`, 'Esta acción no se puede deshacer.',
      async ({ close, showError }) => {
        setDeletingRow(row.localId)
        const ok = await deleteItem(row.id!)
        setDeletingRow(null)
        if (ok) {
          toastSuccess('Bloque eliminado', row.key)
          await loadByTemplate(templateId)
          close()
        } else {
          showError('No se pudo eliminar el bloque.')
        }
      },
      { title: 'Eliminando...' }
    )
  }

  if (isFetching && rows.length === 0) {
    return (
      <div className="flex min-h-[120px] items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />Cargando textos...
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex min-h-[120px] flex-col items-center justify-center gap-2 text-sm">
        <p className="text-muted-foreground">Error al cargar los textos de la plantilla.</p>
        <Button size="sm" variant="outline" onClick={() => void loadByTemplate(templateId)}>Reintentar</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {rows.length === 0 && (
        <p className="text-sm text-muted-foreground">No hay bloques de texto todavía.</p>
      )}

      {rows.map((row) => (
        <div key={row.localId} className={cn('flex flex-col gap-3 rounded-lg border p-3', !row.id && 'border-dashed')}>
          <div className="flex items-start gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <GripVertical className="mt-2 size-4 shrink-0 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>Usa el campo &quot;Orden&quot; para cambiar la posición de este bloque</TooltipContent>
            </Tooltip>
            <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-muted-foreground">
                  <FieldTip
                    label="Clave interna (key) *"
                    tip="Identificador único de este bloque de texto (no se muestra en el PDF). Usa solo letras, números y guiones bajos."
                  />
                </Label>
                <Input
                  placeholder="Ej: texto_introductorio"
                  value={row.key}
                  onChange={(e) => updateField(row.localId, 'key', e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-muted-foreground">
                  <FieldTip label="Título" tip="Encabezado visible de este bloque dentro del PDF (opcional)." />
                </Label>
                <Input
                  placeholder="Título visible"
                  value={row.title}
                  onChange={(e) => updateField(row.localId, 'title', e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1 sm:col-span-2">
                <Label className="text-xs text-muted-foreground">
                  <FieldTip label="Contenido" tip="Texto que se imprimirá dentro del bloque en el PDF." />
                </Label>
                <Textarea
                  placeholder="Contenido del bloque..."
                  value={row.content}
                  onChange={(e) => updateField(row.localId, 'content', e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={row.visible} onCheckedChange={(v) => updateField(row.localId, 'visible', v)} />
                <Label className="text-sm">
                  <FieldTip label="Visible" tip="Si está apagado, este bloque no aparecerá en el PDF, pero se conserva guardado." />
                </Label>
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-muted-foreground">
                  <FieldTip label="Orden" tip="Posición de este bloque respecto a los demás (menor número aparece primero)." />
                </Label>
                <Input
                  type="number"
                  value={row.order}
                  onChange={(e) => updateField(row.localId, 'order', Number(e.target.value))}
                  className="w-24"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  disabled={isDeleting && deletingRow === row.localId}
                  onClick={() => void removeRow(row)}
                >
                  {isDeleting && deletingRow === row.localId
                    ? <Loader2 className="size-4 animate-spin" />
                    : <Trash2 className="size-4" />}
                  Eliminar
                </Button>
              </TooltipTrigger>
              <TooltipContent>Elimina este bloque de texto de la plantilla</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  disabled={isSubmitting && savingRow === row.localId}
                  onClick={() => void saveRow(row)}
                >
                  {isSubmitting && savingRow === row.localId
                    ? <Loader2 className="mr-1 size-4 animate-spin" />
                    : <Save className="mr-1 size-4" />}
                  Guardar bloque
                </Button>
              </TooltipTrigger>
              <TooltipContent>Guarda los cambios de este bloque de texto</TooltipContent>
            </Tooltip>
          </div>
        </div>
      ))}

      <Tooltip>
        <TooltipTrigger asChild>
          <Button type="button" variant="outline" onClick={addRow} className="w-fit">
            <Plus className="mr-1 size-4" />Agregar bloque de texto
          </Button>
        </TooltipTrigger>
        <TooltipContent>Agrega un nuevo bloque de texto libre a esta plantilla</TooltipContent>
      </Tooltip>
    </div>
  )
}
