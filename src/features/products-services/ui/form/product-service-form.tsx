// src/features/products-services/ui/form/product-service-form.tsx
'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { Loader2, Package } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { swalConfirm, swalSuccess } from '@/shared/lib/swal'
import { ENTITY_STATES } from '@/shared/config/entity-states'
import { applyApiErrors } from '@/shared/lib/api-errors'
import { AlertError } from '@/widgets/alerts_components'
import { FurnitureSelect } from '@/features/furnitures/ui/furniture-select'
import { PRODUCT_SERVICE_TYPES } from '../../data/data'
import { useProductServiceListStore } from '../../stores/useProductServiceListStore'
import { useProductServiceFormStore } from '../../stores/useProductServiceFormStore'

const schema = z.object({
  furniture_id:  z.number().nullable().optional(),
  name:          z.string().min(1, 'El nombre es requerido.').max(255),
  description:   z.string().optional(),
  unit:          z.string().max(50, 'Máximo 50 caracteres.').optional(),
  default_price: z.number({ error: 'Ingrese un precio válido.' }).min(0, 'El precio no puede ser negativo.'),
  type:          z.union([z.literal('product'), z.literal('service')]),
  status:        z.number(),
})

type FormValues = z.infer<typeof schema>

export function ProductServiceForm({ mode, id }: { mode: 'create' | 'edit'; id?: string }) {
  const router = useRouter()
  const { currentItem, items, loadById }                             = useProductServiceListStore()
  const { isSubmitting, error, fieldErrors, create, update, reset }  = useProductServiceFormStore()
  const isEdit = mode === 'edit'
  const resolved = currentItem ?? (id ? items.find((i) => i.id === Number(id)) ?? null : null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      furniture_id: null, name: '', description: '', unit: '',
      default_price: 0, type: 'product', status: 1,
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
        furniture_id:  resolved.furnitureId,
        name:          resolved.name,
        description:   resolved.description ?? '',
        unit:          resolved.unit ?? '',
        default_price: resolved.defaultPrice,
        type:          resolved.type,
        status:        resolved.stateValue,
      })
    }
  }, [isEdit, resolved?.id])

  useEffect(() => () => reset(), [])

  const onSubmit = async (values: FormValues) => {
    const confirmed = await swalConfirm({
      title: isEdit ? '¿Guardar cambios?' : '¿Crear producto o servicio?',
      text: values.name, confirmText: isEdit ? 'Sí, guardar' : 'Sí, crear', cancelText: 'Cancelar',
    })
    if (!confirmed) return

    const success = isEdit
      ? await update(resolved!.id, {
          furniture_id:  values.furniture_id ?? null,
          name:          values.name,
          description:   values.description,
          unit:          values.unit,
          default_price: values.default_price,
          type:          values.type,
          status:        values.status,
        })
      : await create({
          furniture_id:  values.furniture_id ?? null,
          name:          values.name,
          description:   values.description,
          unit:          values.unit,
          default_price: values.default_price,
          type:          values.type,
          status:        values.status,
        })

    if (success) {
      await swalSuccess(isEdit ? 'Actualizado' : 'Creado', values.name)
      router.push('/products-services')
    } else {
      applyApiErrors(form, fieldErrors)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 max-w-lg">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Package className="size-4" />Información general</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre <span className="text-destructive">*</span></FormLabel>
                <FormControl><Input placeholder="Ej: Instalación a domicilio" maxLength={255} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción</FormLabel>
                <FormControl><Textarea placeholder="Descripción opcional" className="resize-none" rows={3} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="unit" render={({ field }) => (
                <FormItem>
                  <FormLabel>Unidad</FormLabel>
                  <FormControl><Input placeholder="Ej: NIU" maxLength={50} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="default_price" render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value === '' ? 0 : parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="type" render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                <Select value={field.value} onValueChange={(v) => field.onChange(v as 'product' | 'service')}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    {PRODUCT_SERVICE_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="furniture_id" render={({ field }) => (
              <FormItem>
                <FormLabel>Mueble vinculado</FormLabel>
                <FormControl>
                  <FurnitureSelect
                    value={field.value ?? null}
                    onValueChange={(v) => field.onChange(v)}
                    placeholder="Sin mueble vinculado"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

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
          </CardContent>
        </Card>

        <Separator />
        {error && <AlertError title={isEdit ? 'Error al actualizar' : 'Error al crear'} message={error} apiError={fieldErrors ? { errors: fieldErrors } : undefined} />}
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push('/products-services')} disabled={isSubmitting}>Cancelar</Button>
          <Button type="submit" disabled={isSubmitting} className="min-w-28">
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{isEdit ? 'Guardando...' : 'Creando...'}</> : isEdit ? 'Guardar' : 'Crear'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
