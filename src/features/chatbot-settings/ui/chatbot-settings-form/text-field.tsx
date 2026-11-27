'use client'

import { type Control, type FieldPath } from 'react-hook-form'
import { Input } from '@/shared/ui/input'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form'
import { type ChatbotSettingFormValues } from '../../data/schema'

/** Input de texto simple enlazado al form. */
export function TextField({
  control, name, label, placeholder, description, maxLength,
}: {
  control: Control<ChatbotSettingFormValues>
  name: FieldPath<ChatbotSettingFormValues>
  label: string
  placeholder?: string
  description?: string
  maxLength?: number
}) {
  return (
    <FormField control={control} name={name} render={({ field }) => (
      <FormItem>
        <FormLabel className="font-normal">{label}</FormLabel>
        <FormControl>
          <Input placeholder={placeholder} maxLength={maxLength} value={(field.value as string) ?? ''} onChange={field.onChange} onBlur={field.onBlur} />
        </FormControl>
        {description && <FormDescription className="text-xs">{description}</FormDescription>}
        <FormMessage />
      </FormItem>
    )} />
  )
}
