/** 1 o 2 letras iniciales a partir de un nombre completo (ej. "Juan Pérez" → "JP", "Juan" → "J")
 * — fallback estándar para avatares sin foto en toda la app. */
export function getInitials(fullName: string): string {
  return fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
