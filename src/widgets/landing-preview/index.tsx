'use client'

import { LandingPreviewShell } from './landing-preview-shell'
import { useLandingPreviewRouteFocus } from './use-landing-preview-route-focus'

// Punto de montaje único (ver src/app/(intranet)/layout-client.tsx) — vive montado para TODA la
// sesión del intranet, nunca se desmonta por navegar dentro/fuera del alcance ni por
// mostrar/ocultar el panel (eso lo resuelve LandingPreviewShell con CSS, no con un `return
// null` acá, que reiniciaría el <iframe> — ver el docblock del shell).
export function LandingPreview() {
  useLandingPreviewRouteFocus()
  return <LandingPreviewShell />
}
