'use client'

import { useState } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails'
import 'yet-another-react-lightbox/styles.css'
import 'yet-another-react-lightbox/plugins/thumbnails.css'
import {
  AlertTriangle, Calendar, CheckCircle2, Copy, Database,
  ExternalLink, FolderInput, HardDrive, ImageIcon, Trash2,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Separator } from '@/shared/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { toastSuccess } from '@/shared/lib/toast'
import { formatBytes } from '@/features/images/lib/image-url'
import { StorageActionDialog } from './storage-action-dialog'
import { StorageMoveDialog } from './storage-move-dialog'
import type { EnrichedStorageFile } from '../../data/schema'

interface StorageDetailDialogProps {
  file: EnrichedStorageFile | null
  open: boolean
  onClose: () => void
}

export function StorageDetailDialog({ file, open, onClose }: StorageDetailDialogProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [actionOpen,   setActionOpen]   = useState(false)
  const [moveOpen,     setMoveOpen]     = useState(false)
  const [imgError,     setImgError]     = useState(false)

  if (!file) return null

  const db = file.dbRecord

  const copyUrl = () => {
    navigator.clipboard.writeText(file.url)
    toastSuccess('URL copiada', 'La URL ha sido copiada al portapapeles.')
  }

  const dateStr = file.last_modified
    ? new Date(file.last_modified * 1000).toLocaleDateString('es-ES', {
        day: '2-digit', month: 'short', year: 'numeric',
      })
    : null

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => !v && !lightboxOpen && onClose()}>
        <DialogContent className="w-full max-w-[95vw] sm:max-w-2xl md:max-w-4xl p-0 overflow-hidden gap-0">

          {/* Header */}
          <DialogHeader className="flex-row items-center gap-3 border-b px-5 py-3.5">
            <ImageIcon className="size-4 shrink-0 text-muted-foreground" />
            <DialogTitle className="flex-1 truncate text-sm font-medium">
              {file.filename}
            </DialogTitle>
            <Badge variant="outline" className="shrink-0 text-[10px] font-mono uppercase">
              {file.ext || 'file'}
            </Badge>
          </DialogHeader>

          {/* Body — two columns on md+ */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] overflow-hidden">

            {/* Left — image preview (clickeable abre lightbox) */}
            <div className="relative flex min-h-[240px] md:min-h-[420px] items-center justify-center border-b md:border-b-0 md:border-r bg-[radial-gradient(hsl(var(--muted))_1px,transparent_1px)] bg-[length:18px_18px] overflow-hidden">
              {file.isImage && !imgError ? (
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  className="group relative flex h-full w-full items-center justify-center cursor-zoom-in"
                >
                  <img
                    src={file.url}
                    alt={db?.image_alt ?? file.filename}
                    className="max-h-[380px] w-full object-contain p-6 transition-transform duration-300 group-hover:scale-[1.03]"
                    onError={() => setImgError(true)}
                  />
                  {/* Hover hint */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/10">
                    <span className="rounded-full bg-black/50 px-3 py-1.5 text-xs text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                      Clic para ampliar
                    </span>
                  </div>
                </button>
              ) : (
                <div className="flex flex-col items-center gap-3 text-muted-foreground/50 p-10">
                  <HardDrive className="size-14" />
                  <span className="text-sm">Sin vista previa</span>
                </div>
              )}
            </div>

            {/* Right — metadata panel */}
            <div className="flex flex-col overflow-y-auto max-h-[520px]">

              {/* Status */}
              <div className="px-5 py-4 flex flex-col gap-2">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Estado</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col items-center gap-1 rounded-xl bg-emerald-500/10 px-3 py-2.5 text-emerald-700 dark:text-emerald-400">
                    <HardDrive className="size-4" />
                    <span className="text-[10px] font-semibold">Disco</span>
                    <span className="flex items-center gap-0.5 text-[10px]">
                      <CheckCircle2 className="size-3" />Existe
                    </span>
                  </div>
                  <div className={cn(
                    'flex flex-col items-center gap-1 rounded-xl px-3 py-2.5',
                    db
                      ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400'
                      : 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
                  )}>
                    <Database className="size-4" />
                    <span className="text-[10px] font-semibold">Base de datos</span>
                    {db
                      ? <span className="flex items-center gap-0.5 text-[10px]"><CheckCircle2 className="size-3" />ID {db.id_image}</span>
                      : <span className="flex items-center gap-0.5 text-[10px]"><AlertTriangle className="size-3" />Sin registro</span>
                    }
                  </div>
                </div>
              </div>

              <Separator />

              {/* Metadata */}
              <div className="px-5 py-4 flex flex-col gap-2">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Información</p>
                <div className="flex flex-col gap-1.5">
                  <Row label="Carpeta"     value={file.folder} />
                  {db?.image_name   && <Row label="Nombre"     value={db.image_name} />}
                  {db?.image_title  && <Row label="Título"     value={db.image_title} />}
                  {db?.image_alt    && <Row label="Alt"        value={db.image_alt} />}
                  {db?.image_type   && <Row label="Tipo"       value={db.image_type} />}
                  {db?.image_size  != null && <Row label="Tamaño" value={formatBytes(db.image_size)} />}
                  {db?.image_width != null && db?.image_height != null && (
                    <Row label="Dimensiones" value={`${db.image_width} × ${db.image_height} px`} />
                  )}
                  {dateStr && (
                    <Row label="Modificado" value={dateStr} icon={<Calendar className="size-3 shrink-0" />} />
                  )}
                  {db?.image_created_at && <Row label="Subida" value={db.image_created_at} />}
                </div>
              </div>

              <Separator />

              {/* URL */}
              <div className="px-5 py-4">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">URL</p>
                <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2">
                  <span className="flex-1 truncate text-xs text-muted-foreground">{file.url}</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="icon" variant="ghost" className="size-6 shrink-0" onClick={copyUrl}>
                        <Copy className="size-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copiar URL</TooltipContent>
                  </Tooltip>
                </div>
              </div>

              <Separator />

              {/* Actions */}
              <div className="px-5 py-4 flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start gap-2"
                  asChild
                >
                  <a href={file.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="size-4" />
                    Abrir en nueva pestaña
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start gap-2"
                  onClick={() => setMoveOpen(true)}
                >
                  <FolderInput className="size-4" />
                  Mover / Renombrar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start gap-2 text-destructive hover:text-destructive hover:border-destructive/50 hover:bg-destructive/5"
                  onClick={() => setActionOpen(true)}
                >
                  <Trash2 className="size-4" />
                  Eliminar
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lightbox — fuera del Dialog para evitar conflictos */}
      {file.isImage && (
        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          slides={[{ src: file.url, alt: db?.image_alt ?? file.filename }]}
          plugins={[Zoom, Thumbnails]}
          controller={{ closeOnBackdropClick: true }}
          zoom={{ maxZoomPixelRatio: 4 }}
          thumbnails={{ position: 'bottom', width: 80, height: 52, gap: 8, border: 0, borderRadius: 6 }}
          styles={{ root: { '--yarl__color_backdrop': 'rgba(0,0,0,0.94)' } }}
        />
      )}

      <StorageActionDialog
        file={file}
        open={actionOpen}
        onClose={() => setActionOpen(false)}
      />

      <StorageMoveDialog
        file={file}
        open={moveOpen}
        onClose={() => setMoveOpen(false)}
      />
    </>
  )
}

function Row({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
      <span className="flex items-center gap-1 text-right text-xs font-medium break-all">
        {icon}{value}
      </span>
    </div>
  )
}
