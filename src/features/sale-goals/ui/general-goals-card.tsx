// src/features/sale-goals/ui/general-goals-card.tsx
'use client'

import { Building2, Loader2, Save } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { IconButton } from '@/shared/ui/icon-button'
import { useSaleGoalStore } from '../stores/useSaleGoalStore'
import { MonthAmountGrid, sumAmounts } from './month-amount-grid'

interface GeneralGoalsCardProps {
  canUpdate: boolean
  onSave: (userId: number | null) => void
}

/** "Meta general del negocio": lo que se espera vender en total cada mes (user_id = null). */
export function GeneralGoalsCard({ canUpdate, onSave }: GeneralGoalsCardProps) {
  const { general, currency, isLoading, savingKey, setGeneralAmount, fieldErrors } =
    useSaleGoalStore()
  const isSaving = savingKey === 'general'

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="size-4" />
            Meta general del negocio
          </CardTitle>
          <CardDescription>
            Meta anual:{' '}
            <span className="text-foreground font-semibold tabular-nums">
              {currency} {sumAmounts(general).toFixed(2)}
            </span>
          </CardDescription>
        </div>
        {canUpdate && (
          <IconButton
            label="Guardar meta general"
            variant="default"
            disabled={isLoading || savingKey !== null}
            onClick={() => onSave(null)}
            icon={isSaving ? <Loader2 className="animate-spin" /> : <Save />}
          />
        )}
      </CardHeader>
      <CardContent>
        <MonthAmountGrid
          idPrefix="goal-general"
          amounts={general}
          onChange={setGeneralAmount}
          disabled={!canUpdate || isLoading || isSaving}
          fieldErrors={savingKey === null ? fieldErrors : null}
        />
      </CardContent>
    </Card>
  )
}
