'use client'

import { useEffect, useRef, useState } from 'react'
import {
  AlertCircle, CheckCircle2, Loader2, Plus, StopCircle, Upload, X, XCircle,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Label } from '@/shared/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/ui/dialog'
import { FolderPicker } from '@/shared/ui/folder-picker'
import { toastSuccess, toastError } from '@/shared/lib/toast'
import { nextEntryId } from '../../stores/useStorageFileActionStore'
import { FileTypeIcon } from '../grid/file-type-icon'

interface FileUploadModalProps {
  open:        boolean
  currentPath: string | null
  onClose:     () => void
  onUploaded:  () => void
}

type EntryStatus = 'pending' | 'uploading' | 'done' | 'error'
type LocalEntry  = { id: string; file: File; status: EntryStatus; error?: string }

export function FileUploadModal({ open, currentPath, onClose, onUploaded }: FileUploadModalProps) {
  const [entries,     setEntries]     = useState<LocalEntry[]>([])
  const [folder,      setFolder]      = useState<string>('')
  const [dragOver,    setDragOver]    = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (open) {
      setEntries([])
      setFolder(currentPath ?? '')
      setDragOver(false)
      setIsUploading(false)
    }
  }, [open])

  const addFiles = (files: File[]) => {
    const newEntries: LocalEntry[] = files.map((f) => ({ id: nextEntryId(), file: f, status: 'pending' }))
    setEntries((prev) => [...prev, ...newEntries])
  }

  const removeEntry = (id: string) => setEntries((prev) => prev.filter((e) => e.id !== id))

  const updateStatus = (id: string, status: EntryStatus, error?: string) => {
    setEntries((prev) => prev.map((e) => e.id === id ? { ...e, status, error } : e))
  }

  const handleUpload = async () => {
    const pending = entries.filter((e) => e.status === 'pending' || e.status === 'error')
    if (!pending.length) return

    abortRef.current = new AbortController()
    const { signal } = abortRef.current
    const { storageFilesService } = await import('../../services/storage-files.service')

    setIsUploading(true)
    let done = 0; let errors = 0

    for (const entry of pending) {
      if (signal.aborted) { updateStatus(entry.id, 'pending'); continue }
      updateStatus(entry.id, 'uploading')
      try {
        const fd = new FormData()
        fd.append('file', entry.file)
        if (folder.trim()) fd.append('folder', folder.trim())
        const res = await storageFilesService.upload(fd, signal)
        if (res.success) {
          done++
          updateStatus(entry.id, 'done')
        } else {
          errors++
          updateStatus(entry.id, 'error', res.message)
          // Continúa con el siguiente — no aborta el resto
        }
      } catch (err: any) {
        const isCanceled = err?.code === 'ERR_CANCELED' || err?.name === 'CanceledError' || err?.name === 'AbortError'
        if (isCanceled) {
          updateStatus(entry.id, 'pending')
        } else {
          errors++
          updateStatus(entry.id, 'error', err?.response?.data?.message ?? 'Error al subir')
          // Continúa con el siguiente — no aborta el resto
        }
      }
    }

    abortRef.current = null
    setIsUploading(false)

    if (done > 0) onUploaded()

    if (done > 0 && errors === 0) {
      toastSuccess('Archivos subidos', `${done} archivo${done !== 1 ? 's' : ''} subido${done !== 1 ? 's' : ''}.`)
      onClose()
    } else if (errors > 0 && !signal.aborted) {
      toastError('Subida parcial', `${done} exitoso${done !== 1 ? 's' : ''}, ${errors} con error.`)
    }
  }

  const handleCancel = () => {
    abortRef.current?.abort()
    // No cierra el modal — solo cancela la subida
  }

  const doneCount    = entries.filter((e) => e.status === 'done').length
  const errorCount   = entries.filter((e) => e.status === 'error').length
  const pendingCount = entries.filter((e) => e.status === 'pending').length
  const uploadingCount = entries.filter((e) => e.status === 'uploading').length
  const totalCount   = entries.length
  const allDone      = totalCount > 0 && doneCount + errorCount === totalCount && !isUploading
  const progress     = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0

  const getFileExt = (name: string) => name.split('.').pop() ?? 'file'

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => { if (!v && !isUploading) onClose() }}
    >
      <DialogContent
        showCloseButton={!isUploading}
        onInteractOutside={(e) => { if (isUploading) e.preventDefault() }}
        onEscapeKeyDown={(e) => { if (isUploading) e.preventDefault() }}
        className={cn('transition-all duration-300', totalCount === 0 ? 'sm:max-w-md' : 'sm:max-w-xl')}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="size-4" />
            Subir archivos
          </DialogTitle>
          <DialogDescription className="text-xs">
            Sube cualquier tipo de archivo al storage del servidor
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">

          {/* Drop zone */}
          {totalCount === 0 && (
            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(Array.from(e.dataTransfer.files)) }}
              className={cn(
                'flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 cursor-pointer transition-all',
                dragOver ? 'border-primary bg-primary/5 scale-[0.99]' : 'border-border hover:border-primary/50 hover:bg-muted/30',
              )}
            >
              <div className="flex items-center justify-center size-14 rounded-2xl bg-muted">
                <Upload className="size-6 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Arrastra archivos aquí</p>
                <p className="mt-0.5 text-xs text-muted-foreground">o haz clic · cualquier tipo · máx. 100 MB</p>
              </div>
            </div>
          )}

          {/* File list */}
          {totalCount > 0 && (
            <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border px-3 py-2 text-xs',
                    entry.status === 'done'      && 'border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20',
                    entry.status === 'error'     && 'border-destructive/40 bg-destructive/10',
                    entry.status === 'uploading' && 'border-primary/40 bg-primary/5',
                    entry.status === 'pending'   && 'border-border bg-muted/30',
                  )}
                >
                  <FileTypeIcon extension={getFileExt(entry.file.name)} className="size-5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{entry.file.name}</p>
                    {entry.error && <p className="text-destructive text-[10px] truncate">{entry.error}</p>}
                  </div>
                  <span className="shrink-0 text-muted-foreground">
                    {(entry.file.size / 1024 / 1024).toFixed(1)} MB
                  </span>
                  {entry.status === 'uploading' && <Loader2 className="size-4 animate-spin shrink-0 text-primary" />}
                  {entry.status === 'done'      && <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />}
                  {entry.status === 'error'     && <XCircle className="size-4 shrink-0 text-destructive" />}
                  {entry.status === 'pending' && !isUploading && (
                    <button onClick={() => removeEntry(entry.id)} className="shrink-0 text-muted-foreground hover:text-foreground">
                      <X className="size-4" />
                    </button>
                  )}
                </div>
              ))}

              {!allDone && !isUploading && (
                <button
                  onClick={() => inputRef.current?.click()}
                  className="flex items-center gap-2 rounded-xl border-2 border-dashed border-border px-3 py-2 text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  <Plus className="size-4" /> Agregar más archivos
                </button>
              )}
            </div>
          )}

          <input ref={inputRef} type="file" multiple className="hidden"
            onChange={(e) => { if (e.target.files) addFiles(Array.from(e.target.files)); e.target.value = '' }}
          />

          {/* Progress */}
          {isUploading && (
            <div className="flex flex-col gap-1.5">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-center text-xs text-muted-foreground">
                {uploadingCount > 0
                  ? `Subiendo "${entries.find((e) => e.status === 'uploading')?.file.name}"…`
                  : `${doneCount} de ${totalCount} completado${doneCount !== 1 ? 's' : ''}`
                }
              </p>
            </div>
          )}

          {/* Summary */}
          {allDone && (
            <div className={cn(
              'flex items-center gap-2 rounded-xl px-4 py-3 text-sm',
              errorCount === 0 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
            )}>
              {errorCount === 0 ? <CheckCircle2 className="size-4 shrink-0" /> : <AlertCircle className="size-4 shrink-0" />}
              <span>
                {doneCount > 0 && `${doneCount} subido${doneCount !== 1 ? 's' : ''} correctamente.`}
                {errorCount > 0 && ` ${errorCount} con error.`}
              </span>
            </div>
          )}

          {/* Folder */}
          {!isUploading && (
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">
                Carpeta destino
                <span className="ml-1 text-muted-foreground">(se aplica a todos)</span>
              </Label>
              <FolderPicker
                value={folder || undefined}
                onChange={setFolder}
                onClear={() => setFolder('')}
                placeholder="Seleccionar carpeta destino..."
                disabled={isUploading}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              {isUploading && `${doneCount} de ${totalCount} subido${doneCount !== 1 ? 's' : ''}`}
              {!isUploading && !allDone && pendingCount > 0 && `${pendingCount} pendiente${pendingCount !== 1 ? 's' : ''}`}
              {!isUploading && errorCount > 0 && ` · ${errorCount} con error`}
            </p>
            <div className="flex gap-2">
              {isUploading ? (
                <Button variant="destructive" size="sm" onClick={handleCancel}>
                  <StopCircle className="mr-2 size-4" /> Cancelar subida
                </Button>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={onClose}>
                    {allDone ? 'Cerrar' : 'Cancelar'}
                  </Button>
                  {!allDone && (
                    <Button
                      size="sm"
                      onClick={() => void handleUpload()}
                      disabled={pendingCount === 0 && errorCount === 0}
                    >
                      <Upload className="mr-2 size-4" />
                      {pendingCount + errorCount > 1
                        ? `Subir ${pendingCount + errorCount} archivos`
                        : 'Subir archivo'}
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
