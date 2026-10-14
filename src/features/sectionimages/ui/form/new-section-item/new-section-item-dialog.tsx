'use client'

// Diálogo pequeño del botón "+ Nuevo" junto al select "Trabajo" (Restauración) o "Categoría"
// (carrusel «Muebles a medida») del formulario de imagen. Crea la tarjeta (sections_items) con el
// servicio de siempre y avisa su id para dejarla elegida en el formulario.
//   - Restauración: "Nombre del trabajo" (obligatorio) + "Mueble relacionado" (opcional).
//     Guarda title = nombre, key = 'furniture-<id>' (o sin clave si no hay mueble), type 'restoration'.
//   - Carrusel: select de categoría → title = nombre, key = 'category-<id>', type 'category'.
// Textos y datos: ./use-new-section-item-options.ts.

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { formatDatetime } from '@/shared/lib/utils'
import { toastError, toastSuccess } from '@/shared/lib/toast'
import { sectionItemsService } from '@/features/section-items/services/sectionitems.service'
import type { SectionItemPostRequestDto } from '@/features/section-items/model/sectionitempost.dto'
import { RestorationFurnitureSelect } from '@/features/section-items/ui/form/restoration/restoration-furniture-select'
import { RESTORATION_ITEM_TYPE, buildRestorationItemKey, getFurnitureDisplayTitle } from '../../../grouped'
import {
  NEW_SECTION_ITEM_TEXTS, useNewSectionItemOptions, type NewSectionItemKind,
} from './use-new-section-item-options'

interface NewSectionItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  kind: NewSectionItemKind
  /** Sección donde se crea la tarjeta. */
  idSection: number | null | undefined
  /** Se creó la tarjeta: id del nuevo item (el formulario lo deja elegido). */
  onCreated: (idSectionItem: number) => void
}

export function NewSectionItemDialog({ open, onOpenChange, kind, idSection, onCreated }: NewSectionItemDialogProps) {
  const texts = NEW_SECTION_ITEM_TEXTS[kind]
  const isRestoration = kind === 'restoration'
  const { options, furnitures, usedIds, isLoading, isError } = useNewSectionItemOptions(kind, idSection, open)
  const [isSaving, setIsSaving] = useState(false)

  // Carrusel: categoría elegida
  const [selectedId, setSelectedId] = useState<number | null>(null)
  // Restauración: nombre del trabajo y mueble relacionado (opcional)
  const [workTitle, setWorkTitle] = useState('')
  const [furnitureId, setFurnitureId] = useState<number | null>(null)

  // Cada vez que se abre, empieza vacío
  useEffect(() => {
    if (!open) return
    setSelectedId(null)
    setWorkTitle('')
    setFurnitureId(null)
  }, [open])

  const selected = options.find((o) => o.id === selectedId && !o.used) ?? null

  /** Lo que se guarda en sections_items (null = falta algo obligatorio). */
  const buildItem = (): { type: string; key?: string; title: string } | null => {
    if (isRestoration) {
      const title = workTitle.trim()
      if (!title) return null
      return {
        type: RESTORATION_ITEM_TYPE,
        // Sin mueble → sin clave (el backend la guarda null)
        key: furnitureId != null ? buildRestorationItemKey(furnitureId) : undefined,
        title,
      }
    }
    return selected ? selected.item : null
  }
  const item = buildItem()

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

        {isRestoration ? (
          // ── Restauración: nombre (obligatorio) + mueble relacionado (opcional) ──
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">{texts.fieldLabel} <span className="text-destructive">*</span></span>
              <Input value={workTitle} onChange={(e) => setWorkTitle(e.target.value)} placeholder={texts.placeholder} />
              <p className="text-xs text-muted-foreground">{texts.help}</p>
            </div>
            <RestorationFurnitureSelect
              furnitures={furnitures}
              isLoading={isLoading}
              isError={isError}
              usedIds={usedIds}
              value={furnitureId}
              onChange={(id, furniture) => {
                setFurnitureId(id)
                // Si el nombre está vacío se sugiere el del mueble (no se pisa lo ya escrito)
                if (furniture && !workTitle.trim()) setWorkTitle(getFurnitureDisplayTitle(furniture))
              }}
            />
          </div>
        ) : (
          // ── Carrusel: select de categoría ──
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
        )}

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
