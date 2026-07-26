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

import { CompanyLogoField } from './company-logo-field'
import { CompanySectionTitle } from './company-section-title'
import { CompanySettingFormValues } from '../../lib/company-setting-form.schema'
import { CompanyLogoFieldHandle } from '../../lib/company-logo-field.types'

interface CompanyLogoCardProps {
  control: Control<CompanySettingFormValues>
  logoFieldRef: RefObject<CompanyLogoFieldHandle | null>
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
          help="Pasa el cursor sobre el logo para cambiarlo o eliminarlo."
        />
      </CardHeader>

      <CardContent className="flex min-h-72 items-center justify-center">
        <FormField
          control={control}
          name="logo"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormControl>
                <CompanyLogoField
                  ref={logoFieldRef}
                  value={field.value}
                  disabled={disabled}
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