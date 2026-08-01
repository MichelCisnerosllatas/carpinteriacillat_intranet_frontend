import { Package, ZoomIn } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

interface ProductServiceThumbProps {
  imageUrl?: string | null
  alt: string
  className?: string
  /**
   * Si se pasa, la miniatura se vuelve clickeable (para abrir un preview/lightbox más grande) y
   * muestra un ícono de lupa al pasar el mouse. `stopPropagation` va incluido — seguro de usar
   * dentro de una fila que también reacciona al clic (ej. seleccionar la fila).
   * OJO: no pasar `onPreview` cuando el thumb ya vive dentro de otro <button> (ej. el trigger del
   * combobox) — anidar <button> dentro de <button> es HTML inválido.
   */
  onPreview?: () => void
}

/** Miniatura de referencia visual (imagen de portada del mueble vinculado, si existe) — usada en
 * el combobox y en el picker de productos/servicios de proformas. Sin `onPreview` es solo
 * decorativa y no afecta datos. */
export function ProductServiceThumb({
  imageUrl,
  alt,
  className,
  onPreview,
}: ProductServiceThumbProps) {
  if (!imageUrl) {
    return (
      <div
        className={cn(
          'bg-muted flex size-8 shrink-0 items-center justify-center rounded-md border',
          className
        )}
      >
        <Package className="text-muted-foreground size-3.5" />
      </div>
    )
  }

  const img = (
    <img
      src={imageUrl}
      alt={alt}
      className="size-full object-cover"
      onError={(e) => {
        ;(e.target as HTMLImageElement).style.display = 'none'
      }}
    />
  )

  if (!onPreview) {
    return (
      <div className={cn('size-8 shrink-0 overflow-hidden rounded-md border', className)}>
        {img}
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onPreview()
      }}
      className={cn(
        'group relative size-8 shrink-0 cursor-zoom-in overflow-hidden rounded-md border',
        className
      )}
    >
      {img}
      <span className="absolute inset-0 hidden items-center justify-center bg-black/40 group-hover:flex">
        <ZoomIn className="size-3.5 text-white" />
      </span>
    </button>
  )
}
