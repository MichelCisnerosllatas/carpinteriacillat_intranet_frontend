'use client'

import { useEffect, useRef } from 'react'
import { usePreviewStore } from '@/shared/stores/preview-store'

const WEB_PREVIEW_URL = process.env.NEXT_PUBLIC_WEB_PREVIEW_URL ?? ''

function getWebOrigin(): string | null {
  if (!WEB_PREVIEW_URL) return null
  try {
    return new URL(WEB_PREVIEW_URL).origin
  } catch {
    return null
  }
}

type Props = {
  // Lo pone landing-preview-device-frame.tsx cuando el modo dispositivo necesita un tamaño en
  // píxeles exacto (para poder escalarlo después) — sin esto, llena el 100% de su contenedor
  // (comportamiento normal, modo "Auto").
  style?: React.CSSProperties
}

// Dueño único del <iframe> — maneja el handshake ("ready") y reenvía el último mensaje
// (payload del formulario/detalle montado o foco por ruta, usePreviewStore.lastMessage) cada
// vez que cambia. Ver
// landing-preview.types.ts para el contrato del mensaje. No sabe nada de tamaños de
// dispositivo/zoom — eso lo decide quien lo use, ver landing-preview-device-frame.tsx.
export function LandingPreviewIframe({ style }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const lastMessage = usePreviewStore((s) => s.lastMessage)
  const iframeReady = usePreviewStore((s) => s.iframeReady)
  const setIframeReady = usePreviewStore((s) => s.setIframeReady)
  const setResolvedNavigationUrl = usePreviewStore((s) => s.setResolvedNavigationUrl)
  const reloadToken = usePreviewStore((s) => s.reloadToken)
  const webOrigin = getWebOrigin()

  useEffect(() => {
    if (!webOrigin) return
    function handleMessage(event: MessageEvent) {
      if (event.origin !== webOrigin) return
      if (event.data?.source !== 'cillat-web-preview') return
      if (event.data.type === 'ready') setIframeReady(true)
      if (event.data.type === 'active-url') setResolvedNavigationUrl(event.data.navigationUrl)
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [webOrigin, setIframeReady, setResolvedNavigationUrl])

  useEffect(() => {
    if (!webOrigin || !iframeReady || !lastMessage) return
    iframeRef.current?.contentWindow?.postMessage({ source: 'cillat-intranet-preview', ...lastMessage }, webOrigin)
  }, [webOrigin, iframeReady, lastMessage])

  if (!webOrigin) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-center text-sm text-muted-foreground">
        Falta configurar <code className="mx-1 rounded bg-muted px-1 py-0.5">NEXT_PUBLIC_WEB_PREVIEW_URL</code> en el .env del intranet.
      </div>
    )
  }

  return (
    <iframe
      ref={iframeRef}
      // `reloadToken` en la key: es la única forma confiable de forzar un reload real de un
      // iframe cross-origin (cambiar `src` al mismo valor no dispara nada) — React lo
      // desmonta y monta uno nuevo desde cero, con su propio handshake "ready".
      key={reloadToken}
      src={`${WEB_PREVIEW_URL}/preview`}
      title="Vista previa del sitio"
      className="h-full w-full border-0"
      style={style}
      // OJO: no resetear `iframeReady` acá en `onLoad` — el evento nativo `load` del iframe
      // dispara siempre en la carga inicial, y su orden respecto al "ready" que postea el
      // hijo (dentro de React, no del evento `load` del navegador) no está garantizado. Si
      // `onLoad` llegara a correr DESPUÉS del "ready", lo pisaría a `false` para siempre (el
      // hijo solo lo manda una vez) y el iframe quedaría sordo — bug real que pasó en pruebas.
    />
  )
}
