'use client'

import { type Control } from 'react-hook-form'
import { Building2 } from 'lucide-react'
import { FormControl, FormField, FormItem, FormLabel } from '@/shared/ui/form'
import { VisibilityToggle } from '@/shared/ui/visibility-toggle'
import type { FormValues } from './types'

type ColumnField = 'show_brand' | 'show_quick_links' | 'show_services' | 'show_access'

export function ColumnRow({
  control, name, label, icon: Icon, description, disabled,
}: {
  control: Control<FormValues>
  name: ColumnField
  label: string
  icon: typeof Building2
  description: string
  disabled: boolean
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
          <VisibilityToggle checked={field.value} onCheckedChange={field.onChange} disabled={disabled} />
        </FormControl>
      </FormItem>
    )} />
  )
}
