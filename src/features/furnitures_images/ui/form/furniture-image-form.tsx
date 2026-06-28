'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { applyApiErrors } from '@/shared/lib/api-errors'
import { toastSuccess, toastError } from '@/shared/lib/toast'
import { ENTITY_STATES } from '@/shared/config/entity-states'
import { ImageSelect } from '@/features/images/ui/image-select'
import { FurnitureSelect } from '@/features/furnitures/ui/furniture-select'
import { useFurnitureImageListStore } from '../../stores/useFurnitureImageListStore'
import { useFurnitureImageFormStore } from '../../stores/useFurnitureImageFormStore'
import { furnitureImagesService } from '../../services/furnitures-images.service'
import type { FurnitureImage } from '../../data/schema'
import type { FurnitureImageJoinApiItem } from '../../model/furnitures-image-api-item.dto'
import { buildImageUrl } from '@/shared/lib/images'
import { getStateOption } from '@/shared/config/entity-states'

const schema = z.object({
  id_furniture:         z.number({ error: 'Seleccione el mueble.' }),
  id_image:             z.number({ error: 'Seleccione la imagen.' }),
  furnitureimage_order: z.number().nullable().optional(),
  furnitureimage_state: z.number(),
})

type FormValues = z.infer<typeof schema>

function mapFromJoin(raw: FurnitureImageJoinApiItem): FurnitureImage {
  const stateOpt = getStateOption(raw.furnitureimage_state)
  return {
    id: raw.id_furniture_image,
    furnitureId: raw.furniture?.id_furniture ?? 0,
    furnitureName: raw.furniture?.furniture_name ?? '',
    imageId: raw.image?.id_image ?? 0,
    imageUrl: buildImageUrl(raw.image?.image_patch ?? null),
    imagePatch: raw.image?.image_patch ?? null,
    imageName: raw.image?.image_name ?? null,
    imageTitle: raw.image?.image_title ?? null,
    imageAlt: raw.image?.image_alt ?? null,
    order: raw.furnitureimage_order,
    stateValue: raw.furnitureimage_state,
    statusLabel: stateOpt.label,
    createdAt: raw.furnitureimage_created_at,
    updatedAt: raw.furnitureimage_updated_at,
  }
}

export function FurnitureImageForm({ mode, id }: { mode: 'create' | 'edit'; id?: string }) {
  const router   = useRouter()
  const { currentItem, items, setCurrentItem } = useFurnitureImageListStore()
  const { isSubmitting, fieldErrors, create, update, reset } = useFurnitureImageFormStore()
  const isEdit   = mode === 'edit'
  const resolved = currentItem && id && String(currentItem.id) === id
    ? currentItem
    : items.find((i) => id && String(i.id) === id) ?? null

  const [loading, setLoading] = useState(isEdit && !resolved)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      id_furniture:         resolved?.furnitureId ?? undefined,
      id_image:             resolved?.imageId ?? undefined,
      furnitureimage_order: resolved?.order ?? null,
      furnitureimage_state: resolved?.stateValue ?? 1,
    },
  })

  // Load item if editing and not in store
  useEffect(() => {
    if (!isEdit || !id) return
    if (resolved) { setLoading(false); return }
    setLoading(true)
    furnitureImagesService.getById(Number(id))
      .then((res) => {
        if (res.success && res.data) {
          const mapped = mapFromJoin(res.data)
          setCurrentItem(mapped)
          form.reset({
            id_furniture:         mapped.furnitureId,
            id_image:             mapped.imageId,
            furnitureimage_order: mapped.order,
            furnitureimage_state: mapped.stateValue,
          })
        }
      })
      .finally(() => setLoading(false))
  }, [id])

  // Sync form when resolved loads
  useEffect(() => {
    if (!resolved) return
    form.reset({
      id_furniture:         resolved.furnitureId,
      id_image:             resolved.imageId,
      furnitureimage_order: resolved.order,
      furnitureimage_state: resolved.stateValue,
    })
  }, [resolved?.id])

  // Apply API field errors
  useEffect(() => {
    if (fieldErrors) applyApiErrors(form, fieldErrors)
  }, [fieldErrors])

  const onSubmit = async (values: FormValues) => {
    if (isEdit && id) {
      const ok = await update(Number(id), {
        id_furniture:         values.id_furniture,
        id_image:             values.id_image,
        furnitureimage_order: values.furnitureimage_order ?? undefined,
        furnitureimage_state: values.furnitureimage_state,
      })
      if (ok) {
        toastSuccess('Actualizado', 'La asociación fue actualizada.')
        router.push('/furniture-images')
      } else {
        toastError('Error', 'No se pudo actualizar.')
      }
    } else {
      const newId = await create({
        id_furniture:         values.id_furniture,
        id_image:             values.id_image,
        furnitureimage_order: values.furnitureimage_order ?? undefined,
        furnitureimage_state: values.furnitureimage_state,
      })
      if (newId) {
        toastSuccess('Creado', 'La asociación fue creada.')
        reset()
        router.push('/furniture-images')
      } else {
        toastError('Error', 'No se pudo crear.')
      }
    }
  }

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        Cargando...
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Mueble */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Mueble</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="id_furniture"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mueble <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <FurnitureSelect
                        value={field.value ?? null}
                        onValueChange={(v) => field.onChange(v)}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Configuración */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Configuración</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="furnitureimage_order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Orden</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Ej: 1"
                        disabled={isSubmitting}
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(e.target.value === '' ? null : Number(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="furnitureimage_state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado <span className="text-destructive">*</span></FormLabel>
                    <Select
                      value={String(field.value)}
                      onValueChange={(v) => field.onChange(Number(v))}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ENTITY_STATES.map((s) => (
                          <SelectItem key={s.value} value={String(s.value)}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>

        {/* Imagen */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Imagen <span className="text-sm font-normal text-destructive">*</span></CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="id_image"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <ImageSelect
                      value={field.value ?? null}
                      onValueChange={(v) => field.onChange(v)}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
            {isEdit ? 'Actualizar' : 'Crear asociación'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={isSubmitting}
            onClick={() => router.push('/furniture-images')}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </Form>
  )
}
