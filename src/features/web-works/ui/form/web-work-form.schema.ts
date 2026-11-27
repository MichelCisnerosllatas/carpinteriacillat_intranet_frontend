import { z } from 'zod'

/**
 * Esquema del formulario de Trabajo. Los nombres de campo imitan el body de la API
 * (`images.N.id_image`, `pairs.N.id_image_before`, ...) para que `applyApiErrors` pinte los
 * errores 422 directamente en el campo que corresponde. `url`/`name` son solo para la vista previa.
 */

export const webWorkPhotoFormSchema = z.object({
  /** null = foto nueva (se crea al guardar). */
  id_web_work_image: z.number().nullable(),
  id_image: z.number(),
  url: z.string().nullable(),
  name: z.string(),
  webworkimage_caption: z.string().max(150, 'Máximo 150 caracteres.'),
  visible: z.boolean(),
})
export type WebWorkPhotoFormValue = z.infer<typeof webWorkPhotoFormSchema>

export const webWorkPairFormSchema = z.object({
  /** null = par nuevo (se crea al guardar). */
  id_web_work_pair: z.number().nullable(),
  id_image_before: z.number().nullable(),
  before_url: z.string().nullable(),
  before_name: z.string(),
  id_image_after: z.number().nullable(),
  after_url: z.string().nullable(),
  after_name: z.string(),
  webworkpair_caption: z.string().max(150, 'Máximo 150 caracteres.'),
  visible: z.boolean(),
}).superRefine((pair, ctx) => {
  if (pair.id_image_before == null) ctx.addIssue({ code: 'custom', path: ['id_image_before'], message: 'Falta la foto «Antes».' })
  if (pair.id_image_after == null) ctx.addIssue({ code: 'custom', path: ['id_image_after'], message: 'Falta la foto «Después».' })
})
export type WebWorkPairFormValue = z.infer<typeof webWorkPairFormSchema>

export const webWorkFormSchema = z.object({
  id_typework:          z.number().nullable(),
  webwork_title:        z.string().trim().min(1, 'El título es requerido.').max(255),
  webwork_description:  z.string(),
  id_category:          z.number().nullable(),
  id_typewood:          z.number().nullable(),
  webwork_style:        z.string().max(100, 'Máximo 100 caracteres.'),
  webwork_measures:     z.string().max(100, 'Máximo 100 caracteres.'),
  webwork_finish:       z.string().max(150, 'Máximo 150 caracteres.'),
  webwork_build_time:   z.string().max(100, 'Máximo 100 caracteres.'),
  webwork_location:     z.string().max(150, 'Máximo 150 caracteres.'),
  /** `YYYY-MM-DD` o '' */
  webwork_delivered_at: z.string(),
  /** Texto del input; '' = sin precio. */
  webwork_price_approx: z.string().refine((v) => v.trim() === '' || (Number.isFinite(Number(v)) && Number(v) >= 0), 'Debe ser un número mayor o igual a 0.'),
  webwork_state:        z.number(),
  id_furniture:         z.number().nullable(),
  /** Portada (opcional: sin portada la web usa la primera foto). */
  id_image:             z.number().nullable(),
  images:               z.array(webWorkPhotoFormSchema),
  pairs:                z.array(webWorkPairFormSchema),
}).superRefine((v, ctx) => {
  // Se valida aparte (y no con .refine en el campo) para que el tipo siga siendo `number | null`
  if (v.id_typework == null) ctx.addIssue({ code: 'custom', path: ['id_typework'], message: 'Elige el tipo de trabajo.' })
})

export type WebWorkFormValues = z.infer<typeof webWorkFormSchema>

export const WEB_WORK_FORM_DEFAULTS: WebWorkFormValues = {
  id_typework: null,
  webwork_title: '',
  webwork_description: '',
  id_category: null,
  id_typewood: null,
  webwork_style: '',
  webwork_measures: '',
  webwork_finish: '',
  webwork_build_time: '',
  webwork_location: '',
  webwork_delivered_at: '',
  webwork_price_approx: '',
  webwork_state: 1,
  id_furniture: null,
  id_image: null,
  images: [],
  pairs: [],
}

export const emptyPair = (): WebWorkPairFormValue => ({
  id_web_work_pair: null,
  id_image_before: null,
  before_url: null,
  before_name: '',
  id_image_after: null,
  after_url: null,
  after_name: '',
  webworkpair_caption: '',
  visible: true,
})
