'use client'

import { useEffect, useState } from 'react'
import { Loader2, MapPin, Star } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Switch } from '@/shared/ui/switch'
import { Checkbox } from '@/shared/ui/checkbox'
import { Button } from '@/shared/ui/button'
import { companyBranchesService } from '@/features/company-branches'

type BranchOption = { id: number; name: string; status: number }

type UserBranchesFieldProps = {
  allBranches: boolean
  branchIds: number[]
  defaultBranchId: number | null
  onChange: (value: { allBranches: boolean; branchIds: number[]; defaultBranchId: number | null }) => void
  error?: string
}

/**
 * Sucursales del usuario:
 *   - "Trabaja en todas las sucursales" (all_branches) → no se eligen sucursales; opcionalmente
 *     una principal (con la que arranca la sesión).
 *   - Si no → una o más sucursales, y una de ellas marcada como principal (★).
 * Las opciones salen de GET /company-branches (permiso company_branches.view o users.create/update).
 */
export function UserBranchesField({ allBranches, branchIds, defaultBranchId, onChange, error }: UserBranchesFieldProps) {
  const [options, setOptions] = useState<BranchOption[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    companyBranchesService
      .getList({ per_page: 100 })
      .then((res) => {
        if (cancelled) return
        setOptions((res.data ?? []).map((b) => ({ id: b.id, name: b.name, status: Number(b.status) })))
      })
      .catch(() => !cancelled && setLoadError('No se pudieron cargar las sucursales.'))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [])

  const toggleBranch = (id: number, checked: boolean) => {
    const next = checked ? [...branchIds, id] : branchIds.filter((b) => b !== id)
    // La principal debe estar entre las elegidas: si se quitó, pasa a la primera que quede.
    const nextDefault = next.includes(defaultBranchId ?? -1) ? defaultBranchId : (next[0] ?? null)
    onChange({ allBranches, branchIds: next, defaultBranchId: nextDefault })
  }

  const setDefault = (id: number) => {
    const next = branchIds.includes(id) ? branchIds : [...branchIds, id]
    onChange({ allBranches, branchIds: next, defaultBranchId: id })
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="flex items-center justify-between gap-3 rounded-lg border p-3">
        <span className="grid gap-0.5">
          <span className="text-sm font-medium">Trabaja en todas las sucursales</span>
          <span className="text-xs text-muted-foreground">
            Puede registrar y ver ventas y proformas de cualquier sucursal, incluso de las que se creen después.
          </span>
        </span>
        <Switch
          checked={allBranches}
          onCheckedChange={(checked) => onChange({ allBranches: checked, branchIds, defaultBranchId })}
        />
      </label>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Cargando sucursales...
        </div>
      ) : loadError ? (
        <p className="text-sm text-destructive">{loadError}</p>
      ) : options.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay sucursales registradas. Créalas en Datos de la Empresa → Sucursales.</p>
      ) : (
        <div className="flex flex-col gap-2">
          <span className="text-xs text-muted-foreground">
            {allBranches
              ? 'Opcional: marca con ★ la sucursal con la que inicia sesión.'
              : 'Elige las sucursales donde trabaja y marca con ★ la principal (con la que inicia sesión).'}
          </span>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {options.map((branch) => {
              const checked = allBranches || branchIds.includes(branch.id)
              const isDefault = defaultBranchId === branch.id
              return (
                <div
                  key={branch.id}
                  className={cn(
                    'flex items-center gap-2 rounded-lg border px-3 py-2',
                    checked && !allBranches && 'border-primary/40 bg-primary/5',
                  )}
                >
                  <Checkbox
                    id={`branch-${branch.id}`}
                    checked={checked}
                    disabled={allBranches}
                    onCheckedChange={(v) => toggleBranch(branch.id, Boolean(v))}
                  />
                  <label htmlFor={`branch-${branch.id}`} className="flex min-w-0 flex-1 items-center gap-1.5 text-sm">
                    <MapPin className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate">{branch.name}</span>
                    {branch.status !== 1 && <span className="text-xs text-muted-foreground">(inactiva)</span>}
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    title={isDefault ? 'Sucursal principal' : 'Marcar como principal'}
                    onClick={() => setDefault(branch.id)}
                  >
                    <Star className={cn('size-4', isDefault ? 'fill-amber-400 text-amber-500' : 'text-muted-foreground')} />
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
    </div>
  )
}
