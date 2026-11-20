// src/features/sales/ui/pos/field-error.tsx

/** Mensaje de error debajo de un campo (local o del 422 del servidor). */
export function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-destructive text-xs">{message}</p>
}
