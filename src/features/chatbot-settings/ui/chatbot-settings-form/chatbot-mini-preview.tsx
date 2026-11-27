'use client'

import { ArrowLeft, MessageSquareText, Mic, X } from 'lucide-react'
import { FaIcon } from '@/shared/ui/icon-picker/fa-icon'
import { parseFaIconValue } from '@/shared/ui/icon-picker/fontawesome-icons'
import { cn } from '@/shared/lib/utils'
import { type ChatbotSettingFormValues } from '../../data/schema'

/** Mini maqueta del chatbot (pantalla inicial + botón flotante) con los valores actuales. */
export function ChatbotMiniPreview({ values }: { values: ChatbotSettingFormValues }) {
  const isLeft = values.position === 'bottom-left'
  return (
    <div className="relative h-[360px] overflow-hidden rounded-lg border bg-muted/40">
      {!values.chatbot_state && (
        <div className="absolute inset-x-0 top-0 z-10 bg-amber-100 px-2 py-1 text-center text-[11px] text-amber-900 dark:bg-amber-950 dark:text-amber-200">
          Oculto en la web — solo se ve aquí
        </div>
      )}
      <div className={cn('absolute bottom-16 w-[230px] overflow-hidden rounded-xl border bg-background shadow-lg', isLeft ? 'left-3' : 'right-3')}>
        <div className="flex items-center gap-2 px-3 py-2 text-white" style={{ backgroundColor: values.primary_color }}>
          <ArrowLeft className="size-3.5 opacity-40" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold">{values.header_title || 'Título'}</p>
            {values.header_subtitle && <p className="truncate text-[10px] opacity-80">{values.header_subtitle}</p>}
          </div>
          <X className="size-3.5" />
        </div>
        <div className="flex flex-col gap-2 p-3">
          <p className="rounded-lg bg-muted px-2 py-1.5 text-[11px]">{values.welcome_message || '...'}</p>
          {['Opción 1', 'Opción 2'].map((o) => (
            <div key={o} className="flex items-center gap-2 rounded-md border px-2 py-1.5">
              <span className="size-5 rounded-full" style={{ backgroundColor: `${values.primary_color}33` }} />
              <span className="flex-1 text-[11px]">{o}</span>
              <span className="text-[11px] text-muted-foreground">›</span>
            </div>
          ))}
          <div className="mt-1 flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] text-muted-foreground">
            <span className="flex-1 truncate">{values.input_placeholder}</span>
            {values.allow_voice && <Mic className="size-3" />}
          </div>
        </div>
      </div>
      <div
        className="absolute flex size-11 items-center justify-center rounded-full text-white shadow-lg"
        style={{
          backgroundColor: values.primary_color,
          bottom: Math.min(values.offset_y, 40) / 2 + 4,
          [isLeft ? 'left' : 'right']: Math.min(values.offset_x, 40) / 2 + 4,
        }}
        title={values.launcher_icon}
      >
        {parseFaIconValue(values.launcher_icon)
          ? <FaIcon value={values.launcher_icon} className="size-5" />
          : <MessageSquareText className="size-5" />}
      </div>
    </div>
  )
}
