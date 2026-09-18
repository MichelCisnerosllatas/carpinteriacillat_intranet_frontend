'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import NProgress from 'nprogress'
import {
  Bell, Check, Info, AlertTriangle, CheckCircle, XCircle, X,
  Loader2, OctagonX,
} from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { cn } from '@/shared/lib/utils'
import {
  useNotificationStore,
  type MessageNotification,
  type DownloadNotification,
  type DownloadStatus,
} from '@/shared/stores/notification-store'

const typeIcon: Record<MessageNotification['type'], React.ElementType> = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
}

const typeColor: Record<MessageNotification['type'], string> = {
  info: 'text-blue-500',
  success: 'text-green-500',
  warning: 'text-yellow-500',
  error: 'text-red-500',
}

const downloadStatusIcon: Record<DownloadStatus, React.ElementType> = {
  running: Loader2,
  done: CheckCircle,
  error: XCircle,
  cancelled: OctagonX,
}

const downloadStatusColor: Record<DownloadStatus, string> = {
  running: 'text-blue-500',
  done: 'text-green-500',
  error: 'text-red-500',
  cancelled: 'text-muted-foreground',
}

function downloadStatusText(n: DownloadNotification): string {
  if (n.status === 'running') return `Descargando ${n.completed}/${n.total}...`
  if (n.status === 'done') return `${n.completed} descargado${n.completed !== 1 ? 's' : ''}`
  if (n.status === 'cancelled') return `Cancelado — ${n.completed}/${n.total}`
  return `${n.completed - n.errors} ok, ${n.errors} con error`
}

function DownloadProgressBar({ n }: { n: DownloadNotification }) {
  const pct = n.total > 0 ? Math.round((n.completed / n.total) * 100) : 0
  return (
    <div className="h-1 overflow-hidden rounded-full bg-muted">
      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
    </div>
  )
}

function DownloadNotificationRow({ n }: { n: DownloadNotification }) {
  const router = useRouter()
  const { cancelDownload, removeNotification } = useNotificationStore()
  const Icon = downloadStatusIcon[n.status]
  const isRunning = n.status === 'running'

  return (
    <DropdownMenuItem
      className={cn('flex flex-col items-stretch gap-1.5 px-3 py-2.5', !n.read && 'bg-muted/50')}
      onClick={() => { NProgress.start(); router.push(n.route) }}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn('mt-0.5 size-4 shrink-0', downloadStatusColor[n.status], isRunning && 'animate-spin')} />
        <div className="flex-1 space-y-0.5">
          <p className="text-sm leading-none font-medium">{n.label}</p>
          <p className="text-xs text-muted-foreground">{downloadStatusText(n)}</p>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-5 shrink-0"
              onClick={(e) => {
                e.stopPropagation()
                if (isRunning) cancelDownload(n.id)
                else removeNotification(n.id)
              }}
            >
              <X className="size-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{isRunning ? 'Cancelar descarga' : 'Quitar de la lista'}</TooltipContent>
        </Tooltip>
      </div>
      {isRunning && <div className="ml-7"><DownloadProgressBar n={n} /></div>}
    </DropdownMenuItem>
  )
}

/** El "peek": cuando arranca una descarga, aparece anclado a la campanita mostrando de qué se
 * trata, y se contrae solo a los pocos segundos — sin robar el foco (no es un menú/Radix
 * Content real, solo una tarjeta visual). Si se hace click, abre la campanita de verdad. */
function DownloadPeekFlyout({ job, closing, onOpen }: { job: DownloadNotification; closing: boolean; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        'absolute top-full right-0 z-50 mt-2 w-72 origin-top-right rounded-lg border bg-popover p-3 text-left text-popover-foreground shadow-lg',
        closing
          ? 'animate-out fade-out zoom-out-95 slide-out-to-top-1 duration-200'
          : 'animate-in fade-in zoom-in-95 slide-in-from-top-1 duration-300',
      )}
    >
      <div className="flex items-center gap-2">
        <Loader2 className="size-4 shrink-0 animate-spin text-primary" />
        <p className="flex-1 text-sm font-medium">Descargando {job.label.toLowerCase()}</p>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{downloadStatusText(job)}</p>
      <div className="mt-2"><DownloadProgressBar n={job} /></div>
    </button>
  )
}

