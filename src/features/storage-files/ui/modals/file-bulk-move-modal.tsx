'use client'

import { useEffect, useState } from 'react'
import { Loader2, MoveRight } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Label } from '@/shared/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/ui/dialog'
import { FolderPicker } from '@/shared/ui/folder-picker'
import { toastSuccess, toastError } from '@/shared/lib/toast'
import { useStorageFileActionStore } from '../../stores/useStorageFileActionStore'
import { useStorageFileListStore } from '../../stores/useStorageFileListStore'
import type { StorageFile } from '../../data/schema'

interface FileBulkMoveModalProps {
  open:    boolean
  onClose: () => void
  onDone:  () => void
  // When provided, these files are used instead of the store's selectedPaths
  files?:  StorageFile[]
}

export function FileBulkMoveModal({ open, onClose, onDone, files: filesProp }: FileBulkMoveModalProps) {
  const { moveBulk } = useStorageFileActionStore()
  const { getSelected, clearSelection } = useStorageFileListStore()
  const [destFolder,   setDestFolder]   = useState('')
  const [isActing,     setIsActing]     = useState(false)

  // Use prop-provided files if given, otherwise fall back to store selection
  const selected = filesProp ?? getSelected()

  useEffect(() => {
    if (open) setDestFolder('')
  }, [open])

  const handleMove = async () => {
    if (!destFolder.trim() || selected.length === 0) return
    setIsActing(true)
    const items = selected.map((f) => ({ pathEncoded: f.path_encoded, newFolder: destFolder.trim() }))
    const { done, errors } = await moveBulk(items)
    setIsActing(false)

    if (done > 0 && errors === 0) {
      toastSuccess('Archivos movidos', `${done} archivo${done !== 1 ? 's' : ''} movido${done !== 1 ? 's' : ''}.`)
      if (!filesProp) clearSelection() // only clear store selection when not using prop files
      onDone()
      onClose()
    } else if (errors > 0) {
      toastError('Movimiento parcial', `${done} exitoso${done !== 1 ? 's' : ''}, ${errors} con error.`)
      onDone()
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && !isActing && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MoveRight className="size-4" />
            Mover archivos seleccionados
          </DialogTitle>
          <DialogDescription className="text-xs">
            Se moverán {selected.length} archivo{selected.length !== 1 ? 's' : ''} a la carpeta seleccionada.
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
