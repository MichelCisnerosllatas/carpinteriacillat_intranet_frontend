import { type UseFormReturn } from 'react-hook-form'
import type { ProformaTemplateFormValues } from '../../proforma-template-form.schema'

export type FormProps = { form: UseFormReturn<ProformaTemplateFormValues> }
