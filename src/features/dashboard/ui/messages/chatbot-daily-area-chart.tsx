'use client'

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/shared/ui/chart'
import { ChartCard, chartColor, formatNumber, tooltipFormatter } from '@/shared/ui/dashboard'
import type { ChatbotDailyDto } from '../../model/dashboard-messages.dto'

const config: ChartConfig = {
  messages: { label: 'Mensajes', color: chartColor(0) },
  conversations: { label: 'Conversaciones', color: chartColor(1) },
}

// Actividad diaria del chatbot. Ambas series son cantidades (misma unidad), por eso comparten eje.
export function ChatbotDailyAreaChart({ data }: { data: ChatbotDailyDto[] | undefined }) {
  const rows = data ?? []

  return (
    <ChartCard
      title='Chatbot: actividad diaria'
      description='Conversaciones iniciadas y mensajes recibidos por día'
      isLoading={!data}
      isEmpty={rows.every((r) => r.conversations === 0 && r.messages === 0)}
    >
      <ChartContainer config={config} className='aspect-auto h-[300px] w-full'>
        <AreaChart data={rows} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <defs>
            <linearGradient id='fillChatMessages' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='5%' stopColor='var(--color-messages)' stopOpacity={0.4} />
              <stop offset='95%' stopColor='var(--color-messages)' stopOpacity={0.03} />
            </linearGradient>
            <linearGradient id='fillChatConversations' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='5%' stopColor='var(--color-conversations)' stopOpacity={0.4} />
              <stop offset='95%' stopColor='var(--color-conversations)' stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray='3 3' />
          <XAxis dataKey='label' tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={52}
            allowDecimals={false}
            label={{ value: 'Cantidad', angle: -90, position: 'insideLeft', className: 'fill-muted-foreground text-xs' }}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                indicator='line'
                formatter={tooltipFormatter((v) => formatNumber(v), { messages: 'Mensajes', conversations: 'Conversaciones' })}
              />
            }
          />
          <Area dataKey='messages' type='monotone' fill='url(#fillChatMessages)' stroke='var(--color-messages)' strokeWidth={2} animationDuration={900} />
          <Area dataKey='conversations' type='monotone' fill='url(#fillChatConversations)' stroke='var(--color-conversations)' strokeWidth={2} animationDuration={900} />
          <ChartLegend content={<ChartLegendContent />} />
        </AreaChart>
      </ChartContainer>
    </ChartCard>
  )
}
