'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, MessageSquare, CalendarDays, CheckCircle2, XCircle, RotateCcw, Trash2, Globe, Phone } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'
import { cn } from '@/shared/lib/utils'
import { swalConfirmAction, swalDeleteConfirm } from '@/shared/lib/swal'
import { toastSuccess } from '@/shared/lib/toast'
import { getContactMessageStatusOption, getContactMessageProjectTypeLabel } from '../../data/data'
import { useContactMessageListStore } from '../../stores/useContactMessageListStore'
import { useContactMessageStatusStore } from '../../stores/useContactMessageStatusStore'
import { useContactMessageDeleteStore } from '../../stores/useContactMessageDeleteStore'
import type { ContactMessageStatus } from '../../data/schema'

export function ContactMessageDetail({ id }: { id: string }) {
  const router = useRouter()
  const { currentItem, items, setCurrentItem, loadById } = useContactMessageListStore()
  const { updateStatus, isSubmitting } = useContactMessageStatusStore()
  const { deleteItem } = useContactMessageDeleteStore()

  useEffect(() => {
    if (currentItem && String(currentItem.id) === id) return
    const found = items.find((i) => String(i.id) === id)
    if (found) { setCurrentItem(found); return }

    loadById(Number(id)).then((ok) => { if (!ok) router.replace('/contact-messages') })
  }, [id, currentItem, items])

  const item = currentItem && String(currentItem.id) === id ? currentItem : null
  if (!item) return <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">Cargando...</div>

  const stateOpt = getContactMessageStatusOption(item.status)
  const otherStatuses = (['nuevo', 'atendido', 'descartado'] as ContactMessageStatus[]).filter((s) => s !== item.status)
  const statusIcon: Record<ContactMessageStatus, React.ReactNode> = {
    nuevo: <RotateCcw className="size-4 mr-1" />,
    atendido: <CheckCircle2 className="size-4 mr-1" />,
    descartado: <XCircle className="size-4 mr-1" />,
  }

  const handleChangeStatus = async (status: ContactMessageStatus) => {
    const label = getContactMessageStatusOption(status).label
    await swalConfirmAction({
      title: `¿Marcar como "${label}"?`,
      text: item.name,
      confirmText: 'Sí, continuar',
      cancelText: 'Cancelar',
      loading: { title: 'Actualizando...' },
      action: async ({ close, showError }) => {
        const ok = await updateStatus(item.id, status)
        if (ok) {
          toastSuccess('Estado actualizado', `"${item.name}" ahora está "${label}".`)
          close()
        } else {
          showError('No se pudo cambiar el estado.')
        }
      },
    })
  }

  const handleDelete = async () => {
    await swalDeleteConfirm(
      `¿Eliminar el mensaje de "${item.name}"?`, 'Esta acción no se puede deshacer.',
      async ({ close, showError }) => {
        const ok = await deleteItem(item.id)
        if (ok) {
          toastSuccess('Mensaje eliminado', `El mensaje de "${item.name}" fue eliminado.`)
          close()
          router.push('/contact-messages')
        } else {
          showError('No se pudo eliminar el mensaje.')
        }
      },
      { title: 'Eliminando...' }
    )
  }

  return (
    <div className="flex max-w-lg flex-col gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="flex size-12 items-center justify-center rounded-lg bg-muted">
              <Mail className="size-5 text-muted-foreground" />
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <h3 className="text-lg font-semibold">{item.name}</h3>
              <p className="text-sm text-muted-foreground">{item.email}</p>
              {item.phone && (
                <p className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Phone className="size-3.5" />{item.phone}
                </p>
              )}
              <div className="mt-1 flex flex-wrap gap-1.5">
                <Badge variant="outline" className={cn('w-fit text-xs', stateOpt.badge)}>{stateOpt.label}</Badge>
                <Badge variant="outline" className="w-fit text-xs">{getContactMessageProjectTypeLabel(item.projectType)}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><MessageSquare className="size-4" />Mensaje</CardTitle></CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm text-foreground">{item.message}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><CalendarDays className="size-4" />Registro</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Enviado</span><span className="font-medium">{item.createdAtFormatted}</span></div>
          {item.ipAddress && (
            <>
              <Separator />
              <div className="flex justify-between">
                <span className="flex items-center gap-1 text-muted-foreground"><Globe className="size-3.5" />IP</span>
                <span className="font-medium">{item.ipAddress}</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          {otherStatuses.map((status) => (
            <Button key={status} variant="outline" size="sm" disabled={isSubmitting} onClick={() => void handleChangeStatus(status)}>
              {statusIcon[status]}Marcar {getContactMessageStatusOption(status).label}
            </Button>
          ))}
        </div>
        <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600" onClick={() => void handleDelete()}>
          <Trash2 className="size-4 mr-1" />Eliminar
        </Button>
      </div>
    </div>
  )
}
