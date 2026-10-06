import { useEffect, useRef } from 'react'
import type { FieldValues, UseFormReturn } from 'react-hook-form'
import { usePreviewStore } from '@/shared/stores/preview-store'
import type { PreviewPayload } from '@/widgets/landing-preview/landing-preview.types'

// Vista previa en vivo del sitio público: en cada cambio del formulario (debounced), arma el
// payload y lo manda al panel de preview (widgets/landing-preview), que lo reenvía por
// postMessage al iframe — no hay ningún request de red de por medio (a diferencia de
// use-live-style-preview.ts, que sí le pega a un endpoint), así que no hace falta cola de
// pendientes ni AbortController: el único trabajo es no saturar de mensajes en cada tecla.
export function useLiveSitePreview<T extends FieldValues>(
  form: UseFormReturn<T>,
  toPreviewPayload: (values: T) => PreviewPayload,
  ready: boolean,
  // Campos que no afectan lo que se ve en el sitio (ej. timestamps) — cambiarlos no debería
  // reiniciar el debounce por gusto.
  excludeFields: string[] = []
) {
  const postPreview = usePreviewStore((s) => s.postPreview)

  // `form.watch` se suscribe UNA sola vez (deps [], más abajo) para no perder cambios entre
  // desuscribir/resuscribir. Si `toPreviewPayload` cerrara directo sobre esa suscripción,
  // quedaría pegado al closure del primer render — un problema real para formularios como
  // sectionimage-form.tsx, que arman el payload a partir de estado ajeno a react-hook-form
  // (la imagen seleccionada). Este ref siempre apunta a la versión más nueva — se actualiza en
  // un efecto (no durante el render) porque mutar un ref en el cuerpo del componente rompe con
  // el compilador de React de este proyecto.
  const toPreviewPayloadRef = useRef(toPreviewPayload)
  useEffect(() => {
    toPreviewPayloadRef.current = toPreviewPayload
  })

  useEffect(() => {
    if (ready) postPreview(toPreviewPayloadRef.current(form.getValues()))
    // Solo debe dispararse cuando `ready` pasa a true (mismo criterio que use-live-style-preview.ts).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready])

  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => {
    const subscription = form.watch((values, { name }) => {
      if (name && excludeFields.includes(name)) return
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => postPreview(toPreviewPayloadRef.current(values as T)), 600)
    })
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      subscription.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
