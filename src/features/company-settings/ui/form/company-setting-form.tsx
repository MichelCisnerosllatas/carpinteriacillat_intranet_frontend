// src/features/company-settings/ui/form/company-setting-form.tsx
'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { Loader2, Share2, Phone as PhoneIcon, ArrowRight } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { swalConfirm, swalSuccess } from '@/shared/lib/swal'
import { toastError } from '@/shared/lib/toast'
import { ENTITY_STATES } from '@/shared/config/entity-states'
import { AlertError } from '@/widgets/alerts_components'
import { useCompanySettingStore } from '../../stores/useCompanySettingStore'
import { CompanyLogoField } from './company-logo-field'

const schema = z.object({
  business_name: z.string().min(1, 'La razón social es requerida.').max(255),
  trade_name:    z.string().max(255).optional(),
  tax_id:        z.string().max(20).optional(),
  tax_address:   z.string().optional(),
  logo:          z.string().max(255).optional(),
  status:        z.number(),
})

type FormValues = z.infer<typeof schema>

export function CompanySettingForm() {
  const { data, isLoading, message, update } = useCompanySettingStore()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      business_name: '', trade_name: '', tax_id: '', tax_address: '',
      logo: undefined, status: 1,
    },
  })

  useEffect(() => {
    if (data) {
      form.reset({
        business_name: data.businessName,
        trade_name:    data.tradeName ?? '',
        tax_id:        data.taxId ?? '',
        tax_address:   data.taxAddress ?? '',
        logo:          data.logo ?? undefined,
        status:        data.statusValue,
      })
    }
  }, [data])

  const onSubmit = async (values: FormValues) => {
    const confirmed = await swalConfirm({
      title: '¿Guardar cambios?',
      text: values.business_name,
      confirmText: 'Sí, guardar',
      cancelText: 'Cancelar',
    })
    if (!confirmed) return

    const payload = {
      business_name: values.business_name,
      trade_name:    values.trade_name || undefined,
      tax_id:        values.tax_id || undefined,
      tax_address:   values.tax_address || undefined,
      logo:          values.logo || undefined,
      status:        values.status,
    }

    const success = await update(payload)

    if (success) {
      await swalSuccess('Actualizado', 'La configuración de la empresa fue guardada.')
    } else {
      toastError('Error', useCompanySettingStore.getState().message ?? 'No se pudo guardar la configuración.')
    }
  }

  const isSubmitting = isLoading

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Logo de la empresa</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <FormField control={form.control} name="logo" render={({ field }) => (
              <FormItem>
                <FormControl>
                  <CompanyLogoField value={field.value} onChange={field.onChange} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Datos fiscales</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField control={form.control} name="business_name" render={({ field }) => (
              <FormItem>
                <FormLabel>Razón social <span className="text-destructive">*</span></FormLabel>
                <FormControl><Input placeholder="Ej: Carpintería Cillat S.A.C." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="trade_name" render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre comercial</FormLabel>
                <FormControl><Input placeholder="Ej: Cillat" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="tax_id" render={({ field }) => (
              <FormItem>
                <FormLabel>RUC</FormLabel>
                <FormControl><Input placeholder="Ej: 20123456789" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="status" render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <Select key={`status-${field.value}`} value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
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
            <FormField control={form.control} name="tax_address" render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Dirección fiscal</FormLabel>
                <FormControl><Textarea placeholder="Dirección fiscal de la empresa" className="resize-none" rows={3} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contactos, sitio web y redes sociales</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 sm:flex-row">
            <Link href="/company-contacts" className="flex flex-1 items-center justify-between gap-2 rounded-lg border p-3 text-sm hover:bg-muted/50">
              <span className="flex items-center gap-2"><PhoneIcon className="size-4 text-muted-foreground" />Gestionar teléfonos y correos</span>
              <ArrowRight className="size-4 text-muted-foreground" />
            </Link>
            <Link href="/company-social-networks" className="flex flex-1 items-center justify-between gap-2 rounded-lg border p-3 text-sm hover:bg-muted/50">
              <span className="flex items-center gap-2"><Share2 className="size-4 text-muted-foreground" />Gestionar sitio web y redes sociales</span>
              <ArrowRight className="size-4 text-muted-foreground" />
            </Link>
          </CardContent>
        </Card>

        <Separator />
        {message && <AlertError title="Error al actualizar" message={message} />}
        <div className="flex items-center justify-end gap-3">
          <Button type="submit" disabled={isSubmitting} className="min-w-28">
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando...</> : 'Guardar cambios'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
