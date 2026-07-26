'use client'

import { useRef } from 'react'
import { Pipette, X } from 'lucide-react'
import { Input } from '@/shared/ui/input'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { TYPECOLOR_HEX_FORMATS } from '../../data/data'

interface CssColorInputProps {
  value:    string
  onChange: (v: string) => void
  disabled?: boolean
}

export function CssColorInput({ value, onChange, disabled }: CssColorInputProps) {
  const pickerRef = useRef<HTMLInputElement>(null)

  /* Best-effort: extract a 6-digit hex from the current value to seed the
     native picker (it only accepts #RRGGBB). Falls back to black. */
  const pickerSeed = /^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/.test(value)
    ? value.slice(0, 7)
    : '#000000'

  const hasValue = value.trim().length > 0

  return (
    <div className="flex flex-col gap-3">
      {/* Large live-preview swatch */}
      <div
        className="relative flex h-24 w-full items-center justify-center overflow-hidden rounded-xl border-2 transition-all"
        style={hasValue ? { backgroundColor: value } : undefined}
      >
        {!hasValue ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-muted">
            <Pipette className="size-5 text-muted-foreground/50" />
            <span className="text-xs text-muted-foreground">Vista previa del color</span>
          </div>
        ) : (
          /* Overlay showing the value on hover */
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity hover:opacity-100">
            <span className="rounded-md bg-black/40 px-2 py-1 font-mono text-xs text-white backdrop-blur-sm">
              {value}
            </span>
          </div>
        )}
      </div>

      {/* Input row: picker button + text field + clear */}
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              disabled={disabled}
              onClick={() => pickerRef.current?.click()}
              className="relative flex size-9 flex-shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border shadow-sm transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
              style={hasValue ? { backgroundColor: value } : undefined}
            >
              {!hasValue && <Pipette className="size-4 text-muted-foreground" />}
              <input
                ref={pickerRef}
                type="color"
                value={pickerSeed}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className="sr-only"
                tabIndex={-1}
              />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Selector rápido (hex)</TooltipContent>
        </Tooltip>

        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder='Ej: #5C4033 · rgb(92, 64, 51) · hsl(25, 56%, 40%)'
          className="font-mono text-sm"
        />

        {hasValue && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onChange('')}
                className="flex size-9 flex-shrink-0 items-center justify-center rounded-md border text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Limpiar color</TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Accepted format chips */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs text-muted-foreground">Formatos:</span>
        {TYPECOLOR_HEX_FORMATS.map(({ label, example }) => (
          <Tooltip key={label}>
            <TooltipTrigger asChild>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onChange(example)}
                className="cursor-pointer rounded-md bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground transition hover:bg-muted/80 hover:text-foreground disabled:pointer-events-none"
              >
                {label}
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="font-mono text-xs">
              {example}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  )
}
