'use client'

import { Input } from '@/shared/ui/input'
import { fontFamilyStyle } from '../lib/load-google-font'
import { TypeFontPickerModal } from './typefont-picker-modal'

interface TypeFontNameFieldProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
}

export function TypeFontNameField({ value, onChange, disabled, placeholder }: TypeFontNameFieldProps) {
  return (
    <div className="flex items-center gap-2">
      <Input
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={fontFamilyStyle(value)}
      />
      <TypeFontPickerModal value={value} onChange={onChange} disabled={disabled} variant="icon" />
    </div>
  )
}
