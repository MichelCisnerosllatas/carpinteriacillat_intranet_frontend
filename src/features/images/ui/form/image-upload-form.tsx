'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Lightbox from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails'
import 'yet-another-react-lightbox/styles.css'
import 'yet-another-react-lightbox/plugins/thumbnails.css'
import {
  AlertCircle, CheckCircle2, Folder, FolderPlus, ImagePlus, Loader2,
  Plus, StopCircle, Upload, X, XCircle,
} from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Label } from '@/shared/ui/label'
import { Card, CardContent } from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/shared/ui/dropdown-menu'
import { toastSuccess, toastError, toastInfo } from '@/shared/lib/toast'
import { imagesService } from '../../services/images.service'
import { useImageSelectStore } from '../../stores/useImageSelectStore'
import { useImageListStore } from '../../stores/useImageListStore'
import { FolderPicker } from '@/shared/ui/folder-picker'
import { cn } from '@/shared/lib/utils'
import { DropZone } from './image-drop-zone'

type FileStatus = 'pending' | 'uploading' | 'done' | 'error'

type FileEntry = {
  id:          string
  file:        File
  preview:     string | null
  status:      FileStatus
  error?:      string
  relativeDir: string
}

let idCounter = 0
const nextId  = () => String(++idCounter)

// Extensiones de imagen que algunos navegadores no reconocen por MIME type (file.type
// llega vacío o distinto de "image/..."), notablemente HEIC/HEIF de iPhone. Se validan
// también por extensión para no descartarlas en silencio.
const IMAGE_EXTENSIONS = new Set([
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'avif', 'tif', 'tiff', 'heic', 'heif',
])

const isImageFile = (file: File) => {
  if (file.type.startsWith('image/')) return true
  const ext = file.name.split('.').pop()?.toLowerCase()
  return !!ext && IMAGE_EXTENSIONS.has(ext)
}

// Cuántos archivos se procesan por lote antes de ceder el hilo al navegador. Con una
// carpeta de miles de fotos (típico al elegirla desde el celular), crear todas las
// miniaturas de una sola pasada síncrona congela la pestaña sin poder pintar ningún
// indicador de carga — de a lotes, React puede pintar el progreso entre cada uno.
const PROCESS_CHUNK_SIZE = 30

// "Fotos Cocina 2024" → "fotos_cocina_2024"
const normalizeFolderSegment = (segment: string) =>
  segment.trim().toLowerCase().replace(/\s+/g, '_')

// Reconstruye la subcarpeta de origen a partir de webkitRelativePath (solo presente
// cuando el archivo viene de una selección de carpeta, no de archivos sueltos).
const getRelativeDir = (file: File): string => {
  const relativePath = (file as File & { webkitRelativePath?: string }).webkitRelativePath
  if (!relativePath) return ''
  return relativePath
    .split('/')
    .slice(0, -1)
    .map(normalizeFolderSegment)
    .filter(Boolean)
    .join('/')
}

