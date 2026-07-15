'use client'

import { useEffect } from 'react'
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { useRoleSelectStore } from '../stores/useRoleSelectStore'

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
  const { options, isLoading, isError, load, setForceReload } = useRoleSelectStore()

  useEffect(() => { load() }, [])

  if (isLoading) return (
    <div className="flex h-9 w-full items-center rounded-md border border-input bg-background px-3 text-sm text-muted-foreground">
      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
      Cargando...
    </div>
  )

  if (isError) return (
    <div className="grid grid-cols-2 h-9 w-full items-center rounded-md border border-destructive/40 bg-background px-3 text-sm">
      <span className="flex items-center gap-1.5 text-destructive text-xs">
        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
        Error al cargar
      </span>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => { setForceReload(true); load() }}
          className="group flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-180" />
          Reintentar
        </button>
      </div>
    </div>
  )

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
