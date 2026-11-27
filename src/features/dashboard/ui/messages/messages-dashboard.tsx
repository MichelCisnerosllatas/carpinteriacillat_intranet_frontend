'use client'

import { useCan } from '@/features/auth/hooks/usePermission'
import { cn } from '@/shared/lib/utils'
import { ChartCard } from '@/shared/ui/dashboard'
import { hasBlock } from '../../lib/has-block'
import { useDashboardData } from '../../lib/use-dashboard-data'
import { useMessagesDashboardStore } from '../../stores/useDashboardStores'
import { DashboardNoWidgets } from '../common/dashboard-no-widgets'
import { DashboardSectionTitle } from '../common/dashboard-section-title'
import { DashboardToolbar } from '../common/dashboard-toolbar'
import { ChatbotDailyAreaChart } from './chatbot-daily-area-chart'
import { ChatbotInputTypeDonut } from './chatbot-input-type-donut'
import { ChatbotOptionsChart } from './chatbot-options-chart'
import { ChatbotStatusDonut } from './chatbot-status-donut'
import { ContactMonthlyLineChart } from './contact-monthly-line-chart'
import { ContactProjectTypePie } from './contact-project-type-pie'
import { ContactStatusDonut } from './contact-status-donut'
import { MessagesKpis } from './messages-kpis'
import { TestimoniesRatingChart } from './testimonies-rating-chart'

// Página "Mensajes y opiniones": formulario de contacto, testimonios y chatbot del sitio web.
// No muestra montos, por eso se oculta el selector de moneda.
export function MessagesDashboard() {
  const { data, isFetching, isError, message, reload } = useDashboardData(useMessagesDashboardStore)

  // Widgets que el rol puede ver: permiso 'dashboard_messages.<widget>' (ver ROLES_Y_PERMISOS.md).
  // hasBlock: además el backend debe haber mandado el bloque.
  const show = {
    kpis: useCan('dashboard_messages.kpis') && hasBlock(data, 'kpis'),
    contactByProjectType:
      useCan('dashboard_messages.contact_by_project_type') && hasBlock(data, 'contact_by_project_type'),
    contactByStatus: useCan('dashboard_messages.contact_by_status') && hasBlock(data, 'contact_by_status'),
    contactMonthly: useCan('dashboard_messages.contact_monthly') && hasBlock(data, 'contact_monthly'),
    testimoniesByRating:
      useCan('dashboard_messages.testimonies_by_rating') && hasBlock(data, 'testimonies_by_rating'),
    chatbotDaily: useCan('dashboard_messages.chatbot_daily') && hasBlock(data, 'chatbot_daily'),
    chatbotByOption: useCan('dashboard_messages.chatbot_by_option') && hasBlock(data, 'chatbot_by_option'),
    chatbotInputType: useCan('dashboard_messages.chatbot_input_type') && hasBlock(data, 'chatbot_input_type'),
    chatbotByStatus: useCan('dashboard_messages.chatbot_by_status') && hasBlock(data, 'chatbot_by_status'),
  }
  const hasAnyWidget = Object.values(show).some(Boolean)

  // Cuántos widgets quedan en cada fila de 3 (para no dejar huecos en la grilla).
  const contactCount = [show.contactByProjectType, show.contactByStatus, show.contactMonthly].filter(Boolean).length
  const chatbotCount = [show.chatbotByOption, show.chatbotInputType, show.chatbotByStatus].filter(Boolean).length

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
      ) : !hasAnyWidget ? (
        <DashboardNoWidgets />
      ) : (
        <>
          {show.kpis && <MessagesKpis kpis={data?.kpis} />}

          {/* Cada sección (con su título) solo se muestra si le queda algún widget. */}
          {contactCount > 0 && (
            <>
              <DashboardSectionTitle title='Formulario de contacto' />
              <div
                className={cn(
                  'grid grid-cols-1 gap-4',
                  contactCount >= 2 && 'md:grid-cols-2',
                  contactCount === 3 && 'xl:grid-cols-3'
                )}
              >
                {show.contactByProjectType && <ContactProjectTypePie data={data?.contact_by_project_type} />}
                {show.contactByStatus && <ContactStatusDonut data={data?.contact_by_status} />}
                {show.contactMonthly && (
                  // Con 3 widgets, en tablet la línea ocupa toda la fila de abajo.
                  <div className={cn('min-w-0', contactCount === 3 && 'md:col-span-2 xl:col-span-1')}>
                    <ContactMonthlyLineChart data={data?.contact_monthly} />
                  </div>
                )}
              </div>
            </>
          )}

          {show.testimoniesByRating && (
            <>
              <DashboardSectionTitle title='Testimonios' />
              <TestimoniesRatingChart
                data={data?.testimonies_by_rating}
                average={data?.kpis?.testimonies_avg_rating}
              />
            </>
          )}

          {(show.chatbotDaily || chatbotCount > 0) && (
            <>
              <DashboardSectionTitle title='Chatbot' />
              {show.chatbotDaily && <ChatbotDailyAreaChart data={data?.chatbot_daily} />}
              {chatbotCount > 0 && (
                <div
                  className={cn(
                    'grid grid-cols-1 gap-4',
                    chatbotCount >= 2 && 'md:grid-cols-2',
                    chatbotCount === 3 && 'xl:grid-cols-3'
                  )}
                >
                  {show.chatbotByOption && <ChatbotOptionsChart data={data?.chatbot_by_option} />}
                  {show.chatbotInputType && <ChatbotInputTypeDonut data={data?.chatbot_input_type} />}
                  {show.chatbotByStatus && <ChatbotStatusDonut data={data?.chatbot_by_status} />}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
