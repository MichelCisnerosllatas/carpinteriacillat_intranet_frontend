import type { CompanyContactType } from '../model/companycontactget.dto'

export type ContactTypeOption = {
  value: CompanyContactType
  label: string
}

export const CONTACT_TYPE_OPTIONS: ContactTypeOption[] = [
  { value: 'phone', label: 'Teléfono' },
  { value: 'mobile', label: 'Celular' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'fax', label: 'Fax' },
]

export const getContactTypeOption = (value: CompanyContactType): ContactTypeOption =>
  CONTACT_TYPE_OPTIONS.find((t) => t.value === value) ?? CONTACT_TYPE_OPTIONS[0]
