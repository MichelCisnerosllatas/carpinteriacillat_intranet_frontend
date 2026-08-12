// src/features/sale-settings/ui/form/sale-setting-form.tsx
'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Switch } from '@/shared/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'

import { swalConfirm, swalSuccess } from '@/shared/lib/swal'
import { toastError } from '@/shared/lib/toast'
import { ENTITY_STATES } from '@/shared/config/entity-states'
import { AlertError } from '@/widgets/alerts_components'

import { useSaleSettingStore } from '../../stores/useSaleSettingStore'

const schema = z.object({
  igv_rate: z
    .number({ error: 'Ingrese una tasa de IGV válida.' })
    .min(0, 'La tasa de IGV no puede ser negativa.')
    .max(100, 'La tasa de IGV no puede superar 100.'),
  igv_enabled_default: z.boolean(),
  status: z.number(),
})

type FormValues = z.infer<typeof schema>

const DEFAULT_VALUES: FormValues = {
  igv_rate: 18,
  igv_enabled_default: true,
  status: 1,
}

export function SaleSettingForm() {
  const { data, isLoading, message, update } = useSaleSettingStore()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: DEFAULT_VALUES,
  })

  useEffect(() => {
    if (!data) return

    form.reset({
      igv_rate: data.igvRate,
      igv_enabled_default: data.igvEnabledDefaultBool,
      status: data.statusValue,
    })
  }, [data, form])

  const isSubmitting = isLoading

  const onSubmit = async (values: FormValues) => {
    const confirmed = await swalConfirm({
      title: '¿Guardar cambios?',
      text: 'Se actualizará la configuración de ventas.',
      confirmText: 'Sí, guardar',
      cancelText: 'Cancelar',
    })

    if (!confirmed) return

    const payload = {
      igv_rate: values.igv_rate.toFixed(2),
      igv_enabled_default: values.igv_enabled_default ? 1 : 0,
      status: values.status,
    }

    const success = await update(payload)
    if (!success) {
      const errorMessage = useSaleSettingStore.getState().message ?? 'No se pudo guardar la configuración.'
      toastError('Error', errorMessage)
      return
    }

    await swalSuccess('Actualizado', 'La configuración de ventas fue guardada.')
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto w-full max-w-3xl space-y-5 pb-6">
        <Card className="overflow-hidden transition-shadow duration-300 hover:shadow-md">
          <CardHeader className="border-b">
            <CardTitle className="text-base font-semibold">Configuración de Ventas</CardTitle>
          </CardHeader>

          <CardContent className="grid grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-2">
            <FormField
              control={form.control}
              name="igv_rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Tasa de IGV (%)
                    <span className="ml-1 text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      placeholder="18.00"
                      disabled={isSubmitting}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value === '' ? 0 : parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select
                    value={String(field.value)}
                    onValueChange={(value) => field.onChange(Number(value))}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ENTITY_STATES.map((state) => (
                        <SelectItem key={state.value} value={String(state.value)}>
                          {state.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="igv_enabled_default"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3 md:col-span-2">
                  <div className="flex flex-col gap-0.5">
                    <FormLabel className="text-sm">IGV activado por defecto</FormLabel>
                    <FormDescription>
                      Valor inicial de &quot;incluye IGV&quot; al crear una nueva venta.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {message && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertError title="Error al actualizar" message={message} />
          </div>
        )}

        <div
          className="
            sticky bottom-4 z-20
            flex items-center justify-end
            rounded-xl border bg-background/90 p-3
            shadow-lg shadow-black/5
            backdrop-blur-md
          "
        >
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full min-w-40 transition-transform duration-200 active:scale-[0.98] sm:w-auto"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar cambios'
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
