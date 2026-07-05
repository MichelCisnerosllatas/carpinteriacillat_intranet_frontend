'use client'

import { useEffect } from 'react'
import { fontFamilyStyle, loadGoogleFont } from '../lib/load-google-font'

interface TypeFontPreviewProps {
  family: string
}

const SAMPLE_TEXT = 'El veloz murciélago hindú comía feliz cardillo y kiwi. 0123456789'

export function TypeFontPreview({ family }: TypeFontPreviewProps) {
  useEffect(() => { if (family) loadGoogleFont(family) }, [family])

  if (!family) return null

  const style = fontFamilyStyle(family)

  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-muted/30 p-4">
      <span className="text-xs text-muted-foreground">Vista previa</span>
      <p className="truncate text-3xl leading-tight" style={style}>{family}</p>
      <p className="truncate text-2xl font-bold leading-tight" style={style}>{family}</p>
      <p className="text-sm text-muted-foreground" style={style}>{SAMPLE_TEXT}</p>
    </div>
  )
}
