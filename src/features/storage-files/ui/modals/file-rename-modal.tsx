'use client'

import { useEffect, useState } from 'react'
import { Loader2, Pencil } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/ui/dialog'
import { toastSuccess, toastError } from '@/shared/lib/toast'
import { useStorageFileActionStore } from '../../stores/useStorageFileActionStore'
import { useStorageFileListStore } from '../../stores/useStorageFileListStore'
import type { StorageFile } from '../../data/schema'

interface FileRenameModalProps {
  open:     boolean
  file:     StorageFile | null
  onClose:  () => void
}

export function FileRenameModal({ open, file, onClose }: FileRenameModalProps) {
  const { rename, isSubmitting, error, clearError } = useStorageFileActionStore()
  const { updateItem } = useStorageFileListStore()
  const [name, setName] = useState('')

  // Name without extension
  const ext = file?.extension ?? ''
  const nameWithoutExt = file ? file.name.replace(new RegExp(`\\.${ext}$`, 'i'), '') : ''

  useEffect(() => {
    if (open && file) { setName(nameWithoutExt); clearError() }
  }, [open, file?.path])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return
    const trimmed = name.trim()
    if (!trimmed || trimmed === nameWithoutExt) return

    const res = await import('../services/storage-files.service')
    const ok = await rename({ path_encoded: file.path_encoded, new_name: trimmed })
    if (ok) {
      toastSuccess('Archivo renombrado', `"${file.name}" → "${trimmed}.${ext}"`)
      void import('../services/storage-files.service').then(async () => {
        // Reload will be triggered by parent via onClose
      })
      onClose()
    } else {
      toastError('Error', error ?? 'No se pudo renombrar.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && !isSubmitting && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="size-4" />
            Renombrar archivo
          </DialogTitle>
          <DialogDescription className="truncate text-xs">{file?.path}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Nuevo nombre (sin extensión)</Label>
            <div className="flex items-center gap-2">
              <Input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="nuevo-nombre"
                disabled={isSubmitting}
                className="flex-1"
              />
              {ext && (
                <span className="shrink-0 rounded-md bg-muted px-3 py-2 text-xs font-medium text-muted-foreground border">
                  .{ext}
                </span>
              )}
            </div>
          </div>

          {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting || !name.trim() || name.trim() === nameWithoutExt}>
              {isSubmitting ? <><Loader2 className="mr-2 size-3.5 animate-spin" />Renombrando...</> : 'Renombrar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
