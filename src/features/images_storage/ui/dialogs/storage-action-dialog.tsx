'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2, Database, HardDrive, Loader2, ServerCrash, Trash2, XCircle } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/ui/dialog'
import { Separator } from '@/shared/ui/separator'
import { toastSuccess, toastError } from '@/shared/lib/toast'
import { useStorageActionStore } from '../../stores/useStorageActionStore'
import { useStorageGalleryStore } from '../../stores/useStorageGalleryStore'
import type { EnrichedStorageFile } from '../../data/schema'

interface StorageActionDialogProps {
  file: EnrichedStorageFile | null
  open: boolean
  onClose: () => void
}

export function StorageActionDialog({ file, open, onClose }: StorageActionDialogProps) {
  const { verify, deletePhysical, deleteDbRecord, deleteBoth, isVerifying, isActing, error, verifyResult, clearResult } = useStorageActionStore()
  const { removeItem, loadDbRecords, loadFolders, load } = useStorageGalleryStore()
  const [acting, setActing] = useState<'physical' | 'db' | 'both' | null>(null)

  useEffect(() => {
    if (open && file) {
      clearResult()
      void verify(file.path, file.dbRecord)
    }
  }, [open, file?.path])

  const handleClose = () => { clearResult(); onClose() }

  const handleDelete = async (mode: 'physical' | 'db' | 'both') => {
    if (!file || !verifyResult) return
    setActing(mode)

    let ok = false
    try {
      if (mode === 'physical') {
        ok = await deletePhysical(file.path)
        if (ok) {
          removeItem(file.path)
          await Promise.all([load({ page: 1 }), loadFolders()])
          toastSuccess('Archivo eliminado', `"${file.filename}" fue eliminado del servidor.`)
        }
      } else if (mode === 'db' && verifyResult.dbRecord) {
        ok = await deleteDbRecord(verifyResult.dbRecord.id_image)
        if (ok) {
          await Promise.all([load({ page: 1 }), loadDbRecords()])
          toastSuccess('Registro eliminado', `Registro de "${file.filename}" eliminado de la BD.`)
        }
      } else if (mode === 'both' && verifyResult.dbRecord) {
        ok = await deleteBoth(file.path, verifyResult.dbRecord.id_image)
        if (ok) {
          removeItem(file.path)
          await Promise.all([load({ page: 1 }), loadDbRecords(), loadFolders()])
          toastSuccess('Eliminación completa', `"${file.filename}" eliminado del servidor y de la BD.`)
        }
      }
      if (!ok) toastError('Error', error ?? 'No se pudo completar la operación.')
      else handleClose()
    } finally {
      setActing(null)
    }
  }

  const disk = verifyResult?.existsOnDisk
  const db   = verifyResult?.dbRecord

  return (
    <Dialog open={open} onOpenChange={(v) => !v && !isActing && handleClose()}>
      <DialogContent
        className="max-w-md"
        showCloseButton={!isActing}
        onInteractOutside={(e) => { if (isActing) e.preventDefault() }}
        onEscapeKeyDown={(e) => { if (isActing) e.preventDefault() }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="size-4 text-destructive" />
            Eliminar archivo
          </DialogTitle>
          <DialogDescription className="truncate text-xs">{file?.path}</DialogDescription>
        </DialogHeader>

        {/* Verify status */}
        <div className="rounded-xl border bg-muted/30 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Estado del archivo
          </p>

          {isVerifying ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Verificando en el servidor...
            </div>
          ) : !verifyResult ? (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <ServerCrash className="size-4" />
              No se pudo verificar
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {/* Disk status */}
              <div className={cn(
                'flex items-center justify-between rounded-lg px-3 py-2.5',
                disk ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-destructive/10 text-destructive'
              )}>
                <span className="flex items-center gap-2 text-sm font-medium">
                  <HardDrive className="size-4" />
                  Disco del servidor
                </span>
                {disk
                  ? <span className="flex items-center gap-1 text-xs"><CheckCircle2 className="size-3.5" />Existe</span>
                  : <span className="flex items-center gap-1 text-xs"><XCircle className="size-3.5" />No encontrado</span>
                }
              </div>

              {/* DB status */}
              <div className={cn(
                'flex items-center justify-between rounded-lg px-3 py-2.5',
                db ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400' : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
              )}>
                <span className="flex items-center gap-2 text-sm font-medium">
                  <Database className="size-4" />
                  Base de datos
                </span>
                {db
                  ? <span className="flex items-center gap-1 text-xs"><CheckCircle2 className="size-3.5" />ID {db.id_image}</span>
                  : <span className="flex items-center gap-1 text-xs"><AlertTriangle className="size-3.5" />Sin registro</span>
                }
              </div>
            </div>
          )}
        </div>

        {error && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>
        )}

        {/* Delete options */}
        {verifyResult && (
          <>
            <Separator />
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                ¿Qué deseas eliminar?
              </p>

              {/* Option: physical only */}
              {disk && (
                <button
                  onClick={() => void handleDelete('physical')}
                  disabled={isActing || isVerifying}
                  className={cn(
                    'group flex flex-col gap-0.5 rounded-xl border px-4 py-3 text-left transition-colors',
                    'hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/30',
                    acting === 'physical' && 'border-orange-400 bg-orange-50 dark:bg-orange-950/30',
                    'disabled:cursor-not-allowed disabled:opacity-50'
                  )}
                >
                  <span className="flex items-center gap-2 text-sm font-medium">
                    {acting === 'physical' ? <Loader2 className="size-4 animate-spin" /> : <HardDrive className="size-4" />}
                    Solo el archivo físico
                  </span>
                  <span className="text-xs text-muted-foreground">El registro en la BD se conserva{db ? '' : ' (no existe)'}</span>
                </button>
              )}

              {/* Option: DB only */}
              {db && (
                <button
                  onClick={() => void handleDelete('db')}
                  disabled={isActing || isVerifying}
                  className={cn(
                    'group flex flex-col gap-0.5 rounded-xl border px-4 py-3 text-left transition-colors',
                    'hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30',
                    acting === 'db' && 'border-blue-400 bg-blue-50 dark:bg-blue-950/30',
                    'disabled:cursor-not-allowed disabled:opacity-50'
                  )}
                >
                  <span className="flex items-center gap-2 text-sm font-medium">
                    {acting === 'db' ? <Loader2 className="size-4 animate-spin" /> : <Database className="size-4" />}
                    Solo el registro de la BD
                  </span>
                  <span className="text-xs text-muted-foreground">El archivo físico se conserva en el servidor</span>
                </button>
              )}

              {/* Option: both */}
              {disk && db && (
                <button
                  onClick={() => void handleDelete('both')}
                  disabled={isActing || isVerifying}
                  className={cn(
                    'group flex flex-col gap-0.5 rounded-xl border border-destructive/30 px-4 py-3 text-left transition-colors',
                    'hover:border-destructive hover:bg-destructive/5',
                    acting === 'both' && 'border-destructive bg-destructive/5',
                    'disabled:cursor-not-allowed disabled:opacity-50'
                  )}
                >
                  <span className="flex items-center gap-2 text-sm font-medium text-destructive">
                    {acting === 'both' ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                    Eliminar ambos
                    <Badge variant="destructive" className="text-[10px]">Recomendado</Badge>
                  </span>
                  <span className="text-xs text-muted-foreground">Limpieza total: archivo físico + registro BD</span>
                </button>
              )}

              {!disk && !db && (
                <p className="rounded-lg bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
                  Este archivo no existe en ninguna capa. No hay nada que eliminar.
                </p>
              )}
            </div>
          </>
        )}

        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={handleClose} disabled={isActing}>
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
