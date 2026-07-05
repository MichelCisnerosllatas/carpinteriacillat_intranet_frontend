'use client'

import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

const HEX_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

interface ColorInputFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function ColorInputField({ label, value, onChange, disabled }: ColorInputFieldProps) {
  const isValidHex = HEX_REGEX.test(value || '')
  const swatchColor = isValidHex ? value : '#ffffff'

  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-sm">{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={swatchColor}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-10 shrink-0 cursor-pointer rounded-md border border-input bg-transparent p-1 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={`Selector de color para ${label}`}
        />
        <Input
          value={value ?? ''}
          disabled={disabled}
          placeholder="#000000"
          onChange={(e) => onChange(e.target.value)}
          className="font-mono uppercase"
        />
      </div>
    </div>
  )
}
