'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Tag } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/shared/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { AlertError } from '@/widgets/alerts_components'
import { formatDatetime } from '@/shared/lib/utils'
import { categoriesService } from '../services/categories.service'
import { useCategorySelectStore } from '../stores/useCategorySelectStore'
import type { CategoryApiItem } from '../model/categoryget.dto'

const schema = z.object({
  category_name: z.string().min(1, 'El nombre es requerido.').max(255),
  category_description: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface CategoryQuickCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Prellena el nombre — típicamente lo que el usuario ya escribió en el buscador del select. */
  initialName?: string
  /** Se llama con la categoría recién creada, para seleccionarla de inmediato en el formulario que la pidió. */
  onCreated: (item: CategoryApiItem) => void
}

/**
 * Versión compacta de <CategoryForm /> pensada para crear una categoría sin salir del
 * formulario que la necesita (ej. Trabajos de la galería) — se abre como atajo "+ Nuevo"
 * junto al combobox de Categoría. Solo pide nombre y descripción; el resto (estado,
 * "Mostrar en la web") se completa después desde el listado de Categorías si hace falta.
 */
export function CategoryQuickCreateDialog({ open, onOpenChange, initialName, onCreated }: CategoryQuickCreateDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]> | null>(null)
  const { setForceReload, load } = useCategorySelectStore()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { category_name: '', category_description: '' },
  })

  useEffect(() => {
    if (open) form.reset({ category_name: initialName ?? '', category_description: '' })
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
      const res = await categoriesService.post({
        category_name: values.category_name,
        category_description: values.category_description,
        category_state: '1',
        category_created_at: formatDatetime(),
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
            <Tag className="size-4" />
            Crear categoría
          </DialogTitle>
          <DialogDescription>
            Se selecciona automáticamente apenas la crees — puedes completar el resto después desde Categorías.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField control={form.control} name="category_name" render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre <span className="text-destructive">*</span></FormLabel>
                <FormControl><Input placeholder="Ej: Comedores" maxLength={255} autoFocus {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="category_description" render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción</FormLabel>
                <FormControl><Textarea placeholder="Descripción opcional" className="resize-none" rows={3} {...field} /></FormControl>
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
