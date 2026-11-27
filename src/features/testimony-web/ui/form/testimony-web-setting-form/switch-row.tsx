'use client'

import { type Control } from 'react-hook-form'
import { type LucideIcon } from 'lucide-react'
import { FormControl, FormField, FormItem, FormLabel } from '@/shared/ui/form'
import { Switch } from '@/shared/ui/switch'
import type { FormValues } from './types'

export function SwitchRow({ control, name, label, icon: Icon }: { control: Control<FormValues>; name: 'show_photo' | 'show_rating' | 'show_city' | 'show_email' | 'show_delivered' | 'show_verified'; label: string; icon: LucideIcon }) {
  return (
    <FormField control={control} name={name} render={({ field }) => (
      <FormItem className="flex items-center justify-between gap-2">
        <FormLabel className="flex items-center gap-1.5 font-normal"><Icon className="size-3.5 text-muted-foreground" />{label}</FormLabel>
        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
      </FormItem>
    )} />
  )
}
