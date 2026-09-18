'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { ExternalLink, MapPin } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog'

// Mismo motivo que en section-item-form.tsx: `leaflet` toca `window`/`document` apenas se
// importa, así que solo puede cargar en el cliente.
const LocationPicker = dynamic(
  () => import('./location-picker').then((m) => m.LocationPicker),
  { ssr: false, loading: () => <div className="flex h-72 w-full items-center justify-center rounded-lg border bg-muted/40 text-sm text-muted-foreground">Cargando mapa...</div> }
)

interface LocationPreviewButtonProps {
  latitude: number
  longitude: number
  /** Título del modal — ej. nombre de la sucursal. */
  label?: string
}

/**
 * Botón + modal para VER una ubicación ya guardada (item tipo "branch"/sucursal) en un mapa,
 * en vez de mostrar solo los números de latitud/longitud como texto plano. El modal solo monta
 * el mapa de Leaflet cuando se abre (`Dialog` no renderiza su contenido hasta `open`), así que
 * no hay costo si nadie lo abre.
 */
export function LocationPreviewButton({ latitude, longitude, label }: LocationPreviewButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        <MapPin className="mr-1.5 size-4" />Ver en el mapa
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><MapPin className="size-4" />{label || 'Ubicación'}</DialogTitle>
          </DialogHeader>

          <LocationPicker latitude={latitude} longitude={longitude} readOnly className="h-72 w-full rounded-lg border" />

          <DialogFooter>
            <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
              <a href={`https://www.google.com/maps?q=${latitude},${longitude}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-1.5 size-4" />Abrir en Google Maps
              </a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
