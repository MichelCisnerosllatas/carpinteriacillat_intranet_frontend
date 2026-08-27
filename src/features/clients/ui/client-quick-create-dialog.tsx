'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, UserPlus } from 'lucide-react'
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
import { AlertError } from '@/widgets/alerts_components'
import { useClientFormStore } from '../stores/useClientFormStore'
import type { ClientApiItem } from '../model/client-api-item.dto'

const schema = z.object({
  business_name: z.string().min(1, 'La razón social es requerida.').max(255),
  document_number: z.string().max(20, 'Máximo 20 caracteres.').optional(),
  phone: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface ClientQuickCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Prellena la razón social — típicamente lo que el usuario ya escribió en el buscador del picker. */
  initialName?: string
  /** Se llama con el cliente recién creado, para seleccionarlo de inmediato. */
  onCreated: (client: ClientApiItem) => void
}

/**
 * Versión compacta de <ClientForm /> pensada para crear un cliente sin salir del flujo de armado
 * de proforma — se abre como atajo desde <ClientPickerModal /> cuando la búsqueda no encuentra al
 * cliente. Solo pide lo esencial (razón social, documento, teléfono); el resto (tipo de documento,
 * dirección, contacto, correo) se completa después desde el listado de Clientes si hace falta.
 */
export function ClientQuickCreateDialog({
  open,
  onOpenChange,
  initialName,
  onCreated,
}: ClientQuickCreateDialogProps) {
  const { isSubmitting, error, fieldErrors, create, reset } = useClientFormStore()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { business_name: '', document_number: '', phone: '' },
  })

  useEffect(() => {
    if (open) form.reset({ business_name: initialName ?? '', document_number: '', phone: '' })
  }, [open, initialName])

  useEffect(() => () => reset(), [])

  const onSubmit = async (values: FormValues) => {
    const created = await create({
      business_name: values.business_name,
      document_number: values.document_number,
      phone: values.phone,
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
            <UserPlus className="size-4" />
            Crear cliente
          </DialogTitle>
          <DialogDescription>
            Se selecciona apenas lo crees — puedes completar el resto de detalles después.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="business_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Razón social <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Carpintería Cillat SAC"
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
                name="document_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de documento</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: 20123456789" maxLength={20} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: 987654321" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                  'Crear y seleccionar'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
