'use client'

// Diálogo pequeño del botón "+ Nuevo" junto al select "Categoría" (carrusel «Muebles a medida»)
// del formulario de imagen. Crea la tarjeta (sections_items) con el servicio de siempre y avisa su
// id para dejarla elegida en el formulario: select de categoría → title = nombre,
// key = 'category-<id>', type 'category'.
// Textos y datos: ./use-new-section-item-options.ts.

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/shared/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { formatDatetime } from '@/shared/lib/utils'
import { toastError, toastSuccess } from '@/shared/lib/toast'
import { sectionItemsService } from '@/features/section-items/services/sectionitems.service'
import type { SectionItemPostRequestDto } from '@/features/section-items/model/sectionitempost.dto'
import { NEW_SECTION_ITEM_TEXTS, useNewSectionItemOptions } from './use-new-section-item-options'

interface NewSectionItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Sección donde se crea la tarjeta. */
  idSection: number | null | undefined
  /** Se creó la tarjeta: id del nuevo item (el formulario lo deja elegido). */
  onCreated: (idSectionItem: number) => void
}

export function NewSectionItemDialog({ open, onOpenChange, idSection, onCreated }: NewSectionItemDialogProps) {
  const texts = NEW_SECTION_ITEM_TEXTS
  const { options, isLoading, isError } = useNewSectionItemOptions(idSection, open)
  const [isSaving, setIsSaving] = useState(false)

  // Categoría elegida
  const [selectedId, setSelectedId] = useState<number | null>(null)

  // Cada vez que se abre, empieza vacío
  useEffect(() => {
    if (!open) return
    const t = window.setTimeout(() => setSelectedId(null), 0)
    return () => window.clearTimeout(t)
  }, [open])

  const selected = options.find((o) => o.id === selectedId && !o.used) ?? null
  const item = selected ? selected.item : null

  const handleCreate = async () => {
    if (!item || !idSection) return
    setIsSaving(true)
    try {
      const payload: SectionItemPostRequestDto = {
        id_section: idSection,
        sectionitem_type: item.type,
        sectionitem_key: item.key,
        sectionitem_title: item.title,
        sectionitem_state: 1,
        sectionitem_created_at: formatDatetime(),
      }
      const res = await sectionItemsService.post(payload)
      if (res.success && res.data?.id_section_item) {
        toastSuccess('Creado', item.title)
        onCreated(res.data.id_section_item)
        onOpenChange(false)
      } else {
        toastError('No se pudo crear', res.message)
      }
    } catch (error: any) {
      toastError('No se pudo crear', error?.response?.data?.message ?? error?.message ?? 'Error al crear.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!isSaving) onOpenChange(v) }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{texts.title}</DialogTitle>
          <DialogDescription>{texts.description}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">{texts.fieldLabel} <span className="text-destructive">*</span></span>
          {isLoading ? (
            <div className="flex h-9 items-center gap-2 rounded-md border px-3 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />Cargando...
            </div>
          ) : isError ? (
            <p className="text-xs text-destructive">No se pudieron cargar las opciones.</p>
          ) : (
            <Select
              // '' = sin elegir (Radix muestra el placeholder)
              value={selectedId != null ? String(selectedId) : ''}
              onValueChange={(v) => { const id = Number(v); if (Number.isInteger(id) && id > 0) setSelectedId(id) }}
            >
              <SelectTrigger className="w-full"><SelectValue placeholder={texts.placeholder} /></SelectTrigger>
              <SelectContent>
                {options.map((o) => (
                  <SelectItem key={o.id} value={String(o.id)} disabled={o.used}>
                    {o.label}{o.used && texts.usedSuffix}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <p className="text-xs text-muted-foreground">
            {!isLoading && options.length === 0 ? texts.emptyText : texts.help}
          </p>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>Cancelar</Button>
          <Button type="button" onClick={handleCreate} disabled={!item || !idSection || isSaving} className="min-w-24">
            {isSaving ? <><Loader2 className="mr-2 size-4 animate-spin" />Creando...</> : 'Crear'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
