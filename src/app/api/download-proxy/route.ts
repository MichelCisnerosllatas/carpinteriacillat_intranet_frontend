import { NextResponse, type NextRequest } from 'next/server'

// El storage de imágenes vive en un dominio distinto al del frontend (NEXT_PUBLIC_IMAGE_URL)
// y no manda cabeceras CORS — un fetch() directo desde el navegador falla ahí aunque un <img>
// cargue bien. Esta ruta hace ese fetch en el servidor (sin restricción CORS, porque CORS solo
// aplica a requests iniciados por el navegador) y reenvía el archivo con Content-Disposition
// para forzar la descarga.
const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_URL ?? ''

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')
  const name = request.nextUrl.searchParams.get('name') ?? 'archivo'

  // Solo se permite reenviar archivos que vivan bajo el storage de imágenes configurado —
  // evita que esta ruta se use como proxy abierto hacia cualquier URL arbitraria (SSRF).
  if (!url || !IMAGE_BASE_URL || !url.startsWith(IMAGE_BASE_URL)) {
    return NextResponse.json({ message: 'URL no permitida' }, { status: 400 })
  }

  let upstream: Response
  try {
    upstream = await fetch(url)
  } catch {
    return NextResponse.json({ message: 'No se pudo contactar al servidor de almacenamiento' }, { status: 502 })
  }

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ message: 'Archivo no encontrado' }, { status: upstream.status || 404 })
  }

  return new NextResponse(upstream.body, {
    headers: {
      'Content-Type': upstream.headers.get('content-type') ?? 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(name)}"`,
    },
  })
}
