'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, PackagePlus } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { AlertError } from '@/widgets/alerts_components'
import { PRODUCT_SERVICE_TYPES } from '../data/data'
import { useProductServiceFormStore } from '../stores/useProductServiceFormStore'
import type { ProductServiceApiItem } from '../model/product-service-api-item.dto'

const schema = z.object({
  name: z.string().min(1, 'El nombre es requerido.').max(255),
  unit: z.string().max(50, 'Máximo 50 caracteres.').optional(),
  default_price: z
    .number({ error: 'Ingrese un precio válido.' })
    .min(0, 'El precio no puede ser negativo.'),
  type: z.union([z.literal('product'), z.literal('service')]),
})

type FormValues = z.infer<typeof schema>

interface ProductServiceQuickCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Prellena el nombre — típicamente lo que el usuario ya escribió en el buscador del picker. */
  initialName?: string
  /** Se llama con el producto/servicio recién creado, para agregarlo al carrito de inmediato. */
  onCreated: (item: ProductServiceApiItem) => void
}

/**
 * Versión compacta de <ProductServiceForm /> pensada para crear un producto/servicio sin salir
 * del flujo de armado de proforma — se abre como atajo desde <ProductServicePickerModal /> cuando
 * el catálogo no tiene lo que el usuario busca. Solo pide lo esencial (nombre, tipo, precio,
 * unidad); el resto (descripción, mueble vinculado, estado) se completa después desde el listado
 * de Productos/Servicios si hace falta.
 */
export function ProductServiceQuickCreateDialog({
  open,
  onOpenChange,
  initialName,
  onCreated,
}: ProductServiceQuickCreateDialogProps) {
  const { isSubmitting, error, fieldErrors, create, reset } = useProductServiceFormStore()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', unit: '', default_price: 0, type: 'product' },
  })

  useEffect(() => {
    if (open) form.reset({ name: initialName ?? '', unit: '', default_price: 0, type: 'product' })
  }, [open, initialName])

  useEffect(() => () => reset(), [])

  const onSubmit = async (values: FormValues) => {
    const created = await create({
      name: values.name,
      // Se manda igual al nombre a propósito: este modal no pide descripción (solo lo esencial),
      // así que nunca debe depender de un campo de descripción visible ni fallar por su ausencia.
      description: values.name,
      unit: values.unit,
      default_price: values.default_price,
      type: values.type,
      status: 1,
    })
    if (created) {
      onOpenChange(false)
      onCreated(created)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PackagePlus className="size-4" />
            Crear producto o servicio
          </DialogTitle>
          <DialogDescription>
            Se agrega al carrito apenas lo crees — puedes completar el resto de detalles después.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Nombre <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Instalación a domicilio"
                      maxLength={255}
                      autoFocus
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(v) => field.onChange(v as 'product' | 'service')}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PRODUCT_SERVICE_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
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
                name="default_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Precio <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={field.value ?? ''}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) =>
                          field.onChange(e.target.value === '' ? 0 : parseFloat(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unidad</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: NIU" maxLength={50} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <AlertError
                title="Error al crear"
                message={error}
                apiError={fieldErrors ? { errors: fieldErrors } : undefined}
              />
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="min-w-28">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  'Crear y agregar'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
