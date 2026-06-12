import type { FieldValues, Path, UseFormReturn } from 'react-hook-form'

/**
 * Toma el objeto `errors` de una respuesta 422 del backend y los aplica
 * como errores de campo en react-hook-form vía setError().
 *
 * @param form      - instancia de useForm
 * @param errors    - objeto errors del API  { person_name: ['El nombre es requerido.'] }
 * @param fieldMap  - mapeo opcional  { apiField: 'formField' }  cuando los nombres difieren
 *
 * @example
 * applyApiErrors(form, fieldErrors, { id_typedoc: 'id_tipodoc' })
 */
export function applyApiErrors<T extends FieldValues>(
  form: UseFormReturn<T>,
  errors: Record<string, string[]> | null | undefined,
  fieldMap: Partial<Record<string, Path<T>>> = {}
): void {
  if (!errors) return

  for (const [apiField, messages] of Object.entries(errors)) {
    const formField = (fieldMap[apiField] ?? apiField) as Path<T>
    form.setError(formField, {
      type: 'server',
      message: messages[0],
    })
  }
}
