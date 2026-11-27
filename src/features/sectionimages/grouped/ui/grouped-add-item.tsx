'use client'

// Vista agrupada (hero de Servicios y carrusel de categorías).
// Botón "+ Agregar ..." al final de la lista de items. Dos modos (config.addItemMode):
//   'inline' → el botón se convierte en un input para escribir el nombre (hero de Servicios).
//   'form'   → el botón abre el formulario de item (carrusel: ahí se elige la categoría).
// Lo general de imágenes de sección vive fuera de esta carpeta (ver grouped/README.md).

import { useState } from 'react'
import { Check, Loader2, Plus, X } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import type { GroupedSectionConfig } from '../grouped-section.config'

interface GroupedAddItemProps {
  config: GroupedSectionConfig
  /** Modo 'inline': crea el item con ese nombre. Devuelve true si se creó bien. */
  onCreate: (title: string) => Promise<boolean>
  /** Modo 'form': abre el formulario de item. */
  onOpenForm: () => void
}

/** Botón "+ Agregar nuevo servicio" / "+ Agregar categoría". */
export function GroupedAddItem({ config, onCreate, onOpenForm }: GroupedAddItemProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const close = () => { setIsOpen(false); setTitle('') }

  const submit = async () => {
    const value = title.trim()
    if (!value || isSaving) return
    setIsSaving(true)
    const ok = await onCreate(value)
    setIsSaving(false)
    if (ok) close()
  }

  // Modo formulario o input todavía cerrado: solo el botón
  if (config.addItemMode === 'form' || !isOpen) {
    return (
      <Button
        type="button"
        variant="outline"
        className="w-full border-dashed sm:w-fit"
        onClick={() => (config.addItemMode === 'form' ? onOpenForm() : setIsOpen(true))}
      >
        <Plus className="mr-1.5 size-4" />{config.addItemLabel}
      </Button>
    )
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-dashed p-3 sm:flex-row sm:items-center">
      <Input
        autoFocus
        value={title}
        disabled={isSaving}
        maxLength={150}
        placeholder={config.addItemPlaceholder ?? `Nombre ${config.ofTheItem}`}
        aria-label={`Nombre ${config.ofTheItem}`}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') { e.preventDefault(); void submit() }
          if (e.key === 'Escape') { e.preventDefault(); close() }
        }}
        className="h-9 flex-1"
      />
      <div className="flex gap-2">
        <Button type="button" size="sm" disabled={!title.trim() || isSaving} onClick={() => void submit()} className="flex-1 sm:flex-none">
          {isSaving ? <Loader2 className="mr-1.5 size-4 animate-spin" /> : <Check className="mr-1.5 size-4" />}
          Crear {config.itemLower}
        </Button>
        <Button type="button" size="sm" variant="ghost" disabled={isSaving} onClick={close} className="flex-1 sm:flex-none">
          <X className="mr-1.5 size-4" />Cancelar
        </Button>
      </div>
    </div>
  )
}
