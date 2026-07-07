// src/features/company-contacts/ui/form/company-contact-form.tsx
'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Card, CardContent } from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'
import { Switch } from '@/shared/ui/switch'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/shared/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { swalConfirm, swalSuccess } from '@/shared/lib/swal'
import { ENTITY_STATES } from '@/shared/config/entity-states'
import { applyApiErrors } from '@/shared/lib/api-errors'
import { AlertError } from '@/widgets/alerts_components'
import { CONTACT_TYPE_OPTIONS } from '../../data/data'
import { useCompanyContactListStore } from '../../stores/useCompanyContactListStore'
import { useCompanyContactFormStore } from '../../stores/useCompanyContactFormStore'

const schema = z.object({
  name: z.string().max(100).optional(),
  phone: z.string().min(1, 'El teléfono es requerido.').max(50),
  type: z.union([z.literal('phone'), z.literal('mobile'), z.literal('fax'), z.literal('whatsapp')]),
  email: z.union([z.literal(''), z.string().email('Correo inválido.')]).optional(),
  isPrimary: z.boolean(),
  showOnWebsite: z.boolean(),
  order: z.number().min(1),
  status: z.number(),
})

type FormValues = z.infer<typeof schema>

export function CompanyContactForm({ mode, id }: { mode: 'create' | 'edit'; id?: string }) {
  const router = useRouter()
  const { currentItem, items } = useCompanyContactListStore()
  const { isSubmitting, error, fieldErrors, create, update, reset } = useCompanyContactFormStore()
  const isEdit = mode === 'edit'
  const resolved = currentItem ?? (id ? items.find((i) => i.id === Number(id)) ?? null : null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', phone: '', type: 'phone', email: '', isPrimary: false, showOnWebsite: false, order: 1, status: 1 },
  })

  useEffect(() => {
    if (isEdit && resolved) {
      form.reset({
        name: resolved.name ?? '',
        phone: resolved.phone,
        type: resolved.type,
        email: resolved.email ?? '',
        isPrimary: resolved.isPrimary,
        showOnWebsite: resolved.showOnWebsite,
        order: resolved.order,
        status: resolved.statusValue,
      })
    }
  }, [isEdit, resolved?.id])

  useEffect(() => () => reset(), [])

  const onSubmit = async (values: FormValues) => {
    const confirmed = await swalConfirm({
      title: isEdit ? '¿Guardar cambios?' : '¿Crear contacto?',
      text: values.name || values.phone, confirmText: isEdit ? 'Sí, guardar' : 'Sí, crear', cancelText: 'Cancelar',
    })
    if (!confirmed) return

    const payload = {
      name: values.name || undefined,
      phone: values.phone,
      type: values.type,
      email: values.email || undefined,
      is_primary: (values.isPrimary ? 1 : 0) as 0 | 1,
      show_on_website: (values.showOnWebsite ? 1 : 0) as 0 | 1,
      order: values.order,
      status: values.status,
    }

    const success = isEdit ? await update(resolved!.id, payload) : await create(payload)

    if (success) {
      await swalSuccess(isEdit ? 'Actualizado' : 'Creado', values.name || values.phone)
      router.push('/company-contacts')
    } else {
      applyApiErrors(form, fieldErrors)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 max-w-lg">
        <Card>
          <CardContent className="pt-6 flex flex-col gap-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre / Etiqueta</FormLabel>
                <FormControl><Input placeholder="Ej: Ventas, Jhessy Cisneros" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono <span className="text-destructive">*</span></FormLabel>
                  <FormControl><Input placeholder="935781400" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="type" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl><SelectTrigger className="w-full"><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {CONTACT_TYPE_OPTIONS.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>Correo</FormLabel>
                <FormControl><Input type="email" placeholder="correo@ejemplo.com" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="order" render={({ field }) => (
                <FormItem>
                  <FormLabel>Orden</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} value={field.value} onChange={(e) => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="status" render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select key={`status-${field.value}`} value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                    <FormControl><SelectTrigger className="w-full"><SelectValue /></SelectTrigger></FormControl>
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

            <FormField control={form.control} name="isPrimary" render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex flex-col gap-0.5">
                  <FormLabel className="text-sm">Contacto principal</FormLabel>
                  <FormDescription>Marca este como el contacto principal de la empresa.</FormDescription>
                </div>
                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
              </FormItem>
            )} />

            <FormField control={form.control} name="showOnWebsite" render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex flex-col gap-0.5">
                  <FormLabel className="text-sm">Mostrar en el sitio web</FormLabel>
                  <FormDescription>Visible en el landing page (módulo pro).</FormDescription>
                </div>
                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
              </FormItem>
            )} />
          </CardContent>
        </Card>

        <Separator />
        {error && <AlertError title={isEdit ? 'Error al actualizar' : 'Error al crear'} message={error} apiError={fieldErrors ? { errors: fieldErrors } : undefined} />}
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push('/company-contacts')} disabled={isSubmitting}>Cancelar</Button>
          <Button type="submit" disabled={isSubmitting} className="min-w-28">
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{isEdit ? 'Guardando...' : 'Creando...'}</> : isEdit ? 'Guardar' : 'Crear'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
