'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, Eye, EyeOff, Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { cn } from '@/shared/lib/utils'

interface TemplatePreviewCardProps {
  previewUrl: string | null
  isLoading: boolean
  isError?: boolean
  onRefresh: () => void
  emptyMessage?: string
  // Solo el formulario (mobile) pasa estos dos — el detalle de una plantilla guardada no los
  // necesita y el botón de ojo simplemente no se muestra.
  isVisible?: boolean
  onToggleVisible?: () => void
}

// Componente reutilizable: se usa tanto en el formulario de edición (preview en vivo,
// sin guardar) como en el detalle (preview de una plantilla ya guardada) — ambos casos
// solo necesitan mostrar una URL de PDF dentro de un iframe con un botón de refrescar.
export function TemplatePreviewCard({
  previewUrl,
  isLoading,
  isError = false,
  onRefresh,
  emptyMessage,
  isVisible = true,
  onToggleVisible,
}: TemplatePreviewCardProps) {
  // El PDF real puede tardar en renderizarse DENTRO del iframe (es una navegación aparte
  // del navegador, no la request que trae la URL/blob) — sin esto se ve en blanco un buen
  // rato aunque `isLoading` ya haya terminado.
  const [isRendering, setIsRendering] = useState(false)

  useEffect(() => {
    if (previewUrl) setIsRendering(true)
  }, [previewUrl])

  const showOverlay = isLoading || isRendering

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm">
          Vista previa{' '}
          {!isVisible && <span className="text-muted-foreground font-normal">(oculta)</span>}
        </CardTitle>
        <div className="flex items-center gap-1">
          {onToggleVisible && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button type="button" variant="ghost" size="sm" onClick={onToggleVisible}>
                  {isVisible ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isVisible ? 'Ocultar vista previa' : 'Mostrar vista previa'}
              </TooltipContent>
            </Tooltip>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isLoading}
                onClick={onRefresh}
              >
                <RefreshCw className={isLoading ? 'size-3.5 animate-spin' : 'size-3.5'} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Regenerar vista previa</TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>
      {!isVisible ? (
        <CardContent>
          <p className="text-muted-foreground text-xs">
            La vista previa sigue generándose en segundo plano con cada cambio. Presiona el ojo para
            volver a mostrarla.
          </p>
        </CardContent>
      ) : (
        <CardContent className="flex flex-col gap-2">
          {isError && previewUrl && (
            <div className="border-destructive/40 bg-destructive/10 text-destructive flex items-center gap-2 rounded-md border px-3 py-2 text-xs">
              <AlertTriangle className="size-3.5 shrink-0" />
              No se pudo actualizar la vista previa con el último cambio. Se muestra la versión
              anterior.
            </div>
          )}
          {!previewUrl && !isLoading && isError ? (
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <AlertTriangle className="text-muted-foreground/50 size-8" />
              <p className="text-sm font-medium">No se pudo generar la vista previa</p>
              <p className="text-muted-foreground text-xs">
                Revisa tu conexión o inténtalo de nuevo en unos segundos.
              </p>
              <Button type="button" variant="outline" size="sm" onClick={onRefresh}>
                <RefreshCw className="mr-1 size-4" />
                Reintentar
              </Button>
            </div>
          ) : !previewUrl && !isLoading ? (
            <p className="text-muted-foreground text-sm">
              {emptyMessage ?? 'No se pudo cargar la vista previa.'}
            </p>
          ) : (
            <div className="relative h-[500px] w-full overflow-hidden rounded-md border">
              {previewUrl && (
                <iframe
                  src={previewUrl}
                  onLoad={() => setIsRendering(false)}
                  className="h-full w-full"
                  title="Vista previa de la plantilla"
                />
              )}
              <div
                className={cn(
                  'bg-background/90 absolute inset-0 flex flex-col items-center justify-center gap-2 transition-opacity',
                  showOverlay ? 'opacity-100' : 'pointer-events-none opacity-0'
                )}
              >
                <Loader2 className="text-primary size-8 animate-spin" />
                <p className="text-muted-foreground text-sm font-medium">Generando PDF...</p>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
