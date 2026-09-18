'use client'

import { getFaIcon, parseFaIconValue } from './fontawesome-icons'

interface FaIconProps {
  /** Valor guardado en BD, ej. "fa-solid fa-phone". `null`/inválido → no renderiza nada. */
  value: string | null | undefined
  className?: string
}

/** Renderiza un icono de Font Awesome Free como SVG inline, a partir del valor guardado (ej. `sectionbutton_icon`). No depende de la fuente/CSS de Font Awesome — usa el path real embebido en `fontawesome-icons.ts`. */
export function FaIcon({ value, className }: FaIconProps) {
  const parsed = parseFaIconValue(value)
  if (!parsed) return null

  const icon = getFaIcon(parsed.name)
  const svg = icon?.svgs[parsed.style]
  if (!svg) return null

  return (
    <svg viewBox={`0 0 ${svg.width} ${svg.height}`} fill="currentColor" aria-hidden="true" className={className}>
      <path d={svg.path} />
    </svg>
  )
}
