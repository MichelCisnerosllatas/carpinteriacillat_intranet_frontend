// src/features/clients/ui/form/client-form.tsx
'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { Building2, Loader2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { swalConfirm, swalSuccess } from '@/shared/lib/swal'
import { ENTITY_STATES } from '@/shared/config/entity-states'
import { applyApiErrors } from '@/shared/lib/api-errors'
import { AlertError } from '@/widgets/alerts_components'
import { TypeDocSelect } from '@/features/typedocs'
import { useClientListStore } from '../../stores/useClientListStore'
import { useClientFormStore } from '../../stores/useClientFormStore'

const schema = z.object({
  id_typedoc:       z.number().nullable().optional(),
  business_name:    z.string().min(1, 'La razón social es requerida.').max(255),
  document_number:  z.string().max(20, 'Máximo 20 caracteres.').optional(),
  address:          z.string().optional(),
  contact_person:   z.string().optional(),
  phone:            z.string().optional(),
  email:            z.string().email('Correo inválido.').optional().or(z.literal('')),
  status:           z.number(),
})

type FormValues = z.infer<typeof schema>

export function ClientForm({ mode, id }: { mode: 'create' | 'edit'; id?: string }) {
  const router = useRouter()
  const { currentItem, items, loadById, setCurrentItem }            = useClientListStore()
  const { isSubmitting, error, fieldErrors, create, update, reset } = useClientFormStore()
  const isEdit = mode === 'edit'
  const resolved = currentItem ?? (id ? items.find((i) => i.id === Number(id)) ?? null : null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      id_typedoc: null, business_name: '', document_number: '',
      address: '', contact_person: '', phone: '', email: '', status: 1,
    },
  })

  useEffect(() => {
    if (isEdit && id) {
      void loadById(Number(id))
    }
  }, [isEdit, id])

  useEffect(() => {
    if (isEdit && resolved) {
      form.reset({
        id_typedoc:      resolved.idTypedoc,
        business_name:   resolved.businessName,
        document_number: resolved.documentNumber ?? '',
        address:         resolved.address ?? '',
        contact_person:  resolved.contactPerson ?? '',
        phone:           resolved.phone ?? '',
        email:           resolved.email ?? '',
        status:          resolved.stateValue,
      })
    }
  }, [isEdit, resolved?.id])

  useEffect(() => () => { reset(); setCurrentItem(null) }, [])

  const onSubmit = async (values: FormValues) => {
    const confirmed = await swalConfirm({
      title: isEdit ? '¿Guardar cambios?' : '¿Crear cliente?',
      text: values.business_name, confirmText: isEdit ? 'Sí, guardar' : 'Sí, crear', cancelText: 'Cancelar',
    })
    if (!confirmed) return

    const payload = {
      id_typedoc:      values.id_typedoc ?? null,
      business_name:   values.business_name,
      document_number: values.document_number,
      address:         values.address,
      contact_person:  values.contact_person,
      phone:           values.phone,
      email:           values.email,
      status:          values.status,
    }

    const success = isEdit
      ? await update(resolved!.id, payload)
      : await create(payload)

    if (success) {
      await swalSuccess(isEdit ? 'Actualizado' : 'Creado', values.business_name)
      router.push('/clients')
    } else {
      applyApiErrors(form, fieldErrors)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Building2 className="size-4" />Información del cliente</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-4">
              <FormField control={form.control} name="business_name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Razón social <span className="text-destructive">*</span></FormLabel>
                  <FormControl><Input placeholder="Ej: Carpintería Cillat SAC" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="id_typedoc" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de documento</FormLabel>
                    <FormControl>
                      <TypeDocSelect
                        value={field.value ?? null}
                        onValueChange={(v) => field.onChange(v)}
                        placeholder="Seleccionar tipo"
                        showAll
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="document_number" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de documento</FormLabel>
                    <FormControl><Input placeholder="Ej: 20123456789" maxLength={20} {...field} /></FormControl>
                    <FormDescription>Máximo 20 caracteres.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="status" render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select key={`state-${field.value}`} value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
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

              <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección</FormLabel>
                  <FormControl><Textarea placeholder="Dirección opcional" className="resize-none" rows={3} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Datos de contacto</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-4">
              <FormField control={form.control} name="contact_person" render={({ field }) => (
                <FormItem>
                  <FormLabel>Persona de contacto</FormLabel>
                  <FormControl><Input placeholder="Ej: Juan Pérez" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl><Input placeholder="Ej: 987654321" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo</FormLabel>
                  <FormControl><Input type="email" placeholder="Ej: cliente@correo.com" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>
        </div>

        <Separator />
        {error && <AlertError title={isEdit ? 'Error al actualizar' : 'Error al crear'} message={error} apiError={fieldErrors ? { errors: fieldErrors } : undefined} />}
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push('/clients')} disabled={isSubmitting}>Cancelar</Button>
          <Button type="submit" disabled={isSubmitting} className="min-w-28">
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{isEdit ? 'Guardando...' : 'Creando...'}</> : isEdit ? 'Guardar' : 'Crear'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
