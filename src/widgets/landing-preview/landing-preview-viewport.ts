import { Smartphone, Tablet, Monitor, Maximize } from 'lucide-react'
import type { PreviewViewportMode } from '@/shared/stores/preview-store'

// Solo datos: qué ancho fijo (px) simula cada modo, y qué ícono/label le corresponde en el
// selector del header del panel — agregar un modo nuevo es un solo renglón acá.
export const VIEWPORT_PRESETS: Record<Exclude<PreviewViewportMode, 'auto'>, number> = {
  mobile: 375,
  tablet: 768,
  desktop: 1280,
}

export const VIEWPORT_MODE_OPTIONS: { mode: PreviewViewportMode; icon: typeof Maximize; label: string }[] = [
  { mode: 'auto', icon: Maximize, label: 'Ajustar al panel' },
  { mode: 'mobile', icon: Smartphone, label: `Celular (${VIEWPORT_PRESETS.mobile}px)` },
  { mode: 'tablet', icon: Tablet, label: `Tablet (${VIEWPORT_PRESETS.tablet}px)` },
  { mode: 'desktop', icon: Monitor, label: `Escritorio (${VIEWPORT_PRESETS.desktop}px)` },
]

// Presets del selector de zoom manual (ver landing-preview-header.tsx) — `null` es "Auto": deja
// que landing-preview-device-frame.tsx calcule el zoom solo para que el ancho del dispositivo
// elegido quepa entero en el panel actual, sin scroll horizontal. Van hasta 25% (no solo 50%)
// para poder ver un dispositivo grande (ej. Escritorio, 1280px) entero incluso con el panel
// bien angosto.
export const ZOOM_PRESETS: { value: number | null; label: string }[] = [
  { value: null, label: 'Auto' },
  { value: 25, label: '25%' },
  { value: 50, label: '50%' },
  { value: 75, label: '75%' },
  { value: 80, label: '80%' },
  { value: 85, label: '85%' },
  { value: 90, label: '90%' },
  { value: 95, label: '95%' },
  { value: 100, label: '100%' },
  { value: 125, label: '125%' },
  { value: 150, label: '150%' },
]
