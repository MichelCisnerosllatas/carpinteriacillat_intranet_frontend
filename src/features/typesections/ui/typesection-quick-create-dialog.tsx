'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, LayoutGrid } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/shared/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { AlertError } from '@/widgets/alerts_components'
import { formatDatetime } from '@/shared/lib/utils'
import { typesectionsService } from '../services/typesections.service'
import { useTypeSectionSelectStore } from '../stores/useTypeSectionSelectStore'
import type { TypeSectionApiItem } from '../model/typesectionget.dto'

const schema = z.object({
  typesection_name: z.string().min(1, 'El nombre es requerido.').max(255),
  typesection_description: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface TypeSectionQuickCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Prellena el nombre — típicamente lo que el usuario ya escribió en el buscador del select. */
  initialName?: string
  /** Se llama con el tipo de sección recién creado, para seleccionarlo de inmediato en el formulario que lo pidió. */
  onCreated: (item: TypeSectionApiItem) => void
}

/**
 * Versión compacta de <TypeSectionForm /> pensada para crear un tipo de sección sin salir
 * del formulario que lo necesita (ej. Sections) — se abre como atajo "+ Nuevo" junto al
 * combobox de Tipo de Sección. Solo pide nombre y descripción; el estado se completa
 * después desde el listado de Tipos de Sección si hace falta.
 */
export function TypeSectionQuickCreateDialog({ open, onOpenChange, initialName, onCreated }: TypeSectionQuickCreateDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]> | null>(null)
  const { setForceReload, load } = useTypeSectionSelectStore()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { typesection_name: '', typesection_description: '' },
  })

  useEffect(() => {
    if (open) form.reset({ typesection_name: initialName ?? '', typesection_description: '' })
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
      const res = await typesectionsService.post({
        typesection_name: values.typesection_name,
        typesection_description: values.typesection_description,
        typesection_state: 1,
        typesection_created_at: formatDatetime(),
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
            <LayoutGrid className="size-4" />
            Crear tipo de sección
          </DialogTitle>
          <DialogDescription>
            Se selecciona automáticamente apenas lo crees — puedes completar el estado después desde Tipos de Sección.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField control={form.control} name="typesection_name" render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre <span className="text-destructive">*</span></FormLabel>
                <FormControl><Input placeholder="Ej: Sala" maxLength={255} autoFocus {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="typesection_description" render={({ field }) => (
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
