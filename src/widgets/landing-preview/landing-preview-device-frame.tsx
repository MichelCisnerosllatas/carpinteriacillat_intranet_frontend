'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/shared/lib/utils'
import { usePreviewStore } from '@/shared/stores/preview-store'
import { VIEWPORT_PRESETS } from './landing-preview-viewport'
import { LandingPreviewIframe } from './landing-preview-iframe'

// Nunca dejar que el zoom llegue a 0 o negativo (panel recién montado, todavía sin medir, o
// arrastrado a un ancho absurdamente chico) — un iframe con `scale(0)` no se puede volver a
// hacer clickeable/visible hasta el próximo resize.
const MIN_RATIO = 0.1

// Mide el espacio real disponible (con ResizeObserver, porque el panel se puede
// arrastrar/estirar en cualquier momento) y calcula el "ancho de referencia" contra el que se
// aplica el zoom:
//   - Modo dispositivo (Celular/Tablet/Escritorio): el ancho FIJO del preset — el sitio ve ESE
//     ancho para sus media queries, sin importar cuánto se lo achique visualmente después. El
//     zoom (automático o manual) solo decide cuánto se encoge para que quepa en el panel.
//   - Modo "Auto": el ancho REAL del panel — acá el zoom es "zoom de navegador" (como Ctrl+
//     rueda), nunca cambia qué layout responsive ve el sitio, solo agranda o achica la vista
//     para ver más o menos contenido de una — para eso está el selector de dispositivo, no el
//     zoom.
// Con zoom=100% (o sin `zoomOverride` en modo Auto) el resultado es matemáticamente idéntico a
// no tener ningún transform — por eso NO hay un "modo sin escalar" aparte: todo pasa siempre
// por la misma fórmula/el mismo árbol de elementos (contenedor > caja > <LandingPreviewIframe/>).
// Tener dos formas de JSX distintas (con/sin envoltorio) sería el mismo bug que ya se arregló
// una vez: React no podría reconciliar un <iframe> suelto contra uno envuelto en más divs al
// cambiar de modo, y lo desmontaría/remontaría de verdad (recarga completa sin necesidad).
export function LandingPreviewDeviceFrame() {
  const viewportMode = usePreviewStore((s) => s.viewportMode)
  const zoomOverride = usePreviewStore((s) => s.zoomOverride)
  // Callback ref, no `useRef` + `useEffect([])`: sin esto, el observer se engancha una sola
  // vez al montar y nunca se reintenta si el contenedor todavía no tenía tamaño medible.
  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    if (!container) return
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      setContainerSize({ width: entry.contentRect.width, height: entry.contentRect.height })
    })
    observer.observe(container)
    return () => observer.disconnect()
  }, [container])

  const isDevice = viewportMode !== 'auto'
  const measured = containerSize.width > 0
  const baseWidth = isDevice ? VIEWPORT_PRESETS[viewportMode] : containerSize.width
  // Auto-ajuste: solo hace falta calcularlo en modo dispositivo (ahí el ancho de referencia es
  // fijo y puede no entrar) — en "Auto" el ancho de referencia YA es el del panel, siempre
  // entra por definición, así que sin zoom manual el ratio por defecto es 1 (sin escalar).
  const autoRatio = isDevice && measured ? Math.min(1, containerSize.width / baseWidth) : 1
  const ratio = Math.max(MIN_RATIO, zoomOverride != null ? zoomOverride / 100 : autoRatio)
  const scaledWidth = baseWidth * ratio
  const frameHeight = containerSize.height
  // "¿Estamos escalando algo?" — no "¿el resultado entra o no?". Bug real: antes esto se
  // decidía comparando `scaledWidth < containerSize.width` (¿hay lugar de sobra?), así que en
  // cuanto el zoom manual dejaba el contenido MÁS ANCHO que el panel (ej. Escritorio 1280px
  // con poco zoom en un panel angosto), esta bandera se apagaba sola — sacándole el
  // `overflow-auto` al contenedor justo cuando más falta hacía, y el contenido se escapaba del
  // panel hacia el layout de toda la página (scrollbar horizontal en la ventana entera, saltos
  // visuales al tocar el zoom). Ahora es una sola condición ("¿hay algún escalado activo?"),
  // sin importar si el resultado termina siendo más chico o más grande que el panel — siempre
  // se contiene con scroll propio, nunca se deja escapar.
  const isScaling = isDevice || ratio !== 1

  return (
    <div ref={setContainer} className={cn('h-full', isScaling && 'flex items-start justify-center overflow-auto bg-muted/40 p-3')}>
      <div
        className={cn(isScaling ? 'shrink-0 overflow-hidden rounded border bg-background shadow-sm' : 'h-full w-full overflow-hidden')}
        style={measured && isScaling ? { width: scaledWidth, height: frameHeight } : undefined}
      >
        <LandingPreviewIframe
          style={measured && isScaling ? { width: baseWidth, height: frameHeight / ratio, transform: `scale(${ratio})`, transformOrigin: 'top left', border: 0 } : undefined}
        />
      </div>
    </div>
  )
}
