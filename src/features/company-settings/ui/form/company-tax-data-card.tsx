// src/features/company-settings/ui/form/company-tax-data-card.tsx
import type { Control } from 'react-hook-form'

import {
  Card,
  CardContent,
  CardHeader,
} from '@/shared/ui/card'

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form'

import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'

import { ENTITY_STATES } from '@/shared/config/entity-states'
import { CompanySectionTitle } from './company-section-title'
import { CompanySettingFormValues } from '../../lib/company-setting-form.schema'

interface CompanyTaxDataCardProps {
  control: Control<CompanySettingFormValues>
  disabled: boolean
}

const fieldTransition =
  'transition-[border-color,box-shadow] duration-200'

export function CompanyTaxDataCard({
  control,
  disabled,
}: CompanyTaxDataCardProps) {
  return (
    <Card
      className="
        overflow-hidden
        transition-shadow duration-300
        hover:shadow-md
        lg:col-span-8
        xl:col-span-9
      "
    >
      <CardHeader className="border-b ">
        <CompanySectionTitle
          title="Datos fiscales"
          help="Información legal, tributaria y comercial de la empresa."
        />
      </CardHeader>

      <CardContent className="grid grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-2 xl:grid-cols-3">
        <FormField
          control={control}
          name="business_name"
          render={({ field }) => (
            <FormItem className="xl:col-span-2">
              <FormLabel>
                Razón social
                <span className="ml-1 text-destructive">
                  *
                </span>
              </FormLabel>

              <FormControl>
                <Input
                  placeholder="Ej: Carpintería Cillat S.A.C."
                  autoComplete="organization"
                  disabled={disabled}
                  className={fieldTransition}
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="trade_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre comercial</FormLabel>

              <FormControl>
                <Input
                  placeholder="Ej: Cillat"
                  disabled={disabled}
                  className={fieldTransition}
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="tax_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>RUC</FormLabel>

              <FormControl>
                <Input
                  placeholder="Ej: 20123456789"
                  inputMode="numeric"
                  maxLength={11}
                  disabled={disabled}
                  className={fieldTransition}
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado</FormLabel>

              <Select
                value={String(field.value)}
                onValueChange={(value) =>
                  field.onChange(Number(value))
                }
                disabled={disabled}
              >
                <FormControl>
                  <SelectTrigger
                    className={`w-full ${fieldTransition}`}
                  >
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                </FormControl>

                <SelectContent>
                  {ENTITY_STATES.map((state) => (
                    <SelectItem
                      key={state.value}
                      value={String(state.value)}
                    >
                      {state.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="tax_address"
          render={({ field }) => (
            <FormItem className="md:col-span-2 xl:col-span-3">
              <FormLabel>Dirección fiscal</FormLabel>

              <FormControl>
                <Textarea
                  placeholder="Ingresa la dirección fiscal"
                  autoComplete="street-address"
                  disabled={disabled}
                  rows={3}
                  className={`min-h-24 resize-none ${fieldTransition}`}
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  )
}