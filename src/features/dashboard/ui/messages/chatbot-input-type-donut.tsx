'use client'

import { ChartCard, DonutChart, formatNumber } from '@/shared/ui/dashboard'
import type { ChatbotInputTypeDto } from '../../model/dashboard-messages.dto'

// Texto vs voz: cuántos mensajes de los visitantes llegaron escritos o como nota de voz.
export function ChatbotInputTypeDonut({ data }: { data: ChatbotInputTypeDto[] | undefined }) {
  const rows = data ?? []
  const total = rows.reduce((sum, r) => sum + r.count, 0)

  return (
    <ChartCard
      title='Chatbot: texto vs voz'
      description='Tipo de mensaje enviado por los visitantes'
      isLoading={!data}
      isEmpty={total === 0}
    >
      <DonutChart
        data={rows.map((r) => ({ label: r.label, value: r.count }))}
        valueFormatter={(v) => `${formatNumber(v)} mensajes`}
        centerValue={formatNumber(total)}
        centerLabel='mensajes'
      />
    </ChartCard>
  )
}
