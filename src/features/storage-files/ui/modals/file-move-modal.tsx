'use client'

import { useEffect, useState } from 'react'
import { Loader2, MoveRight } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Label } from '@/shared/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/ui/dialog'
import { FolderPicker } from '@/shared/ui/folder-picker'
import { toastSuccess, toastError } from '@/shared/lib/toast'
import { useStorageFileActionStore } from '../../stores/useStorageFileActionStore'
import type { StorageFile } from '../../data/schema'

interface FileMoveModalProps {
  open:      boolean
  file:      StorageFile | null
  onClose:   () => void
  onMoved:   () => void
}

export function FileMoveModal({ open, file, onClose, onMoved }: FileMoveModalProps) {
  const { move, isSubmitting, error, clearError } = useStorageFileActionStore()
  const [destFolder, setDestFolder] = useState<string>('')

  useEffect(() => {
    if (open && file) {
      setDestFolder(file.parent_path ?? '')
      clearError()
    }
  }, [open, file?.path])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !destFolder.trim()) return

    const ok = await move({ path_encoded: file.path_encoded, new_folder: destFolder.trim() })
    if (ok) {
      toastSuccess('Archivo movido', `"${file.name}" fue movido a "${destFolder}".`)
      onMoved()
      onClose()
    } else {
      toastError('Error', error ?? 'No se pudo mover el archivo.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && !isSubmitting && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MoveRight className="size-4" />
            Mover archivo
          </DialogTitle>
          <DialogDescription className="truncate text-xs">{file?.path}</DialogDescription>
        </DialogHeader>

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
            {file?.parent_path && (
              <p className="text-[11px] text-muted-foreground">
                Ubicación actual: <span className="font-medium">{file.parent_path}</span>
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
