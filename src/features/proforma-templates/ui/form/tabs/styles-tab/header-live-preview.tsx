'use client'

import { useWatch } from 'react-hook-form'
import type { FormProps } from './types'

// Vista instantánea (sin llamar al backend) de cómo quedan los colores y tamaños elegidos.
// Complementa al preview de PDF real (que tarda unos segundos por sección): esto reacciona
// al toque, aunque no use la tipografía exacta del PDF final.
export function HeaderLivePreview({ form }: FormProps) {
  const [bg, text, titleSize] = useWatch({
    control: form.control,
    name: ['headerBgColor', 'headerTextColor', 'headerTitleSize'],
  })
  return (
    <div
      className="flex items-center justify-between rounded-md border px-4 py-3"
      style={{ backgroundColor: bg, color: text }}
    >
      <span style={{ fontSize: `${titleSize || 16}px` }} className="leading-none font-semibold">
        PROFORMA N.° 0001
      </span>
      <span
        className="rounded border px-2 py-1 text-[10px] tracking-wide opacity-80"
        style={{ borderColor: text }}
      >
        LOGO
      </span>
    </div>
  )
}
