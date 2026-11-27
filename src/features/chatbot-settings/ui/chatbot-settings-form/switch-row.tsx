'use client'

import { type Control } from 'react-hook-form'
import { Bot } from 'lucide-react'
import { Switch } from '@/shared/ui/switch'
import { FormControl, FormField, FormItem, FormLabel } from '@/shared/ui/form'
import { type ChatbotSettingFormValues } from '../../data/schema'

type BoolField = 'show_on_mobile' | 'allow_voice' | 'require_contact_data'

/** Fila con interruptor + texto explicativo. */
export function SwitchRow({
  control, name, label, description, icon: Icon,
}: {
  control: Control<ChatbotSettingFormValues>
  name: BoolField
  label: string
  description: string
  icon: typeof Bot
}) {
  return (
    <FormField control={control} name={name} render={({ field }) => (
      <FormItem className="flex items-center justify-between gap-3 rounded-lg border p-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <FormLabel className="font-normal">{label}</FormLabel>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        <FormControl>
          <Switch checked={field.value} onCheckedChange={field.onChange} />
        </FormControl>
      </FormItem>
    )} />
  )
}
