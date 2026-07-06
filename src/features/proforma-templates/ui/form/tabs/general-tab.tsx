'use client'

import type { UseFormReturn } from 'react-hook-form'
import { Input } from '@/shared/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { ENTITY_STATES } from '@/shared/config/entity-states'
import { ProformaTypeSelect } from '@/features/proforma-types'
import type { ProformaTemplateFormValues } from '../proforma-template-form.schema'

export function GeneralTab({ form }: { form: UseFormReturn<ProformaTemplateFormValues> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Información general</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Nombre <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="Ej: Plantilla estándar" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="moduleTypeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de proforma</FormLabel>
              <FormControl>
                <ProformaTypeSelect value={field.value} onValueChange={field.onChange} showAll />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado</FormLabel>
              <Select
                key={`status-${field.value}`}
                value={String(field.value)}
                onValueChange={(v) => field.onChange(Number(v))}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ENTITY_STATES.map((s) => (
                    <SelectItem key={s.value} value={String(s.value)}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  )
}
