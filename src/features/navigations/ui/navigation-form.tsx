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
import { applyApiErrors } from '@/shared/lib/api-errors'
import { formatDatetime } from '@/shared/lib/utils'
import { ENTITY_STATES } from '@/shared/config/entity-states'
import { AlertError } from '@/widgets/alerts_components'
import { useNavigationListStore } from '../stores/useNavigationListStore'
import { useNavigationFormStore } from '../stores/useNavigationFormStore'

const schema = z.object({
  navigation_name:  z.string().min(1, 'El nombre es requerido.').max(255),
  navigation_url:   z.string().optional(),
  navigation_order: z.number().int().optional().nullable(),
  navigation_state: z.number(),
})

type FormValues = z.infer<typeof schema>

export function NavigationForm({ mode, id }: { mode: 'create' | 'edit'; id?: string }) {
  const router  = useRouter()
  const { currentItem, items }                                     = useNavigationListStore()
  const { isSubmitting, error, fieldErrors, create, update, reset } = useNavigationFormStore()
  const isEdit  = mode === 'edit'
  const resolved = currentItem ?? (id ? items.find((i) => i.id === Number(id)) ?? null : null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { navigation_name: '', navigation_url: '', navigation_order: null, navigation_state: 1 },
  })

  useEffect(() => {
    if (isEdit && resolved) {
      form.reset({
        navigation_name:  resolved.name,
        navigation_url:   resolved.url ?? '',
        navigation_order: resolved.order ?? null,
        navigation_state: resolved.stateValue,
      })
    }
  }, [isEdit, resolved?.id])

  useEffect(() => () => reset(), [])

  const onSubmit = async (values: FormValues) => {
    const confirmed = await swalConfirm({
      title: isEdit ? '¿Guardar cambios?' : '¿Crear navegación?',
      text: values.navigation_name,
      confirmText: isEdit ? 'Sí, guardar' : 'Sí, crear',
      cancelText: 'Cancelar',
    })
    if (!confirmed) return

    const success = isEdit
      ? await update(resolved!.id, {
          navigation_name:       values.navigation_name,
          navigation_url:        values.navigation_url ?? '',
          navigation_order:      values.navigation_order ?? undefined,
          navigation_state:      values.navigation_state,
          navigation_updated_at: formatDatetime(),
        })
      : await create({
          navigation_name:       values.navigation_name,
          navigation_url:        values.navigation_url,
          navigation_order:      values.navigation_order ?? undefined,
          navigation_state:      values.navigation_state,
          navigation_created_at: formatDatetime(),
        })

    if (success) {
      await swalSuccess(isEdit ? 'Actualizado' : 'Creado', values.navigation_name)
      router.push('/navigations')
    } else {
      applyApiErrors(form, fieldErrors)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 max-w-lg">
        <Card>
          <CardContent className="pt-6 flex flex-col gap-4">
            <FormField control={form.control} name="navigation_name" render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre <span className="text-destructive">*</span></FormLabel>
                <FormControl><Input placeholder="Ej: Inicio" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="navigation_url" render={({ field }) => (
              <FormItem>
                <FormLabel>URL</FormLabel>
                <FormControl><Input placeholder="Ej: /inicio" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="navigation_order" render={({ field }) => (
              <FormItem>
                <FormLabel>Orden</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Ej: 1"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="navigation_state" render={({ field }) => (
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
          </CardContent>
        </Card>

        <Separator />
        {error && <AlertError title={isEdit ? 'Error al actualizar' : 'Error al crear'} message={error} apiError={fieldErrors ? { errors: fieldErrors } : undefined} />}
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push('/navigations')} disabled={isSubmitting}>Cancelar</Button>
          <Button type="submit" disabled={isSubmitting} className="min-w-28">
            {isSubmitting
              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{isEdit ? 'Guardando...' : 'Creando...'}</>
              : isEdit ? 'Guardar' : 'Crear'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
