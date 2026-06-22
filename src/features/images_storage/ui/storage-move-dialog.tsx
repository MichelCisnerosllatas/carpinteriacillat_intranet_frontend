'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, Database, FolderInput, Loader2, PenLine, XCircle, HardDrive } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/ui/dialog'
import { toastSuccess, toastError } from '@/shared/lib/toast'
import { useStorageActionStore } from '../stores/useStorageActionStore'
import { useStorageGalleryStore } from '../stores/useStorageGalleryStore'
import { enrichStorageFile } from '../data/schema'
import type { EnrichedStorageFile } from '../data/schema'

interface StorageMoveDialogProps {
  file: EnrichedStorageFile | null
  open: boolean
  onClose: () => void
}

export function StorageMoveDialog({ file, open, onClose }: StorageMoveDialogProps) {
  const { verify, moveFile, isVerifying, isActing, error, verifyResult, clearResult } = useStorageActionStore()
  const { updateItem, loadDbRecords, loadFolders, dbRecords } = useStorageGalleryStore()

  const [newName,   setNewName]   = useState('')
  const [newFolder, setNewFolder] = useState('')

  useEffect(() => {
    if (open && file) {
      clearResult()
      setNewName(file.filename.replace(/\.[^/.]+$/, ''))
      setNewFolder(file.folder === '(raíz)' ? '' : file.folder)
      void verify(file.path, file.dbRecord)
    }
  }, [open, file?.path])

  const handleClose = () => { clearResult(); onClose() }

  const handleMove = async () => {
    if (!file || !verifyResult) return

    const trimName   = newName.trim()
    const trimFolder = newFolder.trim()

    if (!trimName && !trimFolder) {
      toastError('Faltan datos', 'Indica un nuevo nombre o una nueva carpeta.')
      return
    }

    if (!verifyResult.existsOnDisk) {
      toastError('Archivo no encontrado', 'El archivo ya no existe en el servidor.')
      return
    }

    const result = await moveFile({
      oldPath:   file.path,
      newName:   trimName || undefined,
      newFolder: trimFolder || undefined,
      dbId:      verifyResult.dbRecord?.id_image,
    })

    if (result.ok && result.newPath && result.newUrl) {
      const enriched = enrichStorageFile(
        { path: result.newPath, url: result.newUrl, last_modified: file.last_modified },
        dbRecords
      )
      updateItem(file.path, enriched)
      await Promise.all([
        verifyResult.dbRecord ? loadDbRecords() : Promise.resolve(),
        loadFolders(),
      ])
      toastSuccess('Archivo movido', `"${file.filename}" fue movido correctamente.`)
      handleClose()
    } else {
      toastError('Error al mover', error ?? 'No se pudo completar la operación.')
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
            <FolderInput className="size-4" />
            Mover / Renombrar
          </DialogTitle>
          <DialogDescription className="truncate text-xs">{file?.path}</DialogDescription>
        </DialogHeader>

        {/* Status */}
        <div className="rounded-xl border bg-muted/30 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Estado actual
          </p>
          {isVerifying ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />Verificando...
            </div>
          ) : verifyResult ? (
            <div className="flex flex-col gap-2">
              <div className={cn(
                'flex items-center justify-between rounded-lg px-3 py-2',
                disk ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-destructive/10 text-destructive'
              )}>
                <span className="flex items-center gap-2 text-sm font-medium">
                  <HardDrive className="size-4" />Disco del servidor
                </span>
                {disk
                  ? <span className="flex items-center gap-1 text-xs"><CheckCircle2 className="size-3.5" />Existe</span>
                  : <span className="flex items-center gap-1 text-xs"><XCircle className="size-3.5" />No encontrado</span>
                }
              </div>
              <div className={cn(
                'flex items-center justify-between rounded-lg px-3 py-2',
                db ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400' : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
              )}>
                <span className="flex items-center gap-2 text-sm font-medium">
                  <Database className="size-4" />Base de datos
                </span>
                {db
                  ? <span className="flex items-center gap-1 text-xs"><CheckCircle2 className="size-3.5" />Se actualizará (ID {db.id_image})</span>
                  : <span className="flex items-center gap-1 text-xs">Sin registro</span>
                }
              </div>
            </div>
          ) : null}
        </div>

        {verifyResult && !disk && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            El archivo no existe en el servidor. No se puede mover.
          </p>
        )}

        {/* Form */}
        {verifyResult && disk && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="flex items-center gap-1.5 text-xs">
                <PenLine className="size-3.5" />
                Nuevo nombre
                <span className="text-muted-foreground">(sin extensión · opcional)</span>
              </Label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="ej: mesa-comedor-roble"
                disabled={isActing}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="flex items-center gap-1.5 text-xs">
                <FolderInput className="size-3.5" />
                Nueva carpeta
                <span className="text-muted-foreground">(opcional)</span>
              </Label>
              <Input
                value={newFolder}
                onChange={(e) => setNewFolder(e.target.value)}
                placeholder="ej: muebles/sillas"
                disabled={isActing}
              />
            </div>
            {error && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={handleClose} disabled={isActing}>
            Cancelar
          </Button>
          {verifyResult && disk && (
            <Button
              size="sm"
              onClick={() => void handleMove()}
              disabled={isActing || isVerifying}
            >
              {isActing ? <><Loader2 className="mr-2 size-4 animate-spin" />Moviendo...</> : 'Mover'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