export function ImageUploadForm() {
  const router = useRouter()
  const { reload }           = useImageSelectStore()
  const { load: reloadList } = useImageListStore()

  const [entries,     setEntries]     = useState<FileEntry[]>([])
  const [folder,      setFolder]      = useState('')
  const [dragOver,    setDragOver]    = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [lightboxIdx, setLightboxIdx] = useState(-1)
  const [previewErrors, setPreviewErrors] = useState<Set<string>>(new Set())
  const [isProcessingFiles, setIsProcessingFiles] = useState(false)
  const [processProgress,   setProcessProgress]   = useState({ done: 0, total: 0 })
  const inputRef = useRef<HTMLInputElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Un solo input nativo: alternamos su modo (archivos sueltos ↔ carpeta completa)
  // justo antes de abrirlo, según lo que el usuario elija en el menú.
  const openPicker = (mode: 'files' | 'folder') => {
    const el = inputRef.current
    if (!el) return
    if (mode === 'folder') {
      el.webkitdirectory = true
      el.setAttribute('directory', '')
    } else {
      el.webkitdirectory = false
      el.removeAttribute('directory')
    }
    el.click()
  }

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      entries.forEach((e) => { if (e.preview) URL.revokeObjectURL(e.preview) })
    }
  }, [])

  const addFiles = async (files: File[]) => {
    const imageFiles = files.filter(isImageFile)
    const skipped    = files.length - imageFiles.length

    if (imageFiles.length === 0) {
      if (skipped > 0) {
        toastError(
          'Sin imágenes válidas',
          `${skipped} archivo${skipped !== 1 ? 's' : ''} no ${skipped !== 1 ? 'son imágenes' : 'es una imagen'} y se omitió${skipped !== 1 ? 'eron' : ''}.`,
        )
      }
      return
    }

    setIsProcessingFiles(true)
    setProcessProgress({ done: 0, total: imageFiles.length })

    // De a lotes: crear miles de object URLs y agregarlos todos de una sola vez congela
    // la pestaña sin pintar ningún indicador. Entre lote y lote se cede el hilo (setTimeout
    // 0) para que React tenga oportunidad de pintar el progreso — y de paso, la grilla se
    // va llenando en vivo en vez de aparecer toda junta al final.
    for (let i = 0; i < imageFiles.length; i += PROCESS_CHUNK_SIZE) {
      const chunk: FileEntry[] = imageFiles.slice(i, i + PROCESS_CHUNK_SIZE).map((file) => ({
        id:          nextId(),
        file,
        preview:     URL.createObjectURL(file),
        status:      'pending',
        relativeDir: getRelativeDir(file),
      }))
      setEntries((prev) => [...prev, ...chunk])
      setProcessProgress({ done: Math.min(i + PROCESS_CHUNK_SIZE, imageFiles.length), total: imageFiles.length })
      await new Promise((resolve) => setTimeout(resolve, 0))
    }

    setIsProcessingFiles(false)

    if (skipped > 0) {
      toastInfo(
        'Algunos archivos se omitieron',
        `${skipped} archivo${skipped !== 1 ? 's' : ''} no ${skipped !== 1 ? 'son imágenes' : 'es una imagen'} y no se agregó${skipped !== 1 ? 'aron' : ''} a la lista.`,
      )
    }
  }

  const removeEntry = (id: string) => {
    setEntries((prev) => {
      const entry = prev.find((e) => e.id === id)
      if (entry?.preview) URL.revokeObjectURL(entry.preview)
      return prev.filter((e) => e.id !== id)
    })
  }

  const removeGroup = (relativeDir: string) => {
    setEntries((prev) => {
      prev
        .filter((e) => e.relativeDir === relativeDir && e.preview)
        .forEach((e) => URL.revokeObjectURL(e.preview!))
      return prev.filter((e) => e.relativeDir !== relativeDir)
    })
  }

  const updateStatus = (id: string, status: FileStatus, error?: string) => {
    setEntries((prev) => prev.map((e) => e.id === id ? { ...e, status, error } : e))
  }

  const handleAbort = () => {
    abortRef.current?.abort()
  }

  const handleUpload = async () => {
    const pending = entries.filter((e) => e.status === 'pending' || e.status === 'error')
    if (!pending.length) return
    if (!folder.trim()) {
      toastError('Falta la carpeta destino', 'Selecciona una carpeta antes de subir las imágenes.')
      return
    }

    abortRef.current = new AbortController()
    const { signal } = abortRef.current
    setIsUploading(true)

    let done   = 0
    let errors = 0

    for (const entry of pending) {
      if (signal.aborted) {
        updateStatus(entry.id, 'pending')
        continue
      }

      updateStatus(entry.id, 'uploading')
      try {
        const name          = entry.file.name.replace(/\.[^/.]+$/, '')
        const combinedFolder = [folder.trim(), entry.relativeDir].filter(Boolean).join('/')
        const res  = await imagesService.post({
          image:       entry.file,
          image_name:  name,
          image_title: name,
          image_alt:   name,
          folder:      combinedFolder || undefined,
        })

        if (res.success) {
          done++
          updateStatus(entry.id, 'done')
        } else {
          errors++
          updateStatus(entry.id, 'error', res.message)
          abortRef.current?.abort()
        }
      } catch (err: any) {
        const isCanceled = err?.code === 'ERR_CANCELED' || err?.name === 'CanceledError' || err?.name === 'AbortError'
        if (isCanceled) {
          updateStatus(entry.id, 'pending')
        } else {
          errors++
          updateStatus(entry.id, 'error', err?.response?.data?.message ?? err?.message ?? 'Error al subir')
          abortRef.current?.abort()
        }
      }
    }

    setIsUploading(false)
    abortRef.current = null

    if (done > 0) {
      await Promise.all([reload(), reloadList({ page: 1 })])
    }

    if (done > 0 && errors === 0) {
      toastSuccess('Imágenes registradas', `${done} imagen${done !== 1 ? 'es' : ''} guardada${done !== 1 ? 's' : ''} correctamente.`)
      router.push('/images')
    } else if (errors > 0) {
      toastError('Subida parcial', `${done} correcta${done !== 1 ? 's' : ''}, ${errors} con error.`)
    }
  }

  const doneCount    = entries.filter((e) => e.status === 'done').length
  const errorCount   = entries.filter((e) => e.status === 'error').length
  const pendingCount = entries.filter((e) => e.status === 'pending').length
  const totalCount   = entries.length
  const allDone      = totalCount > 0 && doneCount + errorCount === totalCount

  // Agrupa las miniaturas por carpeta de origen — "Sin carpeta" (sueltas) siempre primero
  const groupKeys: string[] = []
  entries.forEach((e) => { if (!groupKeys.includes(e.relativeDir)) groupKeys.push(e.relativeDir) })
  groupKeys.sort((a, b) => (a === '' ? -1 : b === '' ? 1 : 0))
  const groups = groupKeys.map((key) => ({
    key,
    entries: entries.filter((e) => e.relativeDir === key),
  }))

  // Lightbox slides (solo entradas con preview) — mismo orden en que se renderizan los grupos
  const orderedEntries  = groups.flatMap((g) => g.entries)
  const previewEntries  = orderedEntries.filter((e) => e.preview && !previewErrors.has(e.id))
  const lightboxSlides  = previewEntries.map((e) => ({ src: e.preview!, alt: e.file.name }))
  const getLbIdx        = (entryId: string) => previewEntries.findIndex((e) => e.id === entryId)

  const progress = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0

  return (
    <>
      <form
        onSubmit={(e) => { e.preventDefault(); void handleUpload() }}
        className="flex flex-col gap-4 max-w-2xl"
      >
        <Card>
          <CardContent className="flex flex-col gap-3">

            {/* Indicador de carga al procesar archivos — con una carpeta de miles de fotos
                (típico al elegirla desde el celular), armar todas las miniaturas tarda y,
                sin este aviso, la pantalla parecía trabada sin dar ninguna señal. */}
            {isProcessingFiles && (
              <div className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2.5 text-xs text-muted-foreground">
                <Loader2 className="size-4 shrink-0 animate-spin" />
                Procesando {processProgress.done} de {processProgress.total} imagen{processProgress.total !== 1 ? 'es' : ''}...
              </div>
            )}

            {/* ── Estado vacío: un solo selector — al hacer clic, elige qué agregar ── */}
            {totalCount === 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild disabled={isUploading || isProcessingFiles}>
                  <DropZone
                    dragOver={dragOver}
                    onDragOver={() => setDragOver(true)}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(files) => { setDragOver(false); void addFiles(files) }}
                    onClick={() => {}}
                    disabled={isUploading || isProcessingFiles}
                    compact={false}
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-72">
                  {/* Resaltado propio: el hover/focus por defecto (accent-warm) casi no
                      se distingue del fondo del menú (blanco en modo claro) — se reutiliza
                      el mismo ámbar ya usado para la carpeta activa en el árbol de carpetas,
                      con más contraste, para que sea visible al tocar/pasar el mouse. */}
                  <DropdownMenuItem
                    onClick={() => openPicker('files')}
                    className="hover:bg-amber-100 hover:text-amber-800 focus:bg-amber-100 focus:text-amber-800 dark:hover:bg-amber-950/40 dark:hover:text-amber-300 dark:focus:bg-amber-950/40 dark:focus:text-amber-300"
                  >
                    <ImagePlus className="text-muted-foreground" />
                    <div className="flex flex-col">
                      <span>Imágenes sueltas</span>
                      <span className="text-[11px] font-normal text-muted-foreground">navega y elige varias, con vista previa</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => openPicker('folder')}
                    className="hover:bg-amber-100 hover:text-amber-800 focus:bg-amber-100 focus:text-amber-800 dark:hover:bg-amber-950/40 dark:hover:text-amber-300 dark:focus:bg-amber-950/40 dark:focus:text-amber-300"
                  >
                    <FolderPlus className="text-muted-foreground" />
                    <div className="flex flex-col">
                      <span>Carpeta completa</span>
                      <span className="text-[11px] font-normal text-muted-foreground">recorre subcarpetas automáticamente</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* ── Con archivos: agrupado por carpeta de origen, con scroll ── */}
            {totalCount > 0 && (
              <div className="max-h-[min(60vh,520px)] overflow-y-auto rounded-xl pr-0.5">
                <div className="flex flex-col gap-4">
                  {groups.map((group) => {
                    const groupPending = group.entries.every((e) => e.status === 'pending')
                    return (
                      <div
                        key={group.key || '__loose__'}
                        className={cn(
                          'flex flex-col gap-2.5 rounded-xl p-2.5 ring-1',
                          group.key
                            ? 'bg-amber-50/60 ring-amber-200/70 dark:bg-amber-950/10 dark:ring-amber-900/40'
                            : 'bg-muted/30 ring-border/60',
                        )}
                      >
                        {/* Encabezado del grupo */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex min-w-0 items-center gap-2">
                            <div className={cn(
                              'flex size-6 shrink-0 items-center justify-center rounded-md',
                              group.key ? 'bg-amber-100 dark:bg-amber-900/40' : 'bg-background',
                            )}>
                              {group.key
                                ? <Folder className="size-3.5 text-amber-600 dark:text-amber-400" />
                                : <ImagePlus className="size-3.5 text-muted-foreground" />}
                            </div>
                            <span className="truncate text-xs font-medium">
                              {group.key || 'Imágenes sueltas'}
                            </span>
                            <span className="shrink-0 rounded-full bg-background/80 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground ring-1 ring-border/60">
                              {group.entries.length}
                            </span>
                          </div>
                          {!isUploading && !allDone && groupPending && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  type="button"
                                  onClick={() => removeGroup(group.key)}
                                  className="flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive pointer-coarse:size-9"
                                >
                                  <X className="size-3.5 pointer-coarse:size-4" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>Quitar {group.key ? 'esta carpeta' : 'estas imágenes'}</TooltipContent>
                            </Tooltip>
                          )}
                        </div>

                        {/* auto-fill con un mínimo de 110px: antes las columnas subían con
                            totalCount (4→5→6) y las miniaturas se iban achicando cuanta más
                            imágenes había. Con auto-fill nunca bajan de ese tamaño mínimo —
                            si no entran todas en una fila, bajan de línea en vez de encogerse. */}
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-2">
                          {group.entries.map((entry) => {
                            const lbIdx = getLbIdx(entry.id)
                            return (
                              <div
                                key={entry.id}
                                className={cn(
                                  'group relative aspect-square overflow-hidden rounded-xl ring-1 ring-border',
                                  entry.status === 'done'      && 'ring-emerald-400',
                                  entry.status === 'error'     && 'ring-destructive',
                                  entry.status === 'uploading' && 'ring-primary',
                                )}
                              >
                                {/* Miniatura — clic abre lightbox. Si el navegador no puede decodificar
                                    el archivo (ej. HEIC de iPhone: es una imagen válida, pero la mayoría
                                    de navegadores de escritorio no la renderizan vía <img>), se cae a un
                                    ícono en vez de mostrar una imagen rota — igual sigue en la lista y se
                                    intenta subir normalmente. */}
                                {entry.preview && !previewErrors.has(entry.id) ? (
                                  <button
                                    type="button"
                                    onClick={() => entry.status !== 'uploading' && setLightboxIdx(lbIdx)}
                                    className={cn(
                                      'h-full w-full',
                                      entry.status !== 'uploading' && 'cursor-zoom-in',
                                    )}
                                  >
                                    <img
                                      src={entry.preview}
                                      alt={entry.file.name}
                                      className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                                      onError={() => setPreviewErrors((prev) => new Set(prev).add(entry.id))}
                                    />
                                  </button>
                                ) : (
                                  <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-muted p-1 text-center">
                                    <ImagePlus className="size-5 text-muted-foreground" />
                                    {previewErrors.has(entry.id) && (
                                      <span className="text-[8px] leading-tight text-muted-foreground">Sin vista previa</span>
                                    )}
                                  </div>
                                )}

                                {/* Overlay oscuro en hover (solo pending) */}
                                {entry.status === 'pending' && (
                                  <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/30" />
                                )}

                                {/* Botón X — en touch siempre visible y con área de toque de
                                    36px (antes 24px, oculto detrás de :hover e inalcanzable
                                    con el dedo); con mouse, visible en hover como antes */}
                                {entry.status === 'pending' && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); removeEntry(entry.id) }}
                                        disabled={isUploading}
                                        className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-sm transition-opacity duration-150 hover:bg-red-500 group-hover:opacity-100 disabled:cursor-not-allowed pointer-coarse:size-9 pointer-coarse:opacity-100 pointer-coarse:bg-black/60"
                                      >
                                        <X className="size-3.5 pointer-coarse:size-4" />
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent>Quitar de la lista</TooltipContent>
                                  </Tooltip>
                                )}

                                {/* Status overlays */}
                                {entry.status === 'uploading' && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                                    <Loader2 className="size-6 animate-spin text-white" />
                                  </div>
                                )}
                                {entry.status === 'done' && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/30 backdrop-blur-[1px]">
                                    <CheckCircle2 className="size-6 text-white drop-shadow" />
                                  </div>
                                )}
                                {entry.status === 'error' && (
                                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-destructive/60 backdrop-blur-[1px] p-1.5">
                                    <XCircle className="size-5 text-white" />
                                    {entry.error && (
                                      <p className="line-clamp-2 text-center text-[9px] leading-tight text-white">{entry.error}</p>
                                    )}
                                  </div>
                                )}

                                {/* Nombre del archivo — en touch siempre visible (no hay :hover
                                    para revelarlo); con mouse, aparece en hover como antes */}
                                {entry.status === 'pending' && (
                                  <div className="pointer-events-none absolute bottom-0 left-0 right-0 translate-y-full rounded-b-xl bg-black/80 px-2 py-1 text-[9px] text-white transition-transform group-hover:translate-y-0 truncate pointer-coarse:translate-y-0">
                                    {entry.file.name}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Botón para agregar más, una vez ya hay archivos en la lista */}
            {totalCount > 0 && !isUploading && !allDone && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild disabled={isProcessingFiles}>
                  <Button type="button" variant="outline" size="sm" className="self-start" disabled={isProcessingFiles}>
                    <Plus className="mr-1.5 size-3.5" />
                    Agregar más
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-72">
                  {/* Resaltado propio: el hover/focus por defecto (accent-warm) casi no
                      se distingue del fondo del menú (blanco en modo claro) — se reutiliza
                      el mismo ámbar ya usado para la carpeta activa en el árbol de carpetas,
                      con más contraste, para que sea visible al tocar/pasar el mouse. */}
                  <DropdownMenuItem
                    onClick={() => openPicker('files')}
                    className="hover:bg-amber-100 hover:text-amber-800 focus:bg-amber-100 focus:text-amber-800 dark:hover:bg-amber-950/40 dark:hover:text-amber-300 dark:focus:bg-amber-950/40 dark:focus:text-amber-300"
                  >
                    <ImagePlus className="text-muted-foreground" />
                    <div className="flex flex-col">
                      <span>Imágenes sueltas</span>
                      <span className="text-[11px] font-normal text-muted-foreground">navega y elige varias, con vista previa</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => openPicker('folder')}
                    className="hover:bg-amber-100 hover:text-amber-800 focus:bg-amber-100 focus:text-amber-800 dark:hover:bg-amber-950/40 dark:hover:text-amber-300 dark:focus:bg-amber-950/40 dark:focus:text-amber-300"
                  >
                    <FolderPlus className="text-muted-foreground" />
                    <div className="flex flex-col">
                      <span>Carpeta completa</span>
                      <span className="text-[11px] font-normal text-muted-foreground">recorre subcarpetas automáticamente</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Input oculto — un solo <input>, alterna entre modo "archivos" y "carpeta" (ver openPicker) */}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) {
                  const files = Array.from(e.target.files)
                  const folderRelPath = (files[0] as File & { webkitRelativePath?: string })?.webkitRelativePath
                  const folderName    = folderRelPath?.split('/')[0]
                  if (folderName) {
                    toastInfo(`Carpeta "${folderName}" agregada`, '¿Tienes más carpetas? Usa el mismo botón para seleccionar otra.')
                  }
                  void addFiles(files)
                }
                e.target.value = ''
              }}
            />

            {/* Zona de arrastre secundaria cuando ya hay archivos */}
            {totalCount > 0 && !isUploading && !allDone && (
              <div
                className={cn(
                  'hidden items-center justify-center rounded-xl border-2 border-dashed p-3 text-xs text-muted-foreground transition-colors',
                  dragOver && '!flex border-primary bg-primary/5 text-primary',
                )}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); void addFiles(Array.from(e.dataTransfer.files)) }}
              />
            )}

            {/* Barra de progreso */}
            {isUploading && (
              <div className="flex flex-col gap-1.5">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-center text-xs text-muted-foreground">
                  {doneCount} de {totalCount} completado{doneCount !== 1 ? 's' : ''}
                </p>
              </div>
            )}

            {/* Resumen al terminar */}
            {allDone && !isUploading && (
              <div className={cn(
                'flex items-center gap-2 rounded-xl px-4 py-3 text-sm',
                errorCount === 0
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
              )}>
                {errorCount === 0
                  ? <CheckCircle2 className="size-4 shrink-0" />
                  : <AlertCircle className="size-4 shrink-0" />}
                <span>
                  {doneCount > 0 && `${doneCount} imagen${doneCount !== 1 ? 'es' : ''} registrada${doneCount !== 1 ? 's' : ''} correctamente.`}
                  {errorCount > 0 && ` ${errorCount} con error.`}
                </span>
              </div>
            )}

            {/* Carpeta destino — distinta de la carpeta de origen elegida arriba: esta es la
                carpeta del servidor donde se guardarán las imágenes, y es obligatoria. */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">
                Carpeta destino <span className="text-destructive">*</span>
                <span className="ml-1 text-muted-foreground">
                  (si subiste una carpeta, se usa como raíz y se conserva su estructura interna)
                </span>
              </Label>
              <FolderPicker
                value={folder || undefined}
                onChange={setFolder}
                placeholder="Seleccionar carpeta destino..."
                disabled={isUploading}
                rootPath="images"
                className={cn(
                  totalCount > 0 && !folder.trim() && !isUploading &&
                    'border-destructive/60 ring-1 ring-destructive/30',
                )}
              />
              {totalCount > 0 && !folder.trim() && !isUploading && (
                <p className="text-[11px] text-destructive">
                  Falta elegir la carpeta destino — el botón &quot;Subir&quot; se activa recién cuando la selecciones.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Acciones */}
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            {!allDone && pendingCount > 0 && `${pendingCount} pendiente${pendingCount !== 1 ? 's' : ''}`}
            {errorCount > 0 && ` · ${errorCount} con error`}
          </p>
          <div className="flex gap-2">
            {isUploading ? (
              <Button type="button" variant="destructive" size="sm" onClick={handleAbort}>
                <StopCircle className="mr-2 size-4" />
                Cancelar subida
              </Button>
            ) : (
              <>
                <Button type="button" variant="outline" size="sm" onClick={() => router.push('/images')}>
                  {allDone ? 'Ir a galería' : 'Cancelar'}
                </Button>
                {!allDone && (
                  <Button type="submit" size="sm" disabled={pendingCount === 0 || !folder.trim()}>
                    <Upload className="mr-2 size-4" />
                    {pendingCount > 1 ? `Subir ${pendingCount} imágenes` : 'Subir imagen'}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </form>

      {/* Lightbox — fuera del form para evitar conflictos de eventos */}
      <Lightbox
        open={lightboxIdx >= 0}
        close={() => setLightboxIdx(-1)}
        index={lightboxIdx}
        slides={lightboxSlides}
        plugins={[Zoom, Thumbnails]}
        controller={{ closeOnBackdropClick: true }}
        zoom={{ maxZoomPixelRatio: 4 }}
        thumbnails={{ position: 'bottom', width: 72, height: 48, gap: 8, border: 0, borderRadius: 6 }}
        styles={{ root: { '--yarl__color_backdrop': 'rgba(0,0,0,0.92)' } }}
      />
    </>
  )
}
