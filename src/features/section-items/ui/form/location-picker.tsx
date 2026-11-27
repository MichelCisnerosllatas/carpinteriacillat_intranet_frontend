'use client'

import dynamic from 'next/dynamic'

// `leaflet` toca `window`/`document` apenas se importa — solo puede cargar en el cliente, nunca
// durante el render en el servidor de Next. `ssr: false` es obligatorio acá, no una optimización.
export const LocationPicker = dynamic(
  () => import('@/shared/ui/location-picker/location-picker').then((m) => m.LocationPicker),
  { ssr: false, loading: () => <div className="flex h-64 w-full items-center justify-center rounded-lg border bg-muted/40 text-sm text-muted-foreground">Cargando mapa...</div> }
)
