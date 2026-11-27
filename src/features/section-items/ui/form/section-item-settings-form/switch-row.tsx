'use client'

import { FormControl, FormField, FormItem, FormLabel } from '@/shared/ui/form'
import { Switch } from '@/shared/ui/switch'
import type { FormValues } from './types'

export function SwitchRow({ control, name, label }: { control: any; name: keyof FormValues; label: string }) {
  return (
    <FormField control={control} name={name} render={({ field }) => (
      <FormItem className="flex items-center justify-between gap-2">
        <FormLabel className="font-normal">{label}</FormLabel>
        <FormControl><Switch checked={field.value as boolean} onCheckedChange={field.onChange} /></FormControl>
      </FormItem>
    )} />
  )
}
