'use client'

import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { FieldTip } from '@/shared/ui/field-tip'

const HEX_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

interface ColorInputFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  required?: boolean
  tip?: string
}

export function ColorInputField({
  label,
  value,
  onChange,
  disabled,
  required,
  tip,
}: ColorInputFieldProps) {
  const isValidHex = HEX_REGEX.test(value || '')
  const swatchColor = isValidHex ? value : '#ffffff'
  const labelContent = (
    <>
      {label} {required && <span className="text-destructive">*</span>}
    </>
  )

  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-sm">
        {tip ? <FieldTip label={labelContent} tip={tip} /> : labelContent}
      </Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={swatchColor}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="border-input h-9 w-10 shrink-0 cursor-pointer rounded-md border bg-transparent p-1 disabled:cursor-not-allowed disabled:opacity-50"
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
