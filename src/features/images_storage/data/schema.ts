import type { StorageFileItem, DbImageRecord } from '../model/storage.dto'

export type StorageFileStatus = 'registered' | 'orphan'

export type EnrichedStorageFile = StorageFileItem & {
  filename: string
  folder: string
  ext: string
  isImage: boolean
  status: StorageFileStatus
  dbRecord: DbImageRecord | null
}

export type BulkDeleteMode = 'physical' | 'db' | 'both'

export type VerifyResult = {
  path: string
  existsOnDisk: boolean
  diskUrl: string
  dbRecord: DbImageRecord | null
}

const IMAGE_EXTS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif', 'bmp', 'ico', 'tiff', 'tif'])

export function enrichStorageFile(file: StorageFileItem, dbRecords: DbImageRecord[]): EnrichedStorageFile {
  const parts  = file.path.split('/')
  const filename = parts[parts.length - 1] ?? file.path
  // path format: "images/folder/file.jpg" or "images/file.jpg"
  const folder = parts.length >= 3 ? parts.slice(1, parts.length - 1).join('/') : '(raíz)'
  const ext    = filename.split('.').pop()?.toLowerCase() ?? ''
  const dbRecord = dbRecords.find((r) => r.image_patch === file.path) ?? null

  return {
    ...file,
    filename,
    folder,
    ext,
    isImage: IMAGE_EXTS.has(ext),
    status: dbRecord ? 'registered' : 'orphan',
    dbRecord,
  }
}
