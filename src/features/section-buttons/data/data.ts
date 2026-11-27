/**
 * `sectionbutton_variant` es texto libre en el backend, pero el sitio web solo interpreta 2
 * valores reales (ver `BUTTON_PRIMARY_CLASS`/`BUTTON_SECONDARY_CLASS` en
 * `features/home/ui/section1/Section1.tsx`, del proyecto `carpinteriacillat_frontend_web`):
 * cualquier otro valor (u omitirlo) cae en "primary". Por eso el form lo ofrece como <Select>
 * con estas 2 opciones, no como texto libre — no hay un tercer valor válido que escribir.
 */
export const SECTION_BUTTON_VARIANTS = [
  { value: 'primary', label: 'Primario (relleno)' },
  { value: 'secondary', label: 'Secundario (translúcido / outline)' },
] as const

export const SECTION_BUTTON_VARIANT_DEFAULT = 'primary'
