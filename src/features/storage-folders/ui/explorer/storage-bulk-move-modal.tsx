'use client'

import { useEffect, useState } from 'react'
import { Loader2, MoveRight } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Label } from '@/shared/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/ui/dialog'
import { FolderPicker } from '@/shared/ui/folder-picker'
import { toastSuccess, toastError } from '@/shared/lib/toast'
import { useStorageFolderActionStore } from '../../stores/useStorageFolderActionStore'
import { useStorageFileActionStore } from '@/features/storage-files/stores/useStorageFileActionStore'
import type { StorageFolder } from '../../data/schema'
import type { StorageFile } from '@/features/storage-files/data/schema'

interface StorageBulkMoveModalProps {
  open:    boolean
  folders: StorageFolder[]
  files:   StorageFile[]
  onClose: () => void
  onDone:  () => void
}

// Mueve carpetas y archivos seleccionados juntos a una misma carpeta destino — antes
// la barra de selección masiva solo ofrecía "Mover" cuando había archivos elegidos;
// si el usuario seleccionaba carpetas (con o sin archivos mezclados), no había ninguna
// forma de moverlas salvo arrastrando una por una, imposible en touch.
export function StorageBulkMoveModal({ open, folders, files, onClose, onDone }: StorageBulkMoveModalProps) {
  const { moveFoldersBulk } = useStorageFolderActionStore()
  const { moveBulk }        = useStorageFileActionStore()
  const [destFolder, setDestFolder] = useState('')
  const [isActing,   setIsActing]   = useState(false)

  useEffect(() => {
    if (open) setDestFolder('')
  }, [open])

  const total = folders.length + files.length

  const handleMove = async () => {
    if (!destFolder.trim() || total === 0) return
    setIsActing(true)

    let done = 0, errors = 0, lastError: string | null | undefined

    if (folders.length > 0) {
      const result = await moveFoldersBulk(
        folders.map((f) => ({ path_encoded: f.path_encoded, new_folder: destFolder.trim() })),
      )
      done += result.done; errors += result.errors; lastError = result.lastError
    }

    if (files.length > 0) {
      const result = await moveBulk(
        files.map((f) => ({ pathEncoded: f.path_encoded, newFolder: destFolder.trim() })),
      )
      done += result.done; errors += result.errors
    }

    setIsActing(false)

    if (done > 0 && errors === 0) {
      toastSuccess('Elementos movidos', `${done} elemento${done !== 1 ? 's' : ''} movido${done !== 1 ? 's' : ''}.`)
    } else if (done > 0) {
      toastError('Movimiento parcial', `${done} exitoso${done !== 1 ? 's' : ''}, ${errors} con error.`)
    } else {
      toastError('Error al mover', lastError ?? 'No se pudo mover los elementos seleccionados.')
    }

    onDone()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && !isActing && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MoveRight className="size-4" />
            Mover seleccionados
          </DialogTitle>
          <DialogDescription className="text-xs">
            Se moverá{total !== 1 ? 'n' : ''} {total} elemento{total !== 1 ? 's' : ''}
            {folders.length > 0 && files.length > 0 && ` (${folders.length} carpeta${folders.length !== 1 ? 's' : ''}, ${files.length} archivo${files.length !== 1 ? 's' : ''})`}
            {' '}a la carpeta seleccionada.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Carpeta destino</Label>
            <FolderPicker
              value={destFolder || undefined}
              onChange={setDestFolder}
              onClear={() => setDestFolder('')}
              placeholder="Seleccionar carpeta destino..."
              disabled={isActing}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isActing}>
              Cancelar
            </Button>
            <Button size="sm" onClick={() => void handleMove()} disabled={isActing || !destFolder.trim()}>
              {isActing ? <><Loader2 className="mr-2 size-3.5 animate-spin" />Moviendo...</> : 'Mover todos'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
