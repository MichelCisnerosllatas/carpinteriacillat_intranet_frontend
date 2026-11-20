'use client'

import { Bot, Mail, MailCheck, Star } from 'lucide-react'
import { formatNumber, formatPercent, KpiCard } from '@/shared/ui/dashboard'
import type { MessagesKpisDto } from '../../model/dashboard-messages.dto'

export function MessagesKpis({ kpis }: { kpis: MessagesKpisDto | undefined }) {
  const isLoading = !kpis

  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
      <KpiCard
        title='Mensajes de contacto'
        icon={Mail}
        isLoading={isLoading}
        value={formatNumber(kpis?.contact_total)}
        description={`${formatNumber(kpis?.contact_new)} nuevos sin atender`}
      />
      <KpiCard
        title='Tasa de atención'
        icon={MailCheck}
        isLoading={isLoading}
        value={formatPercent(kpis?.contact_attended_rate_pct ?? null)}
        progress={kpis?.contact_attended_rate_pct ?? 0}
        description='Mensajes del periodo marcados como atendidos'
      />
      <KpiCard
        title='Testimonios'
        icon={Star}
        isLoading={isLoading}
        value={formatNumber(kpis?.testimonies_total)}
        description={
          kpis?.testimonies_avg_rating != null
            ? `Promedio: ${formatNumber(kpis.testimonies_avg_rating, 1)} de 5 estrellas`
            : 'Sin calificaciones en el periodo'
        }
      />
      <KpiCard
        title='Conversaciones del chatbot'
        icon={Bot}
        isLoading={isLoading}
        value={formatNumber(kpis?.chatbot_conversations)}
        description={`${formatNumber(kpis?.chatbot_messages)} mensajes · ${formatNumber(kpis?.chatbot_visitors_with_contact)} visitantes dejaron contacto`}
      />
    </div>
  )
}
