// src/shared/lib/images/buildImageUrl.ts

const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_URL ?? ''

export const buildImageUrl = (path?: string | null): string | null => {
  if (!path) return null

  return `${IMAGE_BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
}