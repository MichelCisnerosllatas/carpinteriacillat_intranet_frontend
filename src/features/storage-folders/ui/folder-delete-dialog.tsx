'use client'

import { useEffect, useState } from 'react'
import { Loader2, Trash2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Checkbox } from '@/shared/ui/checkbox'
import { Label } from '@/shared/ui/label'
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader,
  AlertDialogTitle, AlertDialogDescription, AlertDialogFooter,
} from '@/shared/ui/alert-dialog'
import { toastSuccess, toastError } from '@/shared/lib/toast'
import { useStorageFolderActionStore } from '../stores/useStorageFolderActionStore'
import type { StorageFolder } from '../data/schema'

interface FolderDeleteDialogProps {
  open:      boolean
  folder:    StorageFolder | null
  onClose:   () => void
  onDeleted: (deletedPath: string, parentPath: string | null) => void
}

export function FolderDeleteDialog({ open, folder, onClose, onDeleted }: FolderDeleteDialogProps) {
  const { deleteFolder, isSubmitting, error, clearError } = useStorageFolderActionStore()
  const [forceConfirmed, setForceConfirmed] = useState(false)

  const hasContent = (folder?.files_count ?? 0) > 0 || (folder?.subdirectories_count ?? 0) > 0

  useEffect(() => {
    if (open) { setForceConfirmed(false); clearError() }
  }, [open, folder?.path])

  const handleDelete = async () => {
    if (!folder) return
    if (hasContent && !forceConfirmed) return

    const ok = await deleteFolder({
      path_encoded: folder.path_encoded,
      force:        hasContent ? true : undefined,
    })

    if (ok) {
      toastSuccess('Carpeta eliminada', `"${folder.name}" fue eliminada.`)
      onDeleted(folder.path, folder.parent_path)
      onClose()
    } else {
      toastError('Error', error ?? 'No se pudo eliminar la carpeta.')
    }
  }

  if (!folder) return null

  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && !isSubmitting && onClose()}>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="size-4" />
            Eliminar carpeta
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs">
            ¿Estás seguro de que deseas eliminar <strong>"{folder.name}"</strong>?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col gap-3 py-1">
          {/* Stats */}
          <div className="rounded-xl border bg-muted/30 p-3 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Archivos directos</span>
              <span className="font-medium">{folder.files_count}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subcarpetas</span>
              <span className="font-medium">{folder.subdirectories_count}</span>
            </div>
          </div>

          {/* Force confirmation */}
          {hasContent ? (
            <div className="flex items-start gap-2.5 rounded-lg bg-destructive/10 px-3 py-2.5">
              <Checkbox
                id="force-confirm"
                checked={forceConfirmed}
                onCheckedChange={(v) => setForceConfirmed(Boolean(v))}
                className="mt-0.5"
              />
              <Label htmlFor="force-confirm" className="text-xs leading-relaxed cursor-pointer text-destructive">
                Entiendo que se eliminará todo el contenido de esta carpeta y no se podrá recuperar.
              </Label>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              La carpeta está vacía y se eliminará de forma segura.
            </p>
          )}

          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>
          )}
        </div>

        <AlertDialogFooter>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => void handleDelete()}
            disabled={isSubmitting || (hasContent && !forceConfirmed)}
          >
            {isSubmitting
              ? <><Loader2 className="mr-2 size-3.5 animate-spin" />Eliminando...</>
              : 'Eliminar'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
