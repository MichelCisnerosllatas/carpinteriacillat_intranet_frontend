// src/shared/lib/download-url.ts
/**
 * Descarga silenciosa (sin diálogo "Guardar como...") de una URL como archivo, vía blob +
 * `<a download>`. Pensada para descargas en masa uno-por-uno: a diferencia de `saveFile`
 * (que usa el File System Access API), esta no interrumpe con un picker por cada archivo.
 *
 * Pasa por `/api/download-proxy` en vez de hacer fetch(url) directo: el storage de imágenes
 * vive en otro dominio (NEXT_PUBLIC_IMAGE_URL) y no manda cabeceras CORS, así que un fetch
 * desde el navegador falla ahí aunque la misma URL cargue bien en un <img>.
 */
export async function downloadUrlAsFile(url: string, fileName: string): Promise<void> {
  const proxyUrl = `/api/download-proxy?url=${encodeURIComponent(url)}&name=${encodeURIComponent(fileName)}`
  const response = await fetch(proxyUrl)
  if (!response.ok) throw new Error(`No se pudo descargar "${fileName}"`)
  const blob = await response.blob()
  const objectUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = objectUrl
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000)
}
