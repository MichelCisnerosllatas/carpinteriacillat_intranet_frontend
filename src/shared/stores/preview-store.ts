import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PreviewFocus, PreviewOutboundMessage, PreviewPayload } from '@/widgets/landing-preview/landing-preview.types'

const DEFAULT_WIDTH_PX = 480
// Debe quedar igual al de landing-preview-shell.tsx (el drag del borde ya clampea ahí antes de
// llamar a `setWidthPx` — este segundo clamp es solo para cualquier otro llamador, ej. estado
// restaurado de una versión vieja persistida en localStorage con un ancho más chico que el
// mínimo actual).
const MIN_WIDTH_PX = 240

export type PreviewViewportMode = 'auto' | 'mobile' | 'tablet' | 'desktop'

type PreviewState = {
  isOpen: boolean
  widthPx: number
  // Último mensaje para el iframe: el payload armado por el formulario/detalle que esté
  // montado, o el foco por ruta (ver landing-preview.routes.ts) — se reenvía apenas está listo
  // (ver landing-preview-iframe.tsx). Guardarlo acá (y no solo pasarlo por prop) permite
  // reenviarlo si el iframe se recarga o si el panel estaba colapsado al momento del cambio.
  // Uno solo para los dos tipos a propósito: así un foco nuevo reemplaza al payload de la
  // pantalla anterior (y no queda "pegada" la sección que se editó antes).
  lastMessage: PreviewOutboundMessage | null
  iframeReady: boolean
  // A qué navigation_url real quedó apuntando el preview — se lo manda el sitio web solo
  // (mensaje "active-url", ver landing-preview-iframe.tsx), el intranet nunca lo resuelve por
  // su cuenta. Alimenta el botón "Ver original" y el label de "qué se está viendo".
  resolvedNavigationUrl: string | null
  // "auto" = el iframe llena el panel entero (comportamiento de siempre). Los otros 3 fuerzan
  // un ancho de dispositivo fijo, centrado, para probar el responsive del sitio sin tener que
  // achicar la ventana del navegador — ver landing-preview-viewport.ts.
  viewportMode: PreviewViewportMode
  // Se incrementa cada vez que se pide "Recargar" — landing-preview-iframe.tsx lo usa como
  // parte de la `key` del <iframe>, así React lo desmonta/remonta de verdad (única forma
  // confiable de forzar un reload real de un iframe cross-origin).
  reloadToken: number
  // `null` = automático: en modo dispositivo, se calcula solo para que el ancho elegido quepa
  // entero en el panel sin scroll horizontal (ver landing-preview-device-frame.tsx) — el panel
  // se puede estirar/achicar (arrastre del borde), así que ese cálculo cambia con el ancho del
  // panel. Un número = el usuario fijó un zoom manual desde el header, que pisa el automático
  // hasta que vuelva a elegir "Auto".
  zoomOverride: number | null
  setOpen: (open: boolean) => void
  setWidthPx: (px: number) => void
  setIframeReady: (ready: boolean) => void
  setResolvedNavigationUrl: (url: string) => void
  setViewportMode: (mode: PreviewViewportMode) => void
  setZoomOverride: (zoom: number | null) => void
  reload: () => void
  postPreview: (payload: PreviewPayload) => void
  postFocus: (focus: PreviewFocus) => void
}

export const usePreviewStore = create<PreviewState>()(
  persist(
    (set) => ({
      // Colapsado por defecto: el widget vive en TODO el grupo "Sitio Web" del sidebar (listas,
      // detalles, formularios...), no solo en los de edición — que se muestre abierto de
      // entrada en cada una de esas páginas sería intrusivo. El usuario lo abre cuando lo
      // necesita y esa elección se persiste (ver `partialize` más abajo).
      isOpen: false,
      widthPx: DEFAULT_WIDTH_PX,
      lastMessage: null,
      iframeReady: false,
      resolvedNavigationUrl: null,
      viewportMode: 'auto',
      reloadToken: 0,
      zoomOverride: null,
      setOpen: (open) => set({ isOpen: open }),
      setWidthPx: (px) => set({ widthPx: Math.max(MIN_WIDTH_PX, px) }),
      setIframeReady: (ready) => set({ iframeReady: ready }),
      setResolvedNavigationUrl: (url) => set({ resolvedNavigationUrl: url }),
      setViewportMode: (mode) => set({ viewportMode: mode }),
      setZoomOverride: (zoom) => set({ zoomOverride: zoom }),
      reload: () => set((s) => ({ reloadToken: s.reloadToken + 1, iframeReady: false })),
      postPreview: (payload) => set({ lastMessage: { type: 'preview', payload } }),
      postFocus: (focus) => set({ lastMessage: { type: 'focus', focus } }),
    }),
    {
      name: 'landing-preview-panel',
      // Panel/ancho/modo responsive/zoom son preferencias de UI que tiene sentido recordar
      // entre sesiones — `lastMessage`/`iframeReady`/`resolvedNavigationUrl`/`reloadToken` son
      // estado de la sesión de edición actual, no de la persistencia.
      partialize: (state) => ({
        isOpen: state.isOpen,
        widthPx: state.widthPx,
        viewportMode: state.viewportMode,
        zoomOverride: state.zoomOverride,
      }),
    }
  )
)
