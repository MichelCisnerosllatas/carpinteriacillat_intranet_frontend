'use client'

import { useEffect, useRef, useState } from 'react'
import { Bell, Check, Info, AlertTriangle, CheckCircle, XCircle, X } from 'lucide-react'
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
} from '@/shared/stores/notification-store'
import { DownloadNotificationRow } from './download-notification-row'
import { DownloadPeekFlyout } from './download-peek-flyout'

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
