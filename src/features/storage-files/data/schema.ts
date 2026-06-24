import { z } from 'zod'

export const storageFileSchema = z.object({
  name:                z.string(),
  path:                z.string(),
  path_encoded:        z.string(),
  url:                 z.string(),
  parent_path:         z.string().nullable(),
  parent_path_encoded: z.string().nullable(),
  extension:           z.string(),
  mime_type:           z.string(),
  size:                z.number(),
  size_human:          z.string(),
  last_modified:       z.string(),
})

export type StorageFile = z.infer<typeof storageFileSchema>

// ── File type detection ──────────────────────────────────────────────────────

export type FileType = 'image' | 'pdf' | 'document' | 'spreadsheet' | 'video' | 'audio' | 'archive' | 'other'

const IMAGE_EXTS       = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg', 'ico', 'avif']
const DOCUMENT_EXTS    = ['doc', 'docx', 'odt', 'txt', 'rtf', 'md']
const SPREADSHEET_EXTS = ['xls', 'xlsx', 'ods', 'csv']
const VIDEO_EXTS       = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'ogv', 'wmv']
const AUDIO_EXTS       = ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a']
const ARCHIVE_EXTS     = ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz']

export function getFileType(extension: string): FileType {
  const ext = extension.toLowerCase()
  if (IMAGE_EXTS.includes(ext))       return 'image'
  if (ext === 'pdf')                  return 'pdf'
  if (DOCUMENT_EXTS.includes(ext))    return 'document'
  if (SPREADSHEET_EXTS.includes(ext)) return 'spreadsheet'
  if (VIDEO_EXTS.includes(ext))       return 'video'
  if (AUDIO_EXTS.includes(ext))       return 'audio'
  if (ARCHIVE_EXTS.includes(ext))     return 'archive'
  return 'other'
}

export function isImage(extension: string) {
  return getFileType(extension) === 'image'
}
