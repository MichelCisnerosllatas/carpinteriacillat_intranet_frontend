'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Navigation2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/shared/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { AlertError } from '@/widgets/alerts_components'
import { formatDatetime } from '@/shared/lib/utils'
import { navigationsService } from '../services/navigations.service'
import { useNavigationSelectStore } from '../stores/useNavigationSelectStore'
import type { NavigationApiItem } from '../model/navigationget.dto'

const schema = z.object({
  navigation_name: z.string().min(1, 'El nombre es requerido.').max(255),
  navigation_url: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface NavigationQuickCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Prellena el nombre — típicamente lo que el usuario ya escribió en el buscador del select. */
  initialName?: string
  /** Se llama con la navegación recién creada, para seleccionarla de inmediato en el formulario que la pidió. */
  onCreated: (item: NavigationApiItem) => void
}

/**
 * Versión compacta de <NavigationForm /> pensada para crear una navegación sin salir del
 * formulario que la necesita (ej. Sections) — se abre como atajo "+ Nuevo" junto al
 * combobox de Navegación. Solo pide nombre y URL; el resto (orden, estado) se completa
 * después desde el listado de Navegaciones si hace falta.
 */
export function NavigationQuickCreateDialog({ open, onOpenChange, initialName, onCreated }: NavigationQuickCreateDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]> | null>(null)
  const { setForceReload, load } = useNavigationSelectStore()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { navigation_name: '', navigation_url: '' },
  })

  useEffect(() => {
    if (open) form.reset({ navigation_name: initialName ?? '', navigation_url: '' })
  }, [open, initialName])

  const handleOpenChange = (next: boolean) => {
    if (!next) { setError(null); setFieldErrors(null) }
    onOpenChange(next)
  }

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true)
    setError(null)
    setFieldErrors(null)
    try {
      const res = await navigationsService.post({
        navigation_name: values.navigation_name,
        navigation_url: values.navigation_url,
        navigation_state: 1,
        navigation_created_at: formatDatetime(),
      })
      if (!res.success) {
        setError(res.message)
        setFieldErrors(res.errors ?? null)
        return
      }
      setForceReload(true)
      await load()
      onOpenChange(false)
      onCreated(res.data)
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'Error al crear.')
      setFieldErrors(err?.response?.data?.errors ?? null)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Navigation2 className="size-4" />
            Crear navegación
          </DialogTitle>
          <DialogDescription>
            Se selecciona automáticamente apenas la crees — puedes completar orden y estado después desde Navegaciones.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField control={form.control} name="navigation_name" render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre <span className="text-destructive">*</span></FormLabel>
                <FormControl><Input placeholder="Ej: Inicio" maxLength={255} autoFocus {...field} /></FormControl>
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

            {error && (
              <AlertError title="Error al crear" message={error} apiError={fieldErrors ? { errors: fieldErrors } : undefined} />
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="min-w-28">
                {isSubmitting
                  ? <><Loader2 className="mr-2 size-4 animate-spin" />Creando...</>
                  : 'Crear y usar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
