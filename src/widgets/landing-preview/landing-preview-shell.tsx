'use client'

import { useCallback, useRef } from 'react'
import { Eye } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { usePreviewStore } from '@/shared/stores/preview-store'
import { useLandingPreviewVisibility } from './use-landing-preview-visibility'
import { LandingPreviewHeader } from './landing-preview-header'
import { LandingPreviewDeviceFrame } from './landing-preview-device-frame'

// Antes en 320: con eso alcanzaba para el header, pero le ponía un piso al arrastre bastante
// por encima de lo que el usuario esperaba poder contraer (ej. para ver un dispositivo chico
// con zoom bajo, más angosto que el panel entero). Bajarlo ahora es seguro porque el contenido
// escalado más ancho que el panel ya queda contenido con scroll propio (ver
// landing-preview-device-frame.tsx) en vez de escaparse del layout — y el header ya se acomoda
// solo en más líneas (`flex-wrap`) si de verdad no entra en una sola.
const MIN_WIDTH_PX = 240
const MAX_WIDTH_RATIO = 0.7

// Único punto de montaje del <iframe> de vista previa (ver LandingPreviewIframe) — a propósito
// SIEMPRE queda en el DOM, tanto si está colapsado como si la ruta actual está fuera del
// alcance de este widget. Mostrar/ocultar u ocultar/salir-y-volver de una ruta en alcance NUNCA
// debe desmontar el <iframe>: si se desmuestra, el navegador recarga /preview desde cero (pierde
// el handshake, vuelve a pedir el sitio) — justo el bug reportado ("cada vez que lo muestro se
// actualiza todo"). Por eso acá todo se resuelve con clases CSS (ancho/alto en 0, opacity,
// pointer-events), nunca con un `return null` que saque el árbol entero del DOM.
export function LandingPreviewShell() {
  const { inScope, isMobile, isOpen } = useLandingPreviewVisibility()
  const widthPx = usePreviewStore((s) => s.widthPx)
  const setOpen = usePreviewStore((s) => s.setOpen)
  const setWidthPx = usePreviewStore((s) => s.setWidthPx)
  const isDraggingRef = useRef(false)

  const visible = inScope && isOpen

  const onPointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true
    event.currentTarget.setPointerCapture(event.pointerId)
  }, [])

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!isDraggingRef.current) return
      const maxWidth = window.innerWidth * MAX_WIDTH_RATIO
      const next = Math.min(maxWidth, Math.max(MIN_WIDTH_PX, window.innerWidth - event.clientX))
      setWidthPx(next)
    },
    [setWidthPx]
  )

  const onPointerUp = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = false
    event.currentTarget.releasePointerCapture(event.pointerId)
  }, [])

  return (
    <>
      {inScope && !isOpen && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Mostrar vista previa del sitio"
          className={cn(
            'fixed z-30 flex items-center gap-1 rounded-s-lg border border-e-0 bg-background px-2 py-2.5 text-muted-foreground shadow-md transition-colors hover:text-foreground',
            isMobile ? 'inset-e-0 bottom-6 flex-row rounded-lg border-e px-3' : 'inset-e-0 top-1/2 -translate-y-1/2 flex-col'
          )}
        >
          <Eye className="size-4" />
          <span className="text-[10px] font-medium leading-none">Vista</span>
        </button>
      )}

      {/* Fondo oscuro en móvil, mismo criterio de "nunca desmontar": solo cambia opacity/pointer-events. */}
      {isMobile && (
        <div
          onClick={() => setOpen(false)}
          className={cn(
            'fixed inset-0 z-30 bg-black/50 transition-opacity',
            visible ? 'opacity-100' : 'pointer-events-none opacity-0'
          )}
        />
      )}

      {/*
        OJO: el ancho/alto de este contenedor SIEMPRE es el real (nunca 0) — colapsado se saca
        de pantalla con `transform`, no achicando la caja. Bug real que costó encontrar: con
        `width: 0` mientras estaba colapsado, el <iframe> (que sigue vivo adentro, ver
        LandingPreviewIframe) quedaba con un viewport interno de 0px — cualquier
        `scrollIntoView` que llegara en ese momento (ver preview.bridge.ts del sitio web) se
        calculaba contra ese layout degenerado y nunca se volvía a recalcular al abrir el
        panel (abrirlo no reenvía nada), dejando la vista previa siempre clavada en la primera
        sección sin importar cuál se estuviera editando.
      */}
      <div
        className={cn(
          'fixed z-30 flex border bg-background shadow-xl transition-transform duration-200',
          !visible && 'pointer-events-none',
          isMobile
            ? cn('inset-x-0 bottom-0 h-[85svh] flex-col rounded-t-xl border-b-0', visible ? 'translate-y-0' : 'translate-y-full')
            : cn('inset-e-0 flex-row border-b-0 border-t-0 border-e-0', visible ? 'translate-x-0' : 'translate-x-full')
        )}
        style={!isMobile ? { top: 0, height: '100svh', width: widthPx } : undefined}
      >
        {!isMobile && (
          <div
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            className="w-1.5 shrink-0 cursor-ew-resize bg-transparent transition-colors hover:bg-primary/30 active:bg-primary/50"
          />
        )}
        <div className="flex min-w-0 flex-1 flex-col">
          <LandingPreviewHeader />
          <div className="min-h-0 flex-1">
            <LandingPreviewDeviceFrame />
          </div>
        </div>
      </div>
    </>
  )
}
