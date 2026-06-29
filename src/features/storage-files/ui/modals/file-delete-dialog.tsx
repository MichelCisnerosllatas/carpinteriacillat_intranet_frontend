'use client'

import { Loader2, Trash2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader,
  AlertDialogTitle, AlertDialogDescription, AlertDialogFooter,
} from '@/shared/ui/alert-dialog'
import { toastSuccess, toastError } from '@/shared/lib/toast'
import { useStorageFileActionStore } from '../../stores/useStorageFileActionStore'
import type { StorageFile } from '../../data/schema'

interface FileDeleteDialogProps {
  open:      boolean
  file:      StorageFile | null
  onClose:   () => void
  onDeleted: () => void
}

export function FileDeleteDialog({ open, file, onClose, onDeleted }: FileDeleteDialogProps) {
  const { deleteFile, isSubmitting, error, clearError } = useStorageFileActionStore()

  const handleDelete = async () => {
    if (!file) return
    const ok = await deleteFile(file.path_encoded)
    if (ok) {
      toastSuccess('Archivo eliminado', `"${file.name}" fue eliminado.`)
      onDeleted()
      onClose()
    } else {
      toastError('Error', error ?? 'No se pudo eliminar.')
    }
  }

  if (!file) return null

  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && !isSubmitting && onClose()}>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="size-4" />
            Eliminar archivo
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs">
            Esta acción es irreversible. Se eliminará permanentemente:
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="rounded-xl border bg-muted/30 px-3 py-2.5 text-xs">
          <p className="font-medium truncate">{file.name}</p>
          <p className="text-muted-foreground mt-0.5">{file.size_human} · {file.path}</p>
        </div>

        {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>}

        <AlertDialogFooter>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
          <Button variant="destructive" size="sm" onClick={() => void handleDelete()} disabled={isSubmitting}>
            {isSubmitting ? <><Loader2 className="mr-2 size-3.5 animate-spin" />Eliminando...</> : 'Eliminar'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
