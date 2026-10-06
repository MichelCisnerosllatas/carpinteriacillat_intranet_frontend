'use client'

import { ExternalLink, PanelRightClose, RotateCw } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { usePreviewStore } from '@/shared/stores/preview-store'
import { guessPreviewLabel } from './landing-preview-label'
import { VIEWPORT_MODE_OPTIONS, ZOOM_PRESETS } from './landing-preview-viewport'

const WEB_PREVIEW_URL = process.env.NEXT_PUBLIC_WEB_PREVIEW_URL ?? ''

// Botón chico e icono solo, con tooltip — todos los del header terminan usando esto, para que
// agregar uno nuevo no rompa la consistencia de tamaño/alineación.
function HeaderIconButton({
  icon: Icon,
  label,
  onClick,
  disabled,
  active,
  spinning,
}: {
  icon: typeof RotateCw
  label: string
  onClick?: () => void
  disabled?: boolean
  active?: boolean
  spinning?: boolean
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          aria-label={label}
          aria-pressed={active}
          className={cn(
            'flex size-6 items-center justify-center rounded transition-colors disabled:pointer-events-none disabled:opacity-40',
            active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          <Icon className={cn('size-3.5', spinning && 'animate-spin')} />
        </button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

// Cabecera del panel — vive DENTRO de su propio contenedor (no flota sobre el iframe), así no
// compite con el header propio de cada página del intranet ni con el del sitio público que ya
// se ve adentro. Una sola fila con `flex-wrap` (entra completa cuando el panel es ancho, recién
// se acomoda en más líneas si de verdad no alcanza). Todos los botones son solo ícono — con
// texto al lado no entraban sin obligar a 2 filas fijas — y "Ocultar" va siempre último/pegado
// al borde, como se espera de un botón de cerrar.
export function LandingPreviewHeader() {
  const lastMessage = usePreviewStore((s) => s.lastMessage)
  const resolvedNavigationUrl = usePreviewStore((s) => s.resolvedNavigationUrl)
  const viewportMode = usePreviewStore((s) => s.viewportMode)
  const zoomOverride = usePreviewStore((s) => s.zoomOverride)
  const iframeReady = usePreviewStore((s) => s.iframeReady)
  const setOpen = usePreviewStore((s) => s.setOpen)
  const setViewportMode = usePreviewStore((s) => s.setViewportMode)
  const setZoomOverride = usePreviewStore((s) => s.setZoomOverride)
  const reload = usePreviewStore((s) => s.reload)
  const label = lastMessage?.type === 'focus' ? lastMessage.focus.label : guessPreviewLabel(lastMessage?.payload ?? null)

  const originalUrl = resolvedNavigationUrl && WEB_PREVIEW_URL ? `${WEB_PREVIEW_URL}${resolvedNavigationUrl}` : null

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-x-1.5 gap-y-1 border-b bg-background px-2.5 py-1.5">
      <span className="min-w-[64px] flex-1 truncate text-xs font-medium text-muted-foreground" title={label}>
        {label}
      </span>

      <div className="flex items-center gap-0.5 rounded-md border p-0.5">
        {VIEWPORT_MODE_OPTIONS.map(({ mode, icon, label: modeLabel }) => (
          <HeaderIconButton key={mode} icon={icon} label={modeLabel} active={viewportMode === mode} onClick={() => setViewportMode(mode)} />
        ))}
      </div>

      {/* Zoom manual — SIEMPRE disponible, también en "Auto": ahí funciona como el zoom de un
          navegador (Ctrl+rueda), agranda/achica la vista sin cambiar qué layout responsive ve
          el sitio (para eso están los botones de dispositivo, no este). En modo dispositivo,
          "Auto" pisa el cálculo de ajuste automático de landing-preview-device-frame.tsx. */}
      <select
        value={zoomOverride ?? ''}
        onChange={(e) => setZoomOverride(e.target.value === '' ? null : Number(e.target.value))}
        aria-label="Zoom de la vista previa"
        className="h-6 rounded-md border bg-background px-1 text-[11px] text-muted-foreground"
      >
        {ZOOM_PRESETS.map((preset) => (
          <option key={preset.label} value={preset.value ?? ''}>
            {preset.label}
          </option>
        ))}
      </select>

      {/* Gira mientras el iframe está recargando (ver landing-preview-iframe.tsx) — sin esto,
          una recarga que tarda 2-3s (SSR + hidratación completa, más lento en modo desarrollo)
          parecía "no hacer nada". */}
      <HeaderIconButton
        icon={RotateCw}
        label={iframeReady ? 'Recargar' : 'Recargando...'}
        onClick={reload}
        disabled={!iframeReady}
        spinning={!iframeReady}
      />

      <HeaderIconButton
        icon={ExternalLink}
        label={originalUrl ? 'Ver original' : 'Todavía no se resolvió la página real'}
        disabled={!originalUrl}
        onClick={() => originalUrl && window.open(originalUrl, '_blank', 'noopener,noreferrer')}
      />

      {/* Siempre último — es el botón de "cerrar", va pegado al borde como se espera. */}
      <HeaderIconButton icon={PanelRightClose} label="Ocultar vista previa" onClick={() => setOpen(false)} />
    </div>
  )
}
