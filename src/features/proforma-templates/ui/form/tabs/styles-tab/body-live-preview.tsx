'use client'

import { useWatch } from 'react-hook-form'
import type { FormProps } from './types'

export function BodyLivePreview({ form }: FormProps) {
  const [bg, text, border] = useWatch({
    control: form.control,
    name: ['bodyBgColor', 'bodyTextColor', 'bodyBorderColor'],
  })
  const cols = ['Producto', 'Cantidad', 'Precio']
  const row = ['Mueble de melamina', '2', 'S/ 350.00']
  return (
    <div className="overflow-hidden rounded-md border" style={{ borderColor: border }}>
      <div className="grid grid-cols-3 gap-px" style={{ backgroundColor: border }}>
        {cols.map((h) => (
          <div
            key={h}
            className="px-2 py-1.5 text-xs font-semibold"
            style={{ backgroundColor: bg, color: text }}
          >
            {h}
          </div>
        ))}
        {row.map((v) => (
          <div key={v} className="px-2 py-1.5 text-xs" style={{ backgroundColor: bg, color: text }}>
            {v}
          </div>
        ))}
      </div>
    </div>
  )
}
