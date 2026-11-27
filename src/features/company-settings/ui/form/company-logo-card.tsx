// src/features/company-settings/ui/form/company-logo-card.tsx
import type { RefObject } from 'react'
import type { Control } from 'react-hook-form'

import {Card, CardContent, CardHeader} from '@/shared/ui/card'
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/shared/ui/form'

import { LogoField } from '@/shared/ui/logo-field'
import { CompanySectionTitle } from './company-section-title'
import { CompanySettingFormValues } from '../../lib/company-setting-form.schema'
import type { LogoFieldHandle } from '@/shared/lib/logo-field.types'

interface CompanyLogoCardProps {
  control: Control<CompanySettingFormValues>
  logoFieldRef: RefObject<LogoFieldHandle | null>
  disabled: boolean
}

export function CompanyLogoCard({control, logoFieldRef, disabled}: CompanyLogoCardProps) {
  return (
    <Card
      className="
        h-fit overflow-hidden
        transition-shadow duration-300
        hover:shadow-md
        lg:sticky lg:top-6
        lg:col-span-4
        xl:col-span-3
      "
    >
      <CardHeader className="border-b">
        <CompanySectionTitle
          title="Logo"
          help="Pasa el cursor sobre el logo para cambiarlo o eliminarlo. Este logo se usa en el header y en el footer del sitio web público — cambiarlo aquí lo actualiza en ambos lugares."
        />
      </CardHeader>

      <CardContent className="flex min-h-48 items-center justify-center">
        <FormField
          control={control}
          name="logo"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormControl>
                <LogoField
                  ref={logoFieldRef}
                  value={field.value}
                  disabled={disabled}
                  alt="Logo de la empresa"
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