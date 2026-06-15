'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Card, CardContent } from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { swalConfirm, swalError, swalSuccess } from '@/shared/lib/swal'
import { applyApiErrors } from '@/shared/lib/api-errors'
import { formatDatetime } from '@/shared/lib/utils'
import { ENTITY_STATES } from '@/shared/config/entity-states'
import { AlertError } from '@/widgets/alerts_components'
import { useTypeColorListStore } from '../stores/useTypeColorListStore'
import { useTypeColorFormStore } from '../stores/useTypeColorFormStore'

const schema = z.object({
  typecolor_name:        z.string().min(1, 'El nombre es requerido.').max(255),
  typecolor_description: z.string().optional(),
  typecolor_state:       z.number(),
})

type FormValues = z.infer<typeof schema>

export function TypeColorForm({ mode, id }: { mode: 'create' | 'edit'; id?: string }) {
  const router = useRouter()
  const { currentItem, items }                                          = useTypeColorListStore()
  const { isSubmitting, error, fieldErrors, create, update, reset }     = useTypeColorFormStore()
  const isEdit = mode === 'edit'
  const resolved = currentItem ?? (id ? items.find((i) => i.id === Number(id)) ?? null : null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { typecolor_name: '', typecolor_description: '', typecolor_state: 1 },
  })

  useEffect(() => {
    if (isEdit && resolved) {
      form.reset({
        typecolor_name:        resolved.name,
        typecolor_description: resolved.description ?? '',
        typecolor_state:       resolved.stateValue,
      })
    }
  }, [isEdit, resolved?.id])

  useEffect(() => () => reset(), [])

  const onSubmit = async (values: FormValues) => {
    const confirmed = await swalConfirm({
      title: isEdit ? '¿Guardar cambios?' : '¿Crear tipo de color?',
      text: values.typecolor_name, confirmText: isEdit ? 'Sí, guardar' : 'Sí, crear', cancelText: 'Cancelar',
    })
    if (!confirmed) return

    const success = isEdit
      ? await update(resolved!.id, { typecolor_name: values.typecolor_name, typecolor_description: values.typecolor_description ?? '', typecolor_state: values.typecolor_state, typecolor_updated_at: formatDatetime() })
      : await create({ typecolor_name: values.typecolor_name, typecolor_description: values.typecolor_description, typecolor_state: values.typecolor_state, typecolor_created_at: formatDatetime() })

    if (success) {
      await swalSuccess(isEdit ? 'Actualizado' : 'Creado', values.typecolor_name)
      router.push('/typecolors')
    } else {
      applyApiErrors(form, fieldErrors)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 max-w-lg">
        <Card>
          <CardContent className="pt-6 flex flex-col gap-4">
            <FormField control={form.control} name="typecolor_name" render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre <span className="text-destructive">*</span></FormLabel>
                <FormControl><Input placeholder="Ej: Nogal" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="typecolor_state" render={({ field }) => (
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
            <FormField control={form.control} name="typecolor_description" render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción</FormLabel>
                <FormControl><Textarea placeholder="Descripción opcional" className="resize-none" rows={3} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        <Separator />
        {error && <AlertError title={isEdit ? 'Error al actualizar' : 'Error al crear'} message={error} apiError={fieldErrors ? { errors: fieldErrors } : undefined} />}
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push('/typecolors')} disabled={isSubmitting}>Cancelar</Button>
          <Button type="submit" disabled={isSubmitting} className="min-w-28">
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{isEdit ? 'Guardando...' : 'Creando...'}</> : isEdit ? 'Guardar' : 'Crear'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
