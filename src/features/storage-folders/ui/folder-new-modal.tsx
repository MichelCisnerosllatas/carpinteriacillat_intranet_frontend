'use client'

import { useEffect, useState } from 'react'
import { FolderPlus, Loader2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/ui/dialog'
import { toastSuccess, toastError } from '@/shared/lib/toast'
import { useStorageFolderActionStore } from '../stores/useStorageFolderActionStore'

interface FolderNewModalProps {
  open:        boolean
  parentPath:  string | null
  onClose:     () => void
  onCreated:   () => void
}

export function FolderNewModal({ open, parentPath, onClose, onCreated }: FolderNewModalProps) {
  const { create, isSubmitting, error, clearError } = useStorageFolderActionStore()
  const [name, setName] = useState('')

  useEffect(() => {
    if (open) { setName(''); clearError() }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return

    const ok = await create({ name: trimmed, parent_path: parentPath ?? undefined })
    if (ok) {
      toastSuccess('Carpeta creada', `"${trimmed}" fue creada correctamente.`)
      onCreated()
      onClose()
    } else {
      toastError('Error', error ?? 'No se pudo crear la carpeta.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && !isSubmitting && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderPlus className="size-4" />
            Nueva carpeta
          </DialogTitle>
          <DialogDescription className="text-xs">
            {parentPath ? `Dentro de: ${parentPath}` : 'En la raíz del storage'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Nombre de la carpeta</Label>
            <Input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ej: muebles, banners, logos"
              disabled={isSubmitting}
              maxLength={100}
            />
            <p className="text-[11px] text-muted-foreground">
              No puede contener / \ ni ..
            </p>
          </div>

          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting || !name.trim()}>
              {isSubmitting
                ? <><Loader2 className="mr-2 size-3.5 animate-spin" />Creando...</>
                : 'Crear carpeta'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
