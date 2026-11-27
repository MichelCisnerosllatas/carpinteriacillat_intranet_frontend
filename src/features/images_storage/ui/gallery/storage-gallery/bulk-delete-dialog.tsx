'use client'

import { HardDrive, Trash2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/ui/dialog'
import { useStorageGalleryStore } from '../../../stores/useStorageGalleryStore'
import type { BulkDeleteMode } from '../../../data/schema'
import { BulkOption } from './bulk-option'

export function BulkDeleteDialog({
  open, count, files, isActing, onClose, onConfirm,
}: {
  open: boolean
  count: number
  files: ReturnType<typeof useStorageGalleryStore.getState>['items']
  isActing: boolean
  onClose: () => void
  onConfirm: (mode: BulkDeleteMode) => void
}) {
  const withDb    = files.filter((f) => f.dbRecord !== null).length
  const withoutDb = files.filter((f) => f.dbRecord === null).length

  return (
    <Dialog open={open} onOpenChange={(v) => !v && !isActing && onClose()}>
      <DialogContent
        className="max-w-sm"
        showCloseButton={!isActing}
        onInteractOutside={(e) => { if (isActing) e.preventDefault() }}
        onEscapeKeyDown={(e) => { if (isActing) e.preventDefault() }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="size-4 text-destructive" />
            Eliminar {count} archivo{count > 1 ? 's' : ''}
          </DialogTitle>
          <DialogDescription>
            Elige qué deseas eliminar de cada archivo seleccionado.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border bg-muted/30 p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Con registro en BD</span>
            <Badge variant="secondary">{withDb}</Badge>
          </div>
          <div className="mt-1.5 flex justify-between">
            <span className="text-muted-foreground">Huérfanos (sin BD)</span>
            <Badge variant="outline">{withoutDb}</Badge>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <BulkOption
            onClick={() => onConfirm('physical')}
            disabled={isActing}
            icon={<HardDrive className="size-4" />}
            label="Solo archivos físicos"
            desc="Los registros BD se conservan"
          />
          {withDb > 0 && (
            <BulkOption
              onClick={() => onConfirm('both')}
              disabled={isActing}
              icon={<Trash2 className="size-4 text-destructive" />}
              label="Archivos físicos + registros BD"
              desc="Limpieza total para los conectados"
              danger
            />
          )}
        </div>

        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isActing}>
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
