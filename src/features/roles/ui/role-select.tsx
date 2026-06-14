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

import { rolesService } from '../services/roles.service'
import type { RoleType } from '@/entities/role/model/role.type'

interface RoleSelectProps {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

export function RoleSelect({
  value,
  onValueChange,
  placeholder = 'Seleccionar rol...',
  disabled,
}: RoleSelectProps) {
  const [options, setOptions]   = useState<RoleType[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    rolesService
      .getForSelect()
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
          <SelectItem key={opt.id_role} value={String(opt.id_role)}>
            {opt.role_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
