'use client'

import { ChartCard, chartColor, formatMoney, formatPercent, GaugeChart, type Currency } from '@/shared/ui/dashboard'
import { Settings } from 'lucide-react'
import { useCan } from '@/features/auth/hooks/usePermission'
import { IconLinkButton } from '@/shared/ui/icon-link-button'
import { useReportHref } from '../../lib/use-report-href'
import type { SalesGoalDto } from '../../model/dashboard-sales-performance.dto'

type Props = {
  goal: SalesGoalDto | undefined
  currency: Currency
}

// Medidor de la meta del mes (mes de la fecha final del filtro).
export function GoalGaugeCard({ goal, currency }: Props) {
  // Botón ↗ "Ver en reportes" con el mismo periodo y moneda del dashboard.
  const reportHref = useReportHref('ventas')
  // Acceso ⚙ a la página de metas: solo para quien puede editarlas.
  const canEditGoals = useCan('sale_goals.update')
  const hasGoal = goal?.amount != null
  const reached = (goal?.progress_pct ?? 0) >= 100

  return (
    <ChartCard
      href={reportHref}
      action={
        canEditGoals && (
          <IconLinkButton href='/sale-goals' label='Configurar metas' icon={<Settings />} className='size-8' />
        )
      }
      title='Meta del mes'
      description={goal?.month_label ?? 'Mes de la fecha final'}
      isLoading={!goal}
      isEmpty={!hasGoal}
      emptyMessage={
        canEditGoals
          ? 'No hay una meta registrada para este mes. Regístrala con el botón ⚙.'
          : 'No hay una meta registrada para este mes.'
      }
      // Se deja visible aunque no haya meta: el aviso le recuerda al usuario registrarla.
      hideWhenEmpty={false}
      footer={
        hasGoal && goal
          ? reached
            ? '¡Meta alcanzada! Superaste el objetivo del mes.'
            : `Faltan ${formatMoney(goal.remaining ?? 0, currency)} para llegar a la meta`
          : undefined
      }
    >
      {goal && (
        <div className='flex flex-col items-center gap-2'>
          <GaugeChart
            value={goal.progress_pct}
            centerValue={formatPercent(goal.progress_pct)}
            centerLabel='de avance'
            color={reached ? chartColor(2) : chartColor(0)}
          />
          <div className='grid w-full grid-cols-2 gap-2 text-center'>
            <div className='bg-muted/50 rounded-lg p-2'>
              <p className='text-muted-foreground text-xs'>Logrado</p>
              <p className='font-semibold tabular-nums'>{formatMoney(goal.achieved, currency)}</p>
            </div>
            <div className='bg-muted/50 rounded-lg p-2'>
              <p className='text-muted-foreground text-xs'>Meta</p>
              <p className='font-semibold tabular-nums'>{formatMoney(goal.amount ?? 0, currency)}</p>
            </div>
          </div>
        </div>
      )}
    </ChartCard>
  )
}
