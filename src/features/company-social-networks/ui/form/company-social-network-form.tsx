// src/features/company-social-networks/ui/form/company-social-network-form.tsx
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
import { useCompanySocialNetworkListStore } from '../../stores/useCompanySocialNetworkListStore'
import { useCompanySocialNetworkFormStore } from '../../stores/useCompanySocialNetworkFormStore'

const schema = z.object({
  name: z.string().min(1, 'El nombre es requerido.').max(100),
  link: z.string().min(1, 'El link es requerido.').url('Debe ser una URL válida.'),
  showOnWebsite: z.boolean(),
  order: z.number().min(1),
  status: z.number(),
})

type FormValues = z.infer<typeof schema>

export function CompanySocialNetworkForm({ mode, id }: { mode: 'create' | 'edit'; id?: string }) {
  const router = useRouter()
  const { currentItem, items } = useCompanySocialNetworkListStore()
  const { isSubmitting, error, fieldErrors, create, update, reset } = useCompanySocialNetworkFormStore()
  const isEdit = mode === 'edit'
  const resolved = currentItem ?? (id ? items.find((i) => i.id === Number(id)) ?? null : null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', link: '', showOnWebsite: false, order: 1, status: 1 },
  })

  useEffect(() => {
    if (isEdit && resolved) {
      form.reset({
        name: resolved.name,
        link: resolved.link,
        showOnWebsite: resolved.showOnWebsite,
        order: resolved.order,
        status: resolved.statusValue,
      })
    }
  }, [isEdit, resolved?.id])

  useEffect(() => () => reset(), [])

  const onSubmit = async (values: FormValues) => {
    const confirmed = await swalConfirm({
      title: isEdit ? '¿Guardar cambios?' : '¿Crear red social?',
      text: values.name, confirmText: isEdit ? 'Sí, guardar' : 'Sí, crear', cancelText: 'Cancelar',
    })
    if (!confirmed) return

    const payload = {
      name: values.name,
      link: values.link,
      show_on_website: (values.showOnWebsite ? 1 : 0) as 0 | 1,
      order: values.order,
      status: values.status,
    }

    const success = isEdit ? await update(resolved!.id, payload) : await create(payload)

    if (success) {
      await swalSuccess(isEdit ? 'Actualizado' : 'Creado', values.name)
      router.push('/company-social-networks')
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
                <FormLabel>Nombre <span className="text-destructive">*</span></FormLabel>
                <FormControl><Input placeholder="Ej: Facebook, Instagram" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="link" render={({ field }) => (
              <FormItem>
                <FormLabel>Link <span className="text-destructive">*</span></FormLabel>
                <FormControl><Input placeholder="https://www.facebook.com/tu-pagina" {...field} /></FormControl>
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
          <Button type="button" variant="outline" onClick={() => router.push('/company-social-networks')} disabled={isSubmitting}>Cancelar</Button>
          <Button type="submit" disabled={isSubmitting} className="min-w-28">
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{isEdit ? 'Guardando...' : 'Creando...'}</> : isEdit ? 'Guardar' : 'Crear'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
