// src/features/typeworks/ui/form/typework-form.tsx
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
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { swalConfirm, swalSuccess } from '@/shared/lib/swal'
import { ENTITY_STATES } from '@/shared/config/entity-states'
import { applyApiErrors } from '@/shared/lib/api-errors'
import { formatDatetime } from '@/shared/lib/utils'
import { AlertError } from '@/widgets/alerts_components'
import { useTypeWorkListStore } from '../../stores/useTypeWorkListStore'
import { useTypeWorkFormStore } from '../../stores/useTypeWorkFormStore'

const schema = z.object({
  typework_key:         z.string().min(1, 'La clave es requerida.').max(50).regex(/^[a-z0-9_]+$/, 'Solo minúsculas, números y guion bajo (ej: restoration).'),
  typework_name:        z.string().min(1, 'El nombre es requerido.').max(100),
  typework_description: z.string().optional(),
  typework_state:       z.number(),
})

type FormValues = z.infer<typeof schema>

export function TypeWorkForm({ mode, id }: { mode: 'create' | 'edit'; id?: string }) {
  const router = useRouter()
  const { currentItem, items }                                          = useTypeWorkListStore()
  const { isSubmitting, error, fieldErrors, create, update, reset }     = useTypeWorkFormStore()
  const isEdit = mode === 'edit'
  const resolved = currentItem ?? (id ? items.find((i) => i.id === Number(id)) ?? null : null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { typework_key: '', typework_name: '', typework_description: '', typework_state: 1 },
  })

  useEffect(() => {
    if (isEdit && resolved) {
      form.reset({
        typework_key:         resolved.key,
        typework_name:        resolved.name,
        typework_description: resolved.description ?? '',
        typework_state:       resolved.stateValue,
      })
    }
  }, [isEdit, resolved?.id])

  useEffect(() => () => reset(), [])

  const onSubmit = async (values: FormValues) => {
    const confirmed = await swalConfirm({
      title: isEdit ? '¿Guardar cambios?' : '¿Crear tipo de trabajo?',
      text: values.typework_name, confirmText: isEdit ? 'Sí, guardar' : 'Sí, crear', cancelText: 'Cancelar',
    })
    if (!confirmed) return

    const description = values.typework_description?.trim() || null
    // La clave solo se envía al crear: la API no permite cambiarla.
    const success = isEdit
      ? await update(resolved!.id, { typework_name: values.typework_name, typework_description: description, typework_state: values.typework_state, typework_updated_at: formatDatetime() })
      : await create({ typework_key: values.typework_key, typework_name: values.typework_name, typework_description: description, typework_state: values.typework_state, typework_created_at: formatDatetime() })

    if (success) {
      await swalSuccess(isEdit ? 'Actualizado' : 'Creado', values.typework_name)
      router.push('/typeworks')
    } else {
      applyApiErrors(form, useTypeWorkFormStore.getState().fieldErrors)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 max-w-lg">
        <Card>
          <CardContent className="pt-6 flex flex-col gap-4">
            <FormField control={form.control} name="typework_key" render={({ field }) => (
              <FormItem>
                <FormLabel>Clave {!isEdit && <span className="text-destructive">*</span>}</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: restoration" className="font-mono" readOnly={isEdit} disabled={isEdit} {...field} />
                </FormControl>
                <FormDescription>
                  {isEdit
                    ? 'La clave la usa el código; no se puede cambiar.'
                    : 'Solo minúsculas, números y guion bajo. La usa el código y no se podrá cambiar después.'}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="typework_name" render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre <span className="text-destructive">*</span></FormLabel>
                <FormControl><Input placeholder="Ej: Restauración" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="typework_state" render={({ field }) => (
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
            <FormField control={form.control} name="typework_description" render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción</FormLabel>
                <FormControl><Textarea placeholder="Para qué sirve este tipo..." className="resize-none" rows={3} {...field} /></FormControl>
                <FormDescription>Nota interna: para qué sirve este tipo.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        <Separator />
        {error && <AlertError title={isEdit ? 'Error al actualizar' : 'Error al crear'} message={error} apiError={fieldErrors ? { errors: fieldErrors } : undefined} />}
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push('/typeworks')} disabled={isSubmitting}>Cancelar</Button>
          <Button type="submit" disabled={isSubmitting} className="min-w-28">
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{isEdit ? 'Guardando...' : 'Creando...'}</> : isEdit ? 'Guardar' : 'Crear'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
