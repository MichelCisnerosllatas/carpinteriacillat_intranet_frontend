// src/features/proforma-notes/ui/proforma-note-lines.tsx
'use client'

import { useRef, useState } from 'react'
import { Loader2, Plus, X } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { useProformaNotes } from '../hooks/useProformaNotes'
import { addNoteToList, removeNoteFromList, updateNoteInList } from '../lib'
import type { ProformaNote } from '../data/schema'

interface ProformaNoteLinesProps {
  proformaId: number | null
}

/**
 * Patrón "chip/tag input" — a propósito bien distinto del carrito de productos (sin caja con
 * borde, sin filas apiladas ni footer con input+botón): un input redondeado para escribir la nota
 * + un botón circular para agregarla (Enter hace lo mismo), y debajo las notas ya agregadas como
 * pastillas que envuelven en varias líneas (`flex-wrap`), así se ve bien también en mobile sin
 * necesitar scroll horizontal. El borrador de la nota nueva vive como estado local de este
 * componente: no hace falta un draft store aparte como `useCartDraftsStore`, ver la nota en
 * `lib/types.ts`.
 *
 * Edición inline: click en el TEXTO de un chip (no en el botón `X`) lo pone en "modo edición" —
 * un solo chip a la vez, identificado por `editingKey` (`saved-<id>` o `pending-<tempId>`).
 * Enter/blur confirma, Escape cancela. `skipBlurRef` evita que el `blur` nativo que dispara React
 * al desmontar el input (por el Escape) dispare también un guardado — sin ese guard, cancelar con
 * Escape terminaría guardando igual.
 */
export function ProformaNoteLines({ proformaId }: ProformaNoteLinesProps) {
  const notes = useProformaNotes({ proformaId })
  const [draftText, setDraftText] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')
  const [isSavingEdit, setIsSavingEdit] = useState(false)
  const skipBlurRef = useRef(false)

  const handleAdd = async () => {
    if (!draftText.trim() || isAdding) return
    setIsAdding(true)
    const nextOrder = notes.savedNotes.length + notes.pendingNotes.length + 1
    const ok = await addNoteToList({ proformaId, text: draftText, nextOrder })
    setIsAdding(false)
    if (ok) setDraftText('')
  }

  const startEdit = (key: string, text: string) => {
    setEditingKey(key)
    setEditingText(text)
  }

  const cancelEdit = () => {
    skipBlurRef.current = true
    setEditingKey(null)
  }

  const commitSavedEdit = async (row: ProformaNote) => {
    if (skipBlurRef.current) { skipBlurRef.current = false; return }
    const trimmed = editingText.trim()
    // Texto vacío o sin cambios: no hay nada que guardar, se vuelve al texto original.
    if (!trimmed || trimmed === row.text) { setEditingKey(null); return }
    setIsSavingEdit(true)
    const ok = await updateNoteInList({ proformaId, text: trimmed, savedRow: row })
    setIsSavingEdit(false)
    if (ok) setEditingKey(null)
  }

  const commitPendingEdit = (tempId: string) => {
    if (skipBlurRef.current) { skipBlurRef.current = false; return }
    const trimmed = editingText.trim()
    if (trimmed) void updateNoteInList({ proformaId, text: trimmed, pendingTempId: tempId })
    setEditingKey(null)
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Input
          value={draftText}
          placeholder="Ej: Garantía de 1 año"
          disabled={isAdding}
          className="rounded-full"
          onChange={(e) => setDraftText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              void handleAdd()
            }
          }}
        />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="icon"
              disabled={isAdding || !draftText.trim()}
              onClick={handleAdd}
              className="shrink-0 rounded-full"
            >
              {isAdding ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Agregar nota</TooltipContent>
        </Tooltip>
      </div>

      {notes.isFetching && !notes.hasItems && (
        <span className="text-muted-foreground text-sm italic">Cargando notas...</span>
      )}

      {!notes.isFetching && !notes.hasItems && (
        <span className="text-muted-foreground text-sm italic">
          Sin notas adicionales — son opcionales.
        </span>
      )}

      {notes.hasItems && (
        <div className="flex flex-wrap gap-2">
          {/* Notas guardadas — ya existen en el backend (proforma-notes) */}
          {notes.savedNotes.map((row) => {
            const key = `saved-${row.id}`
            const isEditingThis = editingKey === key
            const isSavingThis = isEditingThis && isSavingEdit
            return (
              <span
                key={row.id}
                className="bg-muted/40 flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm"
              >
                {isEditingThis ? (
                  <Input
                    autoFocus
                    value={editingText}
                    disabled={isSavingThis}
                    onChange={(e) => setEditingText(e.target.value)}
                    onBlur={() => void commitSavedEdit(row)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') { e.preventDefault(); void commitSavedEdit(row) }
                      if (e.key === 'Escape') { e.preventDefault(); cancelEdit() }
                    }}
                    className="h-6 w-40 rounded-full px-2 py-0 text-sm"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => startEdit(key, row.text)}
                    className="max-w-48 truncate text-left decoration-dotted underline-offset-2 hover:underline"
                  >
                    {row.text}
                  </button>
                )}
                {isSavingThis ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <button
                    type="button"
                    onClick={() => removeNoteFromList({ proformaId, savedRow: row })}
                    className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive -mr-1 rounded-full p-0.5 transition-colors"
                    aria-label="Quitar nota"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </span>
            )
          })}

          {/* Notas pendientes — agregadas antes de que la proforma tuviera id (usePendingNotesStore) */}
          {notes.pendingNotes.map((item) => {
            const key = `pending-${item.tempId}`
            const isEditingThis = editingKey === key
            const isRowUploading = notes.uploadingTempId === item.tempId
            return (
              <span
                key={item.tempId}
                className={cn(
                  'flex items-center gap-1.5 rounded-full border border-dashed px-3 py-1 text-sm',
                  isRowUploading && 'text-muted-foreground'
                )}
              >
                {isEditingThis ? (
                  <Input
                    autoFocus
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    onBlur={() => commitPendingEdit(item.tempId)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') { e.preventDefault(); commitPendingEdit(item.tempId) }
                      if (e.key === 'Escape') { e.preventDefault(); cancelEdit() }
                    }}
                    className="h-6 w-40 rounded-full px-2 py-0 text-sm"
                  />
                ) : (
                  <button
                    type="button"
                    disabled={isRowUploading}
                    onClick={() => startEdit(key, item.text)}
                    className="max-w-48 truncate text-left decoration-dotted underline-offset-2 hover:underline disabled:cursor-default disabled:no-underline"
                  >
                    {item.text}
                  </button>
                )}
                {isRowUploading ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <button
                    type="button"
                    onClick={() => removeNoteFromList({ proformaId, pendingTempId: item.tempId })}
                    className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive -mr-1 rounded-full p-0.5 transition-colors"
                    aria-label="Quitar nota"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}
