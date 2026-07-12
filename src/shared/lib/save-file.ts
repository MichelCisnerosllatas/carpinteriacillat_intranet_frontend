// src/shared/lib/save-file.ts
/**
 * Guarda un Blob en disco. En navegadores Chromium (Chrome/Edge) usa la File System Access API
 * (`showSaveFilePicker`), que abre el diálogo nativo "Guardar como..." para elegir dónde
 * guardarlo. En navegadores sin soporte (Firefox, Safari) cae al método clásico
 * (`<a download>`), que descarga directo a la carpeta de descargas configurada del navegador
 * — ningún sitio web puede forzar ese diálogo ahí, es una preferencia del navegador del usuario.
 */
export async function saveFile(blob: Blob, suggestedName: string, mimeType = 'application/pdf'): Promise<void> {
  const picker = (window as unknown as {
    showSaveFilePicker?: (options: {
      suggestedName: string
      types: { description: string; accept: Record<string, string[]> }[]
    }) => Promise<{
      createWritable: () => Promise<{ write: (data: Blob) => Promise<void>; close: () => Promise<void> }>
    }>
  }).showSaveFilePicker

  if (picker) {
    try {
      const extension = suggestedName.split('.').pop() ?? 'pdf'
      const handle = await picker({
        suggestedName,
        types: [{ description: mimeType, accept: { [mimeType]: [`.${extension}`] } }],
      })
      const writable = await handle.createWritable()
      await writable.write(blob)
      await writable.close()
      return
    } catch (error: any) {
      if (error?.name === 'AbortError') return // el usuario cerró el diálogo — no hacer nada más
      // Cualquier otro error (navegador sin soporte real, permiso denegado, etc.) cae al método clásico.
    }
  }

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = suggestedName
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}
