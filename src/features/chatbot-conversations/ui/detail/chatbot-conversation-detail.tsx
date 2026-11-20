'use client'

// Detalle de una conversación: datos del visitante arriba / al costado, y el hilo completo.

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CalendarDays, Globe, Hash, Mail, MessagesSquare, Phone, Trash2, UserRound } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'
import { cn } from '@/shared/lib/utils'
import { swalConfirmAction, swalDeleteConfirm } from '@/shared/lib/swal'
import { toastSuccess } from '@/shared/lib/toast'
import { ErrorState } from '@/widgets/error/error-state'
import { CHATBOT_CONVERSATION_STATUSES, formatChatDate, getChatbotConversationStatus, visitorDisplayName } from '../../data/data'
import { useChatbotConversationDetailStore } from '../../stores/useChatbotConversationDetailStore'
import { useChatbotConversationStatusStore } from '../../stores/useChatbotConversationStatusStore'
import { useChatbotConversationDeleteStore } from '../../stores/useChatbotConversationDeleteStore'
import type { ChatbotConversationStatus } from '../../model/chatbotconversationget.dto'
import { CHATBOT_STATUS_ICONS } from '../list/chatbot-conversations-row-actions'
import { ChatbotConversationThread } from './chatbot-conversation-thread'

function InfoRow({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="flex shrink-0 items-center gap-1.5 text-muted-foreground"><Icon className="size-3.5" />{label}</span>
      <span className="min-w-0 break-words text-right font-medium">{value}</span>
    </div>
  )
}

export function ChatbotConversationDetail({ id }: { id: string }) {
  const router = useRouter()
  const { item, isLoading, isError, message, load, reset } = useChatbotConversationDetailStore()
  const { updateStatus, isSubmitting } = useChatbotConversationStatusStore()
  const { deleteItem } = useChatbotConversationDeleteStore()

  useEffect(() => {
    void load(Number(id))
    return () => reset()
  }, [id])

  if (isError) {
    return (
      <ErrorState
        title="No se pudo cargar la conversación"
        message={message ?? undefined}
        primaryLabel="Reintentar"
        isPrimaryLoading={isLoading}
        onPrimaryAction={() => { void load(Number(id)) }}
      />
    )
  }

  if (!item || String(item.id) !== id) {
    return <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">Cargando...</div>
  }

  const name = visitorDisplayName(item.visitor)
  const statusOpt = getChatbotConversationStatus(item.status)
  const otherStatuses = CHATBOT_CONVERSATION_STATUSES.filter((s) => s.value !== item.status)
  const voiceCount = item.messages.filter((m) => m.inputType === 'voice').length

  const handleChangeStatus = async (status: ChatbotConversationStatus) => {
    const label = getChatbotConversationStatus(status).label
    await swalConfirmAction({
      title: `¿Marcar como "${label}"?`,
      text: status === 'closed' ? `${name} ya no podrá seguir escribiendo en esta conversación.` : name,
      confirmText: 'Sí, continuar',
      cancelText: 'Cancelar',
      loading: { title: 'Actualizando...' },
      action: async ({ close, showError }) => {
        const ok = await updateStatus(item.id, status)
        if (ok) { toastSuccess('Estado actualizado', `La conversación ahora está "${label}".`); close() }
        else showError(useChatbotConversationStatusStore.getState().error ?? 'No se pudo cambiar el estado.')
      },
    })
  }

  const handleDelete = async () => {
    await swalDeleteConfirm(
      `¿Eliminar la conversación de "${name}"?`, 'Se borran todos sus mensajes. Esta acción no se puede deshacer.',
      async ({ close, showError }) => {
        const ok = await deleteItem(item.id)
        if (ok) {
          toastSuccess('Conversación eliminada', name)
          close()
          router.push('/chatbot/conversations')
        } else {
          showError(useChatbotConversationDeleteStore.getState().error ?? 'No se pudo eliminar la conversación.')
        }
      },
      { title: 'Eliminando...' }
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      {/* Columna izquierda: visitante + datos de la conversación + acciones */}
      <div className="flex flex-col gap-4 lg:col-span-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted">
                <UserRound className="size-5 text-muted-foreground" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <h3 className={cn('truncate font-semibold', !item.visitor.name && 'italic text-muted-foreground')}>{name}</h3>
                {item.visitor.phone && <p className="flex items-center gap-1 text-sm text-muted-foreground"><Phone className="size-3.5" />{item.visitor.phone}</p>}
                {item.visitor.email && <p className="flex items-center gap-1 truncate text-sm text-muted-foreground"><Mail className="size-3.5" />{item.visitor.email}</p>}
                {!item.visitor.phone && !item.visitor.email && (
                  <p className="text-xs text-muted-foreground">Chateó de forma anónima (sin datos de contacto).</p>
                )}
                <Button asChild variant="link" size="sm" className="h-auto w-fit p-0">
                  <Link href={`/chatbot/visitors/${item.visitor.id}`}>Ver todas sus conversaciones →</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><MessagesSquare className="size-4" />Conversación</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-2">
            <InfoRow icon={Hash} label="Estado" value={<Badge variant="outline" className={cn('text-xs', statusOpt.badge)}>{statusOpt.label}</Badge>} />
            <Separator />
            <InfoRow icon={MessagesSquare} label="Opción elegida" value={item.option?.title ?? '—'} />
            <Separator />
            <InfoRow icon={MessagesSquare} label="Mensajes" value={`${item.messages.length}${voiceCount ? ` (${voiceCount} por voz)` : ''}`} />
            <Separator />
            <InfoRow icon={Globe} label="Página" value={item.pageUrl ?? '—'} />
            <Separator />
            <InfoRow icon={CalendarDays} label="Iniciada" value={formatChatDate(item.createdAt)} />
            <Separator />
            <InfoRow icon={CalendarDays} label="Última actividad" value={formatChatDate(item.lastMessageAt)} />
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-2">
          {otherStatuses.map((s) => (
            <Button key={s.value} variant="outline" size="sm" disabled={isSubmitting} onClick={() => void handleChangeStatus(s.value)} className="gap-1">
              {CHATBOT_STATUS_ICONS[s.value]}Marcar {s.label}
            </Button>
          ))}
          <Button variant="outline" size="sm" className="gap-1 text-red-500 hover:text-red-600" onClick={() => void handleDelete()}>
            <Trash2 className="size-4" />Eliminar
          </Button>
        </div>
      </div>

      {/* Columna derecha: el hilo */}
      <Card className="lg:col-span-8">
        <CardHeader><CardTitle className="text-sm">Mensajes</CardTitle></CardHeader>
        <CardContent className="max-h-[70vh] overflow-y-auto bg-muted/20 py-4">
          <ChatbotConversationThread messages={item.messages} />
        </CardContent>
      </Card>
    </div>
  )
}
