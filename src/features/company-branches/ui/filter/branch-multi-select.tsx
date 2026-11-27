'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, MapPin } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/shared/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import type { SessionBranchOptionDTO } from '@/features/auth/model/verify.dto'

/** Sucursales que el usuario puede ver (session.branch_filter.options, de GET verify). */
export function useVisibleBranches(): SessionBranchOptionDTO[] {
  return useAuthStore((s) => s.session?.branch_filter.options) ?? EMPTY
}

const EMPTY: SessionBranchOptionDTO[] = []

/**
 * ¿Mostrar el filtro de sucursales? Solo si el usuario puede ver más de una
 * (superadmin / `company_branches.view_all` / varias asignadas).
 */
export function useShowBranchFilter(): boolean {
  return useVisibleBranches().length > 1
}

type BranchMultiSelectProps = {
  /** Ids elegidos. [] = todas (no se envía el filtro). */
  value: number[]
  onValueChange: (ids: number[]) => void
  disabled?: boolean
  className?: string
  placeholder?: string
}

/**
 * Filtro MÚLTIPLE de sucursales (ventas, proformas, dashboard, reportes). Las opciones salen
 * de la sesión (`branch_filter.options`); el backend igual recorta a lo que el usuario puede ver.
 */
export function BranchMultiSelect({
  value,
  onValueChange,
  disabled,
  className,
  placeholder = 'Todas',
}: BranchMultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const branches = useVisibleBranches()
  const selected = React.useMemo(() => new Set(value), [value])

  const toggle = (id: number) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onValueChange(branches.filter((b) => next.has(b.id)).map((b) => b.id))
  }

  const selectedBranches = branches.filter((b) => selected.has(b.id))
  const label =
    selectedBranches.length === 0
      ? placeholder
      : selectedBranches.length === 1
        ? selectedBranches[0].name
        : `${selectedBranches.length} sucursales`

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn('h-8 w-full justify-between gap-2 px-3 font-normal', className)}
        >
          <span className="flex min-w-0 items-center gap-1.5">
            <MapPin className="size-3.5 shrink-0 text-muted-foreground" />
            <span className={cn('truncate', selectedBranches.length === 0 && 'text-muted-foreground')}>
              {label}
            </span>
          </span>
          {selectedBranches.length > 1 ? (
            <Badge variant="secondary" className="rounded-sm px-1 font-normal">
              {selectedBranches.length}
            </Badge>
          ) : (
            <ChevronsUpDown className="size-3.5 shrink-0 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar sucursal..." />
          <CommandList>
            <CommandEmpty>Sin resultados.</CommandEmpty>
            <CommandGroup>
              {branches.map((branch) => {
                const isSelected = selected.has(branch.id)
                return (
                  <CommandItem key={branch.id} value={branch.name} onSelect={() => toggle(branch.id)}>
                    <div
                      className={cn(
                        'flex size-4 items-center justify-center rounded-sm border border-primary',
                        isSelected ? 'bg-primary text-primary-foreground' : 'opacity-50 [&_svg]:invisible',
                      )}
                    >
                      <Check className="size-3" />
                    </div>
                    <span className="truncate">{branch.name}</span>
                    {branch.status !== 1 && (
                      <span className="ms-auto text-xs text-muted-foreground">Inactiva</span>
                    )}
                  </CommandItem>
                )
              })}
            </CommandGroup>
            {selectedBranches.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem onSelect={() => onValueChange([])} className="justify-center text-center">
                    Ver todas
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
