'use client'

import { useLandingPreviewVisibility } from './use-landing-preview-visibility'

// Reserva espacio REAL en el layout (un hermano más del flex-row que arma SidebarProvider,
// junto a AppSidebar y SidebarInset) cuando el panel está abierto — así `SidebarInset` (que ya
// es `flex-1`) se achica de verdad como una sola caja, header de cada página incluido.
//
// Bug real que costó encontrar: la primera versión de esto empujaba con `padding` en vez de
// reservar espacio con un hermano — pero `padding` solo corre el CONTENIDO hacia adentro, no
// achica la caja de `SidebarInset` en sí (que tiene sus propias esquinas redondeadas/sombra,
// ver sidebar.tsx). Quedaba un hueco vacío entre el header (ya angosto, por `w-[inherit]`) y el
// borde real de esa caja — el "corte" raro que se veía. Con un hermano de verdad en el flex-row,
// flexbox recalcula el ancho de TODA la caja de una — no hace falta ningún parche en Header.
export function LandingPreviewSpacer() {
  const { occupiesLayoutSpace, widthPx } = useLandingPreviewVisibility()
  return (
    <div
      aria-hidden
      className="hidden shrink-0 transition-[width] duration-200 md:block"
      style={{ width: occupiesLayoutSpace ? widthPx : 0 }}
    />
  )
}
