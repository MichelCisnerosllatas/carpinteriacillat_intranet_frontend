import { useEffect, useRef } from 'react'
import { usePreviewStore } from '@/shared/stores/preview-store'
import type { PreviewPayload } from '@/widgets/landing-preview/landing-preview.types'

// Para páginas de SOLO LECTURA (detalle) — no hay un form.watch() que dispare el envío (ver
// use-live-site-preview.ts, la versión para formularios), así que alcanza con postear el
// payload una vez cuando el registro que se está VIENDO cambia. A propósito NO se dispara en
// cada render: si lo hiciera, cambiar de tab (que no toca el registro) volvería a mandar el
// mismo payload y reiniciaría el scrollIntoView del lado del sitio web sin ningún motivo real.
export function usePreviewOnView(recordId: number | string | null | undefined, toPreviewPayload: () => PreviewPayload) {
  const postPreview = usePreviewStore((s) => s.postPreview)
  // Mismo motivo que en use-live-site-preview.ts: sin este ref, el efecto de abajo (que solo
  // debe repetirse cuando cambia `recordId`) quedaría con el closure del primer render.
  const toPreviewPayloadRef = useRef(toPreviewPayload)
  useEffect(() => {
    toPreviewPayloadRef.current = toPreviewPayload
  })

  useEffect(() => {
    if (recordId == null) return
    postPreview(toPreviewPayloadRef.current())
  }, [recordId, postPreview])
}
