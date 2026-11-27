import { notFound } from 'next/navigation'

/**
 * Ruta "comodín": atrapa cualquier URL que no exista (ej. /loquesea) y llama a notFound().
 * Así se muestra (intranet)/not-found.tsx DENTRO del layout (con sidebar),
 * en vez de la 404 de pantalla completa de app/not-found.tsx.
 *
 * Las rutas reales siempre ganan: Next.js solo usa esta cuando ninguna otra coincide.
 */
export default function CatchAllNotFound() {
  notFound()
}
