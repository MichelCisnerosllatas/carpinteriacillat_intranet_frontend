'use client'

// Hilo de mensajes (solo lectura) con burbujas: cliente a la derecha, asistente a la izquierda.

import { Bot, Headset, Mic, User } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { formatChatDate, formatChatTime } from '../../data/data'
import type { ChatbotMessage } from '../../data/schema'

const ROLE_LABEL: Record<ChatbotMessage['role'], string> = {
  user: 'Cliente',
  assistant: 'Asistente',
  agent: 'Agente',
}

/** "2026-11-14 10:30:00" → "2026-11-14" para agrupar por día. */
const dayKey = (value: string | null) => (value ? value.slice(0, 10) : '')

export function ChatbotConversationThread({ messages }: { messages: ChatbotMessage[] }) {
  if (messages.length === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">Esta conversación no tiene mensajes.</p>
  }

  return (
    <div className="flex flex-col gap-3">
      {messages.map((m, idx) => {
        const isUser = m.role === 'user'
        const Icon = m.role === 'user' ? User : m.role === 'agent' ? Headset : Bot
        const showDay = idx === 0 || dayKey(messages[idx - 1].createdAt) !== dayKey(m.createdAt)
        return (
          <div key={m.id} className="flex flex-col gap-3">
            {showDay && m.createdAt && (
              <div className="flex justify-center">
                <span className="rounded-full bg-muted px-3 py-0.5 text-[11px] text-muted-foreground">{formatChatDate(m.createdAt, false)}</span>
              </div>
            )}
            <div className={cn('flex w-full', isUser ? 'justify-end' : 'justify-start')}>
              <div className={cn('flex max-w-[85%] items-end gap-2', isUser && 'flex-row-reverse')}>
                <div
                  className={cn(
                    'flex size-7 shrink-0 items-center justify-center rounded-full',
                    isUser ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
                  )}
                  title={ROLE_LABEL[m.role]}
                >
                  <Icon className="size-3.5" />
                </div>
                <div
                  className={cn(
                    'rounded-2xl px-3 py-2 shadow-sm',
                    isUser ? 'rounded-br-sm bg-primary text-primary-foreground' : 'rounded-bl-sm border bg-card',
                  )}
                >
                  <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{m.content}</p>
                  <div className={cn('mt-1 flex items-center justify-end gap-1.5 text-[10px]', isUser ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                    {m.inputType === 'voice' && (
                      <Badge variant="outline" className={cn('h-4 gap-0.5 px-1 text-[10px]', isUser && 'border-primary-foreground/40 text-primary-foreground')}>
                        <Mic className="size-2.5" />voz
                      </Badge>
                    )}
                    {m.role === 'agent' && <span>Agente ·</span>}
                    <span>{formatChatTime(m.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