export function NotificationDropdown() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } =
    useNotificationStore()
  // El peek (qué descarga mostrar y cuándo ocultarla) vive en el store, no en estado local:
  // este componente se remonta en cada navegación (ver nota en notification-store.ts), y un
  // estado local se "olvidaría" de lo que ya mostró en cada remount.
  const storePeekId = useNotificationStore((s) => s.peekId)
  const dismissPeek = useNotificationStore((s) => s.dismissPeek)

  const [menuOpen, setMenuOpen] = useState(false)
  const [localPeekId, setLocalPeekId] = useState(storePeekId)
  const [peekClosing, setPeekClosing] = useState(false)
  const removeTimerRef = useRef<number | null>(null)

  const hasRunningDownload = notifications.some((n) => n.kind === 'download' && n.status === 'running')

  // Sincroniza el peek local con el del store — con animación de salida cuando el store lo
  // limpia (temporizador cumplido), pero sin animación de entrada si ya venía activo desde
  // antes de montar (p. ej. se navegó a mitad del peek: se ve de inmediato, no "aparece").
  useEffect(() => {
    if (storePeekId) {
      if (removeTimerRef.current) { window.clearTimeout(removeTimerRef.current); removeTimerRef.current = null }
      setLocalPeekId(storePeekId)
      setPeekClosing(false)
    } else if (localPeekId) {
      setPeekClosing(true)
      removeTimerRef.current = window.setTimeout(() => setLocalPeekId(null), 220)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storePeekId])

  useEffect(() => () => {
    if (removeTimerRef.current) window.clearTimeout(removeTimerRef.current)
  }, [])

  const peekJob = localPeekId
    ? (notifications.find((n) => n.id === localPeekId && n.kind === 'download') as DownloadNotification | undefined)
    : undefined

  const openFromPeek = () => {
    dismissPeek()
    if (removeTimerRef.current) { window.clearTimeout(removeTimerRef.current); removeTimerRef.current = null }
    setLocalPeekId(null)
    setMenuOpen(true)
  }

  return (
    <div className="relative">
      <DropdownMenu
        open={menuOpen}
        onOpenChange={(next) => { setMenuOpen(next); if (next) dismissPeek() }}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex">
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  {hasRunningDownload && (
                    <span className="absolute inset-0 animate-pulse rounded-md ring-2 ring-primary/50" />
                  )}
                  <Bell className="size-4" />
                  {unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 size-4 justify-center rounded-full p-0 text-[10px]"
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                  )}
                  <span className="sr-only">Notifications</span>
                </Button>
              </DropdownMenuTrigger>
            </span>
          </TooltipTrigger>
          <TooltipContent>Notificaciones</TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-xs font-normal text-muted-foreground hover:text-foreground"
                onClick={markAllAsRead}
              >
                <Check className="mr-1 size-3" />
                Mark all read
              </Button>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {notifications.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          ) : (
            <ScrollArea className="max-h-72">
              {notifications.map((n) => {
                if (n.kind === 'download') return <DownloadNotificationRow key={n.id} n={n} />

                const Icon = typeIcon[n.type]
                return (
                  <DropdownMenuItem
                    key={n.id}
                    className={cn(
                      'flex cursor-pointer items-start gap-3 px-3 py-2.5',
                      !n.read && 'bg-muted/50'
                    )}
                    onClick={() => markAsRead(n.id)}
                  >
                    <Icon className={cn('mt-0.5 size-4 shrink-0', typeColor[n.type])} />
                    <div className="flex-1 space-y-0.5">
                      <p className={cn('text-sm leading-none', !n.read && 'font-medium')}>
                        {n.title}
                      </p>
                      <p className="text-xs text-muted-foreground">{n.description}</p>
                      <p className="text-xs text-muted-foreground/60">{n.time}</p>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-5 shrink-0 opacity-0 group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeNotification(n.id)
                          }}
                        >
                          <X className="size-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Eliminar notificación</TooltipContent>
                    </Tooltip>
                  </DropdownMenuItem>
                )
              })}
            </ScrollArea>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {peekJob && <DownloadPeekFlyout job={peekJob} closing={peekClosing} onOpen={openFromPeek} />}
    </div>
  )
}
