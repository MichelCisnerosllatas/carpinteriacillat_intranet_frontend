'use client'

// Detalle de un visitante: sus datos y la lista de sus conversaciones (link a cada una).

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CalendarDays, ChevronRight, Globe, KeyRound, Mail, Monitor, Phone, Trash2, UserRound } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'
import { cn } from '@/shared/lib/utils'
import { swalDeleteConfirm } from '@/shared/lib/swal'
import { toastSuccess } from '@/shared/lib/toast'
import { ErrorState } from '@/widgets/error/error-state'
import { formatChatDate, getChatbotConversationStatus, visitorDisplayName } from '@/features/chatbot-conversations/data/data'
import { describeUserAgent } from '../../data/data'
import { useChatbotVisitorDetailStore } from '../../stores/useChatbotVisitorDetailStore'
import { useChatbotVisitorDeleteStore } from '../../stores/useChatbotVisitorDeleteStore'

function InfoRow({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="flex shrink-0 items-center gap-1.5 text-muted-foreground"><Icon className="size-3.5" />{label}</span>
      <span className="min-w-0 break-words text-right font-medium">{value}</span>
    </div>
  )
}

export function ChatbotVisitorDetail({ id }: { id: string }) {
  const router = useRouter()
  const { item, isLoading, isError, message, load, reset } = useChatbotVisitorDetailStore()
  const { deleteItem } = useChatbotVisitorDeleteStore()

  useEffect(() => {
    void load(Number(id))
    return () => reset()
  }, [id])

  if (isError) {
    return (
      <ErrorState
        title="No se pudo cargar el visitante"
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

  const name = visitorDisplayName(item)

  const handleDelete = async () => {
    await swalDeleteConfirm(
      `¿Eliminar a "${name}"?`, `Se borran también sus ${item.conversations.length} conversación(es). Esta acción no se puede deshacer.`,
      async ({ close, showError }) => {
        const ok = await deleteItem(item.id)
        if (ok) {
          toastSuccess('Visitante eliminado', name)
          close()
          router.push('/chatbot/visitors')
        } else {
          showError(useChatbotVisitorDeleteStore.getState().error ?? 'No se pudo eliminar el visitante.')
        }
      },
      { title: 'Eliminando...' }
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <div className="flex flex-col gap-4 lg:col-span-5">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted">
                <UserRound className="size-5 text-muted-foreground" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <h3 className={cn('truncate font-semibold', !item.name && 'italic text-muted-foreground')}>{name}</h3>
                {item.phone && <p className="flex items-center gap-1 text-sm text-muted-foreground"><Phone className="size-3.5" />{item.phone}</p>}
                {item.email && <p className="flex items-center gap-1 truncate text-sm text-muted-foreground"><Mail className="size-3.5" />{item.email}</p>}
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {item.userId
                    ? <Badge variant="outline" className="text-xs">Usuario registrado #{item.userId}</Badge>
                    : <Badge variant="outline" className="text-xs text-muted-foreground">{item.name || item.phone ? 'Con datos de contacto' : 'Anónimo'}</Badge>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Registro técnico</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-2">
            <InfoRow icon={CalendarDays} label="Primera visita" value={formatChatDate(item.createdAt)} />
            <Separator />
            <InfoRow icon={CalendarDays} label="Última visita" value={formatChatDate(item.lastSeenAt)} />
            <Separator />
            <InfoRow icon={Monitor} label="Dispositivo" value={describeUserAgent(item.userAgent)} />
            <Separator />
            <InfoRow icon={Globe} label="IP" value={item.ipAddress ?? '—'} />
            <Separator />
            <InfoRow icon={KeyRound} label="Token" value={<code className="text-[11px]">{item.token}</code>} />
          </CardContent>
        </Card>

        <div>
          <Button variant="outline" size="sm" className="gap-1 text-red-500 hover:text-red-600" onClick={() => void handleDelete()}>
            <Trash2 className="size-4" />Eliminar visitante
          </Button>
        </div>
      </div>

      <Card className="lg:col-span-7">
        <CardHeader><CardTitle className="text-sm">Conversaciones ({item.conversations.length})</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-2">
          {item.conversations.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">Este visitante no tiene conversaciones.</p>
          )}
          {item.conversations.map((c) => {
            const s = getChatbotConversationStatus(c.status)
            return (
              <Link
                key={c.id}
                href={`/chatbot/conversations/${c.id}`}
                className="flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors hover:bg-muted"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{c.optionTitle ?? 'Conversación'}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.messagesCount} mensaje(s) · {formatChatDate(c.lastMessageAt ?? c.createdAt)}
                  </p>
                </div>
                <Badge variant="outline" className={cn('text-xs', s.badge)}>{s.label}</Badge>
                <ChevronRight className="size-4 text-muted-foreground" />
              </Link>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
