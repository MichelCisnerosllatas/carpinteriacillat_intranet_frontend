'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, Loader2, MoveRight } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Label } from '@/shared/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/ui/dialog'
import { FolderPicker } from '@/shared/ui/folder-picker'
import { toastSuccess, toastError } from '@/shared/lib/toast'
import { useStorageFolderActionStore } from '../../stores/useStorageFolderActionStore'
import type { StorageFolder } from '../../data/schema'

interface FolderMoveModalProps {
  open:    boolean
  folder:  StorageFolder | null
  onClose: () => void
  onMoved: () => void
}

// Antes, mover una carpeta solo era posible arrastrándola con el mouse — inalcanzable
// en touch. Este modal reutiliza el mismo flujo que ya existe para archivos (FileMoveModal)
// y el FolderPicker (con soporte táctil propio), sobre un endpoint que ya existía en el
// store (moveFolder) pero que no tenía ninguna UI conectada.
export function FolderMoveModal({ open, folder, onClose, onMoved }: FolderMoveModalProps) {
  const { moveFolder, isSubmitting, error, clearError } = useStorageFolderActionStore()
  const [destFolder, setDestFolder] = useState('')

  useEffect(() => {
    if (open && folder) {
      setDestFolder(folder.parent_path ?? '')
      clearError()
    }
  }, [open, folder?.path])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!folder || !destFolder.trim()) return
    if (destFolder.trim() === folder.path || destFolder.trim().startsWith(folder.path + '/')) return

    const ok = await moveFolder({ path_encoded: folder.path_encoded, new_folder: destFolder.trim() })
    if (ok) {
      toastSuccess('Carpeta movida', `"${folder.name}" fue movida a "${destFolder}".`)
      onMoved()
      onClose()
    } else {
      toastError('Error', error ?? 'No se pudo mover la carpeta.')
    }
  }

  const hasFiles = (folder?.files_count ?? 0) > 0

  return (
    <Dialog open={open} onOpenChange={(v) => !v && !isSubmitting && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MoveRight className="size-4" />
            Mover carpeta
          </DialogTitle>
          <DialogDescription className="truncate text-xs">{folder?.path}</DialogDescription>
        </DialogHeader>

        {hasFiles && (
          <div className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 px-3 py-2.5 text-xs text-amber-700 dark:text-amber-400">
            <AlertTriangle className="size-3.5 shrink-0 mt-0.5" />
            <span>
              Esta carpeta tiene {folder!.files_count} archivo{folder!.files_count !== 1 ? 's' : ''}.
              Se moverán junto con ella.
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Carpeta destino</Label>
            <FolderPicker
              value={destFolder || undefined}
              onChange={setDestFolder}
              onClear={() => setDestFolder('')}
              placeholder="Seleccionar carpeta destino..."
              disabled={isSubmitting}
            />
            {folder?.parent_path && (
              <p className="text-[11px] text-muted-foreground">
                Ubicación actual: <span className="font-medium">{folder.parent_path}</span>
              </p>
            )}
          </div>

          {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting || !destFolder.trim()}>
              {isSubmitting ? <><Loader2 className="mr-2 size-3.5 animate-spin" />Moviendo...</> : 'Mover'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
