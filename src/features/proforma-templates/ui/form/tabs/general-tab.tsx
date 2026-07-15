'use client'

import type { UseFormReturn } from 'react-hook-form'
import { Input } from '@/shared/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { FieldTip } from '@/shared/ui/field-tip'
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
                <FieldTip
                  label={
                    <>
                      Nombre <span className="text-destructive">*</span>
                    </>
                  }
                  tip="Nombre interno para identificar esta plantilla en el listado. No aparece en el PDF."
                />
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
              <FormLabel>
                <FieldTip
                  label="Tipo de proforma"
                  tip="Si eliges un tipo, esta plantilla se usará solo para proformas de ese tipo. Déjalo en blanco para usarla con cualquier tipo."
                />
              </FormLabel>
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
              <FormLabel>
                <FieldTip
                  label="Estado"
                  tip="Activa: disponible para usarse al emitir proformas. Inactiva: se oculta, pero no se elimina."
                />
              </FormLabel>
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
