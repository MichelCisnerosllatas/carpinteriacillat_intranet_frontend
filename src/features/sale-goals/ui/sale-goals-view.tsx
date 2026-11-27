// src/features/sale-goals/ui/sale-goals-view.tsx
'use client'

import { useEffect } from 'react'
import { Loader2, Lock } from 'lucide-react'
import { Label } from '@/shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { toastError, toastSuccess } from '@/shared/lib/toast'
import { AlertError } from '@/widgets/alerts_components'
import { useCan } from '@/features/auth/hooks/usePermission'
import { useSaleGoalStore } from '../stores/useSaleGoalStore'
import { SALE_GOAL_CURRENCIES, getGoalYearOptions } from '../data/data'
import { GeneralGoalsCard } from './general-goals-card'
import { SellerGoalsCard } from './seller-goals-card'

/**
 * Página "Metas de venta" (/sale-goals): año y moneda arriba; debajo la meta general del negocio
 * y las metas por vendedor. Las metas alimentan el avance que muestra el dashboard.
 */
export function SaleGoalsView() {
  const { year, currency, isLoading, error, load, save } = useSaleGoalStore()
  // Sin `sale_goals.update` todo queda en solo lectura (ver ROLES_Y_PERMISOS.md).
  const canUpdate = useCan('sale_goals.update')
  // La lista de vendedores (GET /sellers) exige `sales.view_all` (contrato §11.4).
  const canSeeSellers = useCan('sales.view_all')

  useEffect(() => {
    void load(year, currency)
  }, [])

  const handleSave = async (userId: number | null) => {
    const ok = await save(userId)
    if (ok) toastSuccess('Metas guardadas', `Año ${year} en ${currency}.`)
    else toastError('No se pudieron guardar las metas', useSaleGoalStore.getState().error ?? '')
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 pb-6">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <Label>Año</Label>
          <Select value={String(year)} onValueChange={(v) => void load(Number(v), currency)} disabled={isLoading}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {getGoalYearOptions().map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Moneda</Label>
          <Select value={currency} onValueChange={(v) => void load(year, v)} disabled={isLoading}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SALE_GOAL_CURRENCIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {isLoading && <Loader2 className="text-muted-foreground mb-2 size-4 animate-spin" />}
        {!canUpdate && (
          <span className="text-muted-foreground mb-2 flex items-center gap-1 text-xs">
            <Lock className="size-3.5" />
            Solo lectura
          </span>
        )}
      </div>

      {error && <AlertError title="Error" message={error} />}

      <GeneralGoalsCard canUpdate={canUpdate} onSave={(id) => void handleSave(id)} />

      {canSeeSellers ? (
        <SellerGoalsCard canUpdate={canUpdate} onSave={(id) => void handleSave(id)} />
      ) : (
        <p className="text-muted-foreground text-sm">
          Para ver las metas por vendedor necesitas el permiso «Ver ventas de todos».
        </p>
      )}
    </div>
  )
}
