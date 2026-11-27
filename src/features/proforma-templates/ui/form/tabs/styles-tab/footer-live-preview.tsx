'use client'

import { useWatch } from 'react-hook-form'
import type { FormProps } from './types'

export function FooterLivePreview({ form }: FormProps) {
  const [bg, text, size, footerText] = useWatch({
    control: form.control,
    name: ['footerBgColor', 'footerTextColor', 'footerTextSize', 'footerText'],
  })
  return (
    <div
      className="rounded-md px-4 py-3 text-center"
      style={{ backgroundColor: bg, color: text, fontSize: `${size || 9}px` }}
    >
      {footerText || 'Gracias por su preferencia.'}
    </div>
  )
}
