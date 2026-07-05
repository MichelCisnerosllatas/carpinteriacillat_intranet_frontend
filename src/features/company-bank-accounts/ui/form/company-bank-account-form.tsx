'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { swalConfirm, swalSuccess } from '@/shared/lib/swal'
import { applyApiErrors } from '@/shared/lib/api-errors'
import { ENTITY_STATES } from '@/shared/config/entity-states'
import { AlertError } from '@/widgets/alerts_components'
import { COMPANY_BANK_ACCOUNT_CURRENCIES, COMPANY_BANK_ACCOUNT_TYPES } from '../../data/data'
import { useCompanyBankAccountListStore } from '../../stores/useCompanyBankAccountListStore'
import { useCompanyBankAccountFormStore } from '../../stores/useCompanyBankAccountFormStore'
import { BankLogoField } from './bank-logo-field'

const schema = z.object({
  bank:           z.string().min(1, 'El banco es requerido.').max(100),
  account_number: z.string().min(1, 'El número de cuenta es requerido.').max(100),
  account_type:   z.string().max(50, 'Máximo 50 caracteres.').or(z.literal('')).optional(),
  currency:       z.string().max(20, 'Máximo 20 caracteres.').optional(),
  logo:           z.string().max(255).or(z.literal('')).optional(),
  order:          z.number().int().min(0, 'Debe ser 0 o mayor.'),
  status:         z.number(),
})

type FormValues = z.infer<typeof schema>

export function CompanyBankAccountForm({ mode, id }: { mode: 'create' | 'edit'; id?: string }) {
  const router  = useRouter()
  const { currentItem, items }                                      = useCompanyBankAccountListStore()
  const { isSubmitting, error, fieldErrors, create, update, reset } = useCompanyBankAccountFormStore()
  const isEdit   = mode === 'edit'
  const resolved = currentItem ?? (id ? items.find((i) => i.id === Number(id)) ?? null : null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      bank:           '',
      account_number: '',
      account_type:   '',
      currency:       'PEN',
      logo:           '',
      order:          1,
      status:         1,
    },
  })

  useEffect(() => {
    if (isEdit && resolved) {
      form.reset({
        bank:           resolved.bank,
        account_number: resolved.accountNumber,
        account_type:   resolved.accountType ?? '',
        currency:       resolved.currency,
        logo:           resolved.logo ?? '',
        order:          resolved.order,
        status:         resolved.status,
      })
    }
  }, [isEdit, resolved?.id])

  useEffect(() => () => reset(), [])

  const onSubmit = async (values: FormValues) => {
    const confirmed = await swalConfirm({
      title:       isEdit ? '¿Guardar cambios?' : '¿Crear cuenta bancaria?',
      text:        values.bank,
      confirmText: isEdit ? 'Sí, guardar' : 'Sí, crear',
      cancelText:  'Cancelar',
    })
    if (!confirmed) return

    const payload = {
      bank:           values.bank,
      account_number: values.account_number,
      account_type:   values.account_type || undefined,
      currency:       values.currency || 'PEN',
      logo:           values.logo || undefined,
      order:          values.order,
      status:         values.status,
    }

    const success = isEdit
      ? await update(resolved!.id, payload)
      : await create(payload)

    if (success) {
      await swalSuccess(isEdit ? 'Actualizada' : 'Creada', values.bank)
      router.push('/company-bank-accounts')
    } else {
      applyApiErrors(form, fieldErrors)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex max-w-2xl flex-col gap-4">

        {/* ── Información de la cuenta ── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Información de la cuenta
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="bank" render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Banco <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: BCP" disabled={isSubmitting} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="account_number" render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de cuenta <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: 193-1234567-0-12" className="font-mono" disabled={isSubmitting} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="account_type" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de cuenta</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Cuenta corriente"
                      list="company-bank-account-types"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <datalist id="company-bank-account-types">
                    {COMPANY_BANK_ACCOUNT_TYPES.map((t) => <option key={t} value={t} />)}
                  </datalist>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="currency" render={({ field }) => (
                <FormItem>
                  <FormLabel>Moneda</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="PEN"
                      className="uppercase"
                      list="company-bank-account-currencies"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <datalist id="company-bank-account-currencies">
                    {COMPANY_BANK_ACCOUNT_CURRENCIES.map((c) => <option key={c.value} value={c.value} />)}
                  </datalist>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="order" render={({ field }) => (
                <FormItem>
                  <FormLabel>Orden de aparición</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      placeholder="1"
                      disabled={isSubmitting}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="status" render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select
                    key={`status-${field.value}`}
                    value={String(field.value)}
                    disabled={isSubmitting}
                    onValueChange={(v) => field.onChange(Number(v))}
                  >
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {ENTITY_STATES.map((s) => (
                        <SelectItem key={s.value} value={String(s.value)}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </CardContent>
        </Card>

        {/* ── Logo ── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Logo del banco
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FormField control={form.control} name="logo" render={({ field }) => (
              <FormItem>
                <BankLogoField
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  disabled={isSubmitting}
                />
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        <Separator />
        {error && (
          <AlertError
            title={isEdit ? 'Error al actualizar' : 'Error al crear'}
            message={error}
            apiError={fieldErrors ? { errors: fieldErrors } : undefined}
          />
        )}

        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/company-bank-accounts')}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting} className="min-w-28">
            {isSubmitting
              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{isEdit ? 'Guardando...' : 'Creando...'}</>
              : isEdit ? 'Guardar cambios' : 'Crear cuenta'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
