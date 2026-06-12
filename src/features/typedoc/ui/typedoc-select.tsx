'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { typeDocService } from '../services/typedoc.service'
import type { TypeDocType } from '@/entities/typedoc/model/typedoc.type'

interface TypeDocSelectProps {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

export function TypeDocSelect({
  value,
  onValueChange,
  placeholder = 'Seleccionar tipo...',
  disabled,
}: TypeDocSelectProps) {
  const [options, setOptions]   = useState<TypeDocType[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    typeDocService
      .get()
      .then((res) => { if (res.success) setOptions(res.data) })
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-9 w-full items-center rounded-md border border-input bg-background px-3 text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
        Cargando...
      </div>
    )
  }

  return (
    <Select key={value} value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.id_typedoc} value={String(opt.id_typedoc)}>
            {opt.typedoc_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
