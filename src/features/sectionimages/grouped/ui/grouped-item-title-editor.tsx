'use client'

// Vista agrupada (hero de Servicios y carrusel de categorías).
// Nombre del item editable en línea (lápiz → input). Solo si config.canRenameInline.
// Lo general de imágenes de sección vive fuera de esta carpeta (ver grouped/README.md).

import { useRef, useState, type ReactNode } from 'react'
import { Pencil } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'

interface GroupedItemTitleEditorProps {
  /** Nombre actual del item. */
  title: string
  /** "del servicio" / "de la categoría" (para el texto de accesibilidad). */
  ofTheItem: string
  /** Guarda el nombre nuevo. Devuelve true si se guardó bien. */
  onSave: (title: string) => Promise<boolean>
  /** Lo que se ve cuando NO se está editando (el encabezado del acordeón). */
  children: ReactNode
}

/**
 * Nombre del item editable: ícono lápiz → input.
 * Enter o salir del input guarda; Escape cancela.
 */
export function GroupedItemTitleEditor({ title, ofTheItem, onSave, children }: GroupedItemTitleEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(title)
  const [isSaving, setIsSaving] = useState(false)
  // Evita guardar dos veces (Enter y luego el blur del mismo input)
  const isDone = useRef(false)

  const startEdit = () => {
    setValue(title)
    isDone.current = false
    setIsEditing(true)
  }

  const cancel = () => {
    isDone.current = true
    setIsEditing(false)
  }

  const save = async () => {
    if (isDone.current) return
    isDone.current = true
    const newTitle = value.trim()
    // Vacío o sin cambios: no se guarda nada
    if (!newTitle || newTitle === title) {
      setIsEditing(false)
      return
    }
    setIsSaving(true)
    const ok = await onSave(newTitle)
    setIsSaving(false)
    if (ok) setIsEditing(false)
    else isDone.current = false // si falló, sigue editando para reintentar
  }

  if (isEditing) {
    return (
      <Input
        autoFocus
        value={value}
        disabled={isSaving}
        maxLength={150}
        aria-label={`Nombre ${ofTheItem}`}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => void save()}
        onKeyDown={(e) => {
          if (e.key === 'Enter') { e.preventDefault(); void save() }
          if (e.key === 'Escape') { e.preventDefault(); cancel() }
        }}
        // relative z-10: queda encima del botón del acordeón (escribir no abre/cierra)
        className="relative z-10 h-8 min-w-0 flex-1"
      />
    )
  }

  return (
    <>
      {children}
      <Button
        type="button"
        size="icon"
        variant="ghost"
        // relative z-10: queda encima del botón del acordeón (el lápiz no abre/cierra)
        className="relative z-10 size-7 shrink-0 pointer-coarse:size-9"
        onClick={startEdit}
        title="Cambiar nombre"
      >
        <Pencil className="size-3.5" />
        <span className="sr-only">Cambiar nombre</span>
      </Button>
    </>
  )
}
