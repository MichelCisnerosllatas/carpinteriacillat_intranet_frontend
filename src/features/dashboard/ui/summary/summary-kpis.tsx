'use client'

import { Banknote, Bot, FileClock, HandCoins, Mail, Receipt, Settings, Target, UsersRound, Wallet } from 'lucide-react'
import { useCan } from '@/features/auth/hooks/usePermission'
import { IconLinkButton } from '@/shared/ui/icon-link-button'
import { formatMoney, formatNumber, formatPercent, KpiCard, type Currency } from '@/shared/ui/dashboard'
import type { SummaryKpisDto } from '../../model/dashboard-summary.dto'
import type { SalesGoalDto } from '../../model/dashboard-sales-performance.dto'

type SummaryKpisProps = {
  kpis: SummaryKpisDto | undefined
  /** Bloque 'goal' de la respuesta (meta del mes). Llega aunque no venga 'kpis'. */
  goal: SalesGoalDto | undefined
  currency: Currency
  /** Widget dashboard_summary.kpis: las tarjetas de ventas, cobros, proformas, etc. */
  showKpis: boolean
  /** Widget dashboard_summary.goal: la tarjeta "Meta del mes". */
  showGoal: boolean
}

export function SummaryKpis({ kpis, goal, currency, showKpis, showGoal }: SummaryKpisProps) {
  const isLoading = !kpis
  // "Vendedores activos" solo interesa a quien ve las ventas de todos.
  const canViewAll = useCan('sales.view_all')
  // El acceso a configurar metas solo se muestra a quien puede editarlas.
  const canEditGoals = useCan('sale_goals.update')
  const money = (value: number | undefined) => formatMoney(value ?? 0, currency)

  if (!showKpis && !showGoal) return null

  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
      {showKpis && (
        <>
          <KpiCard
            title='Ventas del periodo'
            icon={Banknote}
            isLoading={isLoading}
            value={money(kpis?.sales_total)}
            changePct={kpis?.sales_growth_pct ?? null}
            description={`${formatNumber(kpis?.sales_count)} ventas · antes ${money(kpis?.sales_previous_total)}`}
          />
          <KpiCard
            title='Cobrado'
            icon={Wallet}
            isLoading={isLoading}
            value={money(kpis?.collected_total)}
            description='Pagos recibidos en el periodo'
          />
          <KpiCard
            title='Por cobrar'
            icon={HandCoins}
            isLoading={isLoading}
            value={money(kpis?.receivable_total)}
            description='Saldo pendiente histórico'
          />
          <KpiCard
            title='Ticket promedio'
            icon={Receipt}
            isLoading={isLoading}
            value={money(kpis?.average_ticket)}
            description='Monto promedio por venta'
          />
          <KpiCard
            title='Proformas pendientes'
            icon={FileClock}
            isLoading={isLoading}
            value={formatNumber(kpis?.proformas_pending_count)}
            description={`Cotizado: ${money(kpis?.proformas_pending_total)}`}
          />
          <KpiCard
            title='Mensajes nuevos'
            icon={Mail}
            isLoading={isLoading}
            value={formatNumber(kpis?.contact_messages_new_count)}
            description='Formulario de contacto sin atender'
          />
          <KpiCard
            title='Chats abiertos'
            icon={Bot}
            isLoading={isLoading}
            value={formatNumber(kpis?.chatbot_open_count)}
            description='Conversaciones del chatbot en curso'
          />
          {canViewAll && (
            <KpiCard
              title='Vendedores activos'
              icon={UsersRound}
              isLoading={isLoading}
              value={formatNumber(kpis?.sellers_active)}
              description='Con al menos una venta en el periodo'
            />
          )}
        </>
      )}
      {showGoal && (
        <KpiCard
          title='Meta del mes'
          icon={Target}
          action={
            canEditGoals && (
              <IconLinkButton href='/sale-goals' label='Configurar metas' icon={<Settings />} className='size-8' />
            )
          }
          isLoading={!goal}
          value={goal?.amount != null ? formatPercent(goal.progress_pct) : 'Sin meta'}
          progress={goal?.amount != null ? (goal.progress_pct ?? 0) : undefined}
          description={
            goal?.amount != null
              ? `Meta: ${money(goal.amount)}`
              : 'Registra la meta mensual para ver el avance'
          }
        />
      )}
    </div>
  )
}
