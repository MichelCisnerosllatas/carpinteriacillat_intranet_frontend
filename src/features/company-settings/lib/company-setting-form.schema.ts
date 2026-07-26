// src/features/company-settings/lib/company-setting-form.schema.ts
import { z } from 'zod'

export const companySettingFormSchema = z.object({
  business_name: z
    .string()
    .trim()
    .min(1, 'La razón social es requerida.')
    .max(255, 'La razón social no debe superar los 255 caracteres.'),

  trade_name: z
    .string()
    .trim()
    .max(255, 'El nombre comercial no debe superar los 255 caracteres.')
    .optional(),

  tax_id: z
    .string()
    .trim()
    .max(20, 'El RUC no debe superar los 20 caracteres.')
    .optional(),

  tax_address: z
    .string()
    .trim()
    .optional(),

  logo: z
    .string()
    .max(255)
    .optional(),

  status: z.number(),
})

export type CompanySettingFormValues = z.infer<
  typeof companySettingFormSchema
>

export const COMPANY_SETTING_DEFAULT_VALUES: CompanySettingFormValues = {
  business_name: '',
  trade_name: '',
  tax_id: '',
  tax_address: '',
  logo: undefined,
  status: 1,
}