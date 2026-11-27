'use client'

import { BarListChart, ChartCard, chartColor, formatNumber } from '@/shared/ui/dashboard'
import type { ChatbotByOptionDto } from '../../model/dashboard-messages.dto'

// Qué opción del menú inicial del chatbot eligen más los visitantes.
export function ChatbotOptionsChart({ data }: { data: ChatbotByOptionDto[] | undefined }) {
  const rows = data ?? []

  return (
    <ChartCard
      title='Chatbot: opciones elegidas'
      description='Conversaciones según la opción de inicio'
      isLoading={!data}
      isEmpty={rows.every((r) => r.count === 0)}
    >
      <BarListChart
        data={rows.map((r) => ({ label: r.title, value: r.count }))}
        seriesLabel='Conversaciones'
        valueFormatter={(v) => formatNumber(v)}
        axisLabel='Conversaciones'
        color={chartColor(6)}
      />
    </ChartCard>
  )
}
