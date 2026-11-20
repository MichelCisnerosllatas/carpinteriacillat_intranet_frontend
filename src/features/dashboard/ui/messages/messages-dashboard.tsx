'use client'

import { ChartCard } from '@/shared/ui/dashboard'
import { useDashboardData } from '../../lib/use-dashboard-data'
import { useMessagesDashboardStore } from '../../stores/useDashboardStores'
import { DashboardSectionTitle } from '../common/dashboard-section-title'
import { DashboardToolbar } from '../common/dashboard-toolbar'
import { ChatbotDailyAreaChart } from './chatbot-daily-area-chart'
import { ChatbotInputTypeDonut, ChatbotStatusDonut } from './chatbot-donuts'
import { ChatbotOptionsChart } from './chatbot-options-chart'
import { ContactMonthlyLineChart } from './contact-monthly-line-chart'
import { ContactProjectTypePie } from './contact-project-type-pie'
import { ContactStatusDonut } from './contact-status-donut'
import { MessagesKpis } from './messages-kpis'
import { TestimoniesRatingChart } from './testimonies-rating-chart'

// Página "Mensajes y opiniones": formulario de contacto, testimonios y chatbot del sitio web.
// No muestra montos, por eso se oculta el selector de moneda.
export function MessagesDashboard() {
  const { data, isFetching, isError, message, reload } = useDashboardData(useMessagesDashboardStore)

  return (
    <div className='flex flex-col gap-4'>
      <DashboardToolbar
        isFetching={isFetching}
        onRefresh={reload}
        showCurrency={false}
        errorMessage={isError && data ? message : null}
      />

      {isError && !data ? (
        <ChartCard title='Mensajes y opiniones' isError errorMessage={message} onRetry={reload} />
      ) : (
        <>
          <MessagesKpis kpis={data?.kpis} />

          <DashboardSectionTitle title='Formulario de contacto' />
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'>
            <ContactProjectTypePie data={data?.contact_by_project_type} />
            <ContactStatusDonut data={data?.contact_by_status} />
            <div className='min-w-0 md:col-span-2 xl:col-span-1'>
              <ContactMonthlyLineChart data={data?.contact_monthly} />
            </div>
          </div>

          <DashboardSectionTitle title='Testimonios' />
          <TestimoniesRatingChart data={data?.testimonies_by_rating} average={data?.kpis.testimonies_avg_rating} />

          <DashboardSectionTitle title='Chatbot' />
          <ChatbotDailyAreaChart data={data?.chatbot_daily} />
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'>
            <ChatbotOptionsChart data={data?.chatbot_by_option} />
            <ChatbotInputTypeDonut data={data?.chatbot_input_type} />
            <ChatbotStatusDonut data={data?.chatbot_by_status} />
          </div>
        </>
      )}
    </div>
  )
}
