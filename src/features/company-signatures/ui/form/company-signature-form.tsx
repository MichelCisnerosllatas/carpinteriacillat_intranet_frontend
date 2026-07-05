// src/features/company-signatures/ui/form/company-signature-form.tsx
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { swalConfirm, swalSuccess } from '@/shared/lib/swal'
import { ENTITY_STATES } from '@/shared/config/entity-states'
import { applyApiErrors } from '@/shared/lib/api-errors'
import { AlertError } from '@/widgets/alerts_components'
import { useCompanySignatureListStore } from '../../stores/useCompanySignatureListStore'
import { useCompanySignatureFormStore } from '../../stores/useCompanySignatureFormStore'
import { SignatureImageField } from './signature-image-field'

const schema = z.object({
  signer_name:     z.string().min(1, 'El nombre del firmante es requerido.').max(255),
  position:        z.string().max(150).optional(),
  phone:           z.string().max(100).optional(),
  signature_image: z.string().max(255).optional(),
  status:          z.number(),
})

type FormValues = z.infer<typeof schema>

export function CompanySignatureForm({ mode, id }: { mode: 'create' | 'edit'; id?: string }) {
  const router = useRouter()
  const { currentItem, items }                                      = useCompanySignatureListStore()
  const { isSubmitting, error, fieldErrors, create, update, reset } = useCompanySignatureFormStore()
  const isEdit = mode === 'edit'
  const resolved = currentItem ?? (id ? items.find((i) => i.id === Number(id)) ?? null : null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { signer_name: '', position: '', phone: '', signature_image: undefined, status: 1 },
  })

  useEffect(() => {
    if (isEdit && resolved) {
      form.reset({
        signer_name:     resolved.signerName,
        position:        resolved.position ?? '',
        phone:           resolved.phone ?? '',
        signature_image: resolved.signatureImage ?? undefined,
        status:          resolved.statusValue,
      })
    }
  }, [isEdit, resolved?.id])

  useEffect(() => () => reset(), [])

  const onSubmit = async (values: FormValues) => {
    const confirmed = await swalConfirm({
      title: isEdit ? '¿Guardar cambios?' : '¿Crear firma?',
      text: values.signer_name, confirmText: isEdit ? 'Sí, guardar' : 'Sí, crear', cancelText: 'Cancelar',
    })
    if (!confirmed) return

    const payload = {
      signer_name:     values.signer_name,
      position:        values.position || undefined,
      phone:           values.phone || undefined,
      signature_image: values.signature_image || undefined,
      status:          values.status,
    }

    const success = isEdit
      ? await update(resolved!.id, payload)
      : await create(payload)

    if (success) {
      await swalSuccess(isEdit ? 'Actualizado' : 'Creado', values.signer_name)
      router.push('/company-signatures')
    } else {
      applyApiErrors(form, fieldErrors)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 max-w-lg">
        <Card>
          <CardContent className="pt-6 flex flex-col gap-4">
            <FormField control={form.control} name="signature_image" render={({ field }) => (
              <FormItem>
                <FormLabel>Imagen de firma</FormLabel>
                <FormControl>
                  <SignatureImageField
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="signer_name" render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del firmante <span className="text-destructive">*</span></FormLabel>
                <FormControl><Input placeholder="Ej: Juan Pérez" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="position" render={({ field }) => (
              <FormItem>
                <FormLabel>Cargo</FormLabel>
                <FormControl><Input placeholder="Ej: Gerente General" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="phone" render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl><Input placeholder="Ej: 999 999 999" {...field} /></FormControl>
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
          </CardContent>
        </Card>

        <Separator />
        {error && <AlertError title={isEdit ? 'Error al actualizar' : 'Error al crear'} message={error} apiError={fieldErrors ? { errors: fieldErrors } : undefined} />}
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push('/company-signatures')} disabled={isSubmitting}>Cancelar</Button>
          <Button type="submit" disabled={isSubmitting} className="min-w-28">
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{isEdit ? 'Guardando...' : 'Creando...'}</> : isEdit ? 'Guardar' : 'Crear'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
