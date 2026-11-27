// src/features/sale-goals/ui/seller-goals-card.tsx
'use client'

import { useState } from 'react'
import { Loader2, Save, Users } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { IconButton } from '@/shared/ui/icon-button'
import { Label } from '@/shared/ui/label'
import { cn } from '@/shared/lib/utils'
import { SellerSelect } from '@/features/sellers'
import { emptyAmounts, useSaleGoalStore } from '../stores/useSaleGoalStore'
import { MonthAmountGrid, sumAmounts } from './month-amount-grid'

interface SellerGoalsCardProps {
  canUpdate: boolean
  onSave: (userId: number | null) => void
}

/**
 * "Metas por vendedor". En vez de una tabla de 12 columnas por fila (ilegible en el celular) se
 * elige UN vendedor y se edita su grilla de 12 meses. Arriba se listan los vendedores que ya
 * tienen meta en el año, con su total, para saltar a ellos con un clic.
 */
export function SellerGoalsCard({ canUpdate, onSave }: SellerGoalsCardProps) {
  const { bySeller, sellerNames, currency, isLoading, savingKey, setSellerAmount, fieldErrors } =
    useSaleGoalStore()
  const [sellerId, setSellerId] = useState<number | null>(null)

  const amounts = sellerId != null ? (bySeller[sellerId] ?? emptyAmounts()) : emptyAmounts()
  const isSaving = sellerId != null && savingKey === sellerId
  // Vendedores que ya tienen alguna meta cargada en el año (con total mayor a 0).
  const withGoals = Object.entries(bySeller)
    .map(([id, values]) => ({ id: Number(id), total: sumAmounts(values) }))
    .filter((s) => s.total > 0)

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="size-4" />
            Metas por vendedor
          </CardTitle>
          <CardDescription>
            Elige un vendedor para ver o cambiar sus metas del año.
          </CardDescription>
        </div>
        {canUpdate && sellerId != null && (
          <IconButton
            label="Guardar metas del vendedor"
            variant="default"
            disabled={isLoading || savingKey !== null}
            onClick={() => onSave(sellerId)}
            icon={isSaving ? <Loader2 className="animate-spin" /> : <Save />}
          />
        )}
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {withGoals.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {withGoals.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSellerId(s.id)}
                aria-pressed={sellerId === s.id}
              >
                <Badge
                  variant={sellerId === s.id ? 'default' : 'outline'}
                  className={cn('gap-1.5 py-1 font-normal', sellerId !== s.id && 'hover:bg-muted')}
                >
                  {sellerNames[s.id] ?? `Vendedor #${s.id}`}
                  <span className="tabular-nums opacity-80">
                    {currency} {s.total.toFixed(2)}
                  </span>
                </Badge>
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-1.5 sm:max-w-xs">
          <Label>Vendedor</Label>
          <SellerSelect value={sellerId} onValueChange={setSellerId} />
        </div>

        {sellerId != null ? (
          <>
            <p className="text-muted-foreground text-sm">
              Meta anual:{' '}
              <span className="text-foreground font-semibold tabular-nums">
                {currency} {sumAmounts(amounts).toFixed(2)}
              </span>
            </p>
            <MonthAmountGrid
              idPrefix={`goal-seller-${sellerId}`}
              amounts={amounts}
              onChange={(i, value) => setSellerAmount(sellerId, i, value)}
              disabled={!canUpdate || isLoading || isSaving}
              fieldErrors={savingKey === null ? fieldErrors : null}
            />
          </>
        ) : (
          <p className="text-muted-foreground rounded-lg border border-dashed py-6 text-center text-sm">
            Selecciona un vendedor para ver sus metas.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
