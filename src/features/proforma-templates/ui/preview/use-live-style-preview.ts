import { useEffect, useRef, useState } from 'react'
import type { FieldValues, UseFormReturn } from 'react-hook-form'
import { proformasService } from '@/features/proformas'

// Vista previa en vivo: POST /proformas/preview-style con los estilos actuales del
// formulario (sin guardar nada). Funciona desde el primer render, con o sin plantilla
// guardada — no depende de tener un id. Se dispara cuando `ready` pasa a true, y en
// cada cambio del formulario (debounced).
export function useLiveStylePreview<T extends FieldValues>(
  form: UseFormReturn<T>,
  toStylePayload: (values: T) => Record<string, unknown>,
  ready: boolean
) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const blobUrlRef = useRef<string | null>(null)
  const seqRef = useRef(0)
  const abortRef = useRef<AbortController | null>(null)

  const refresh = async (values: T) => {
    // Cancela cualquier preview anterior todavía en curso — nunca debe haber más de una
    // request en vuelo a la vez (el backend local procesa una por una y se apilan).
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    const seq = ++seqRef.current
    setIsLoading(true)
    try {
      const blob = await proformasService.getPreviewStylePdf(
        toStylePayload(values),
        controller.signal
      )
      if (seq !== seqRef.current) return
      const nextUrl = URL.createObjectURL(blob)
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current)
      blobUrlRef.current = nextUrl
      setPreviewUrl(nextUrl)
    } catch (err: any) {
      if (err?.code === 'ERR_CANCELED') return // cancelado a propósito por un cambio más reciente
      console.error('[preview-style] error al generar la vista previa:', err)
    } finally {
      if (seq === seqRef.current) setIsLoading(false)
    }
  }

  useEffect(() => {
    if (ready) void refresh(form.getValues())
  }, [ready])

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    const subscription = form.watch((values) => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => void refresh(values as T), 600)
    })
    return () => {
      if (timer) clearTimeout(timer)
      subscription.unsubscribe()
    }
  }, [])

  useEffect(
    () => () => {
      abortRef.current?.abort()
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current)
    },
    []
  )

  return { previewUrl, isLoading, refresh: () => refresh(form.getValues()) }
}
