export function getImageUrl(patch: string): string {
  const base = process.env.NEXT_PUBLIC_IMAGE_URL ?? ''
  return `${base}${patch}`
}

export function getImageDisplayName(item: { image_name: string | null; image_patch: string }): string {
  if (item.image_name) return item.image_name
  return item.image_patch.split('/').pop() ?? item.image_patch
}

export function formatBytes(bytes: number | null): string {
  if (bytes == null) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}
