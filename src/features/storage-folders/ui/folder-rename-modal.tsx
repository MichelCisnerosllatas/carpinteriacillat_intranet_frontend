'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, Loader2, Pencil } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/ui/dialog'
import { toastSuccess, toastError } from '@/shared/lib/toast'
import { useStorageFolderActionStore } from '../stores/useStorageFolderActionStore'
import type { StorageFolder } from '../data/schema'

interface FolderRenameModalProps {
  open:      boolean
  folder:    StorageFolder | null
  onClose:   () => void
  onRenamed: () => void
}

export function FolderRenameModal({ open, folder, onClose, onRenamed }: FolderRenameModalProps) {
  const { rename, isSubmitting, error, clearError } = useStorageFolderActionStore()
  const [name, setName] = useState('')

  useEffect(() => {
    if (open && folder) { setName(folder.name); clearError() }
  }, [open, folder?.path])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!folder) return
    const trimmed = name.trim()
    if (!trimmed || trimmed === folder.name) return

    const ok = await rename({ path_encoded: folder.path_encoded, new_name: trimmed })
    if (ok) {
      toastSuccess('Carpeta renombrada', `"${folder.name}" → "${trimmed}".`)
      onRenamed()
      onClose()
    } else {
      toastError('Error', error ?? 'No se pudo renombrar la carpeta.')
    }
  }

  const hasFiles = (folder?.files_count ?? 0) > 0

  return (
    <Dialog open={open} onOpenChange={(v) => !v && !isSubmitting && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="size-4" />
            Renombrar carpeta
          </DialogTitle>
          <DialogDescription className="truncate text-xs">{folder?.path}</DialogDescription>
        </DialogHeader>

        {hasFiles && (
          <div className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 px-3 py-2.5 text-xs text-amber-700 dark:text-amber-400">
            <AlertTriangle className="size-3.5 shrink-0 mt-0.5" />
            <span>
              Esta carpeta tiene {folder!.files_count} archivo{folder!.files_count !== 1 ? 's' : ''}.
              Las rutas registradas en base de datos pueden quedar desactualizadas.
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Nuevo nombre</Label>
            <Input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nuevo nombre"
              disabled={isSubmitting}
              maxLength={100}
            />
          </div>

          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !name.trim() || name.trim() === folder?.name}
            >
              {isSubmitting
                ? <><Loader2 className="mr-2 size-3.5 animate-spin" />Renombrando...</>
                : 'Renombrar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
