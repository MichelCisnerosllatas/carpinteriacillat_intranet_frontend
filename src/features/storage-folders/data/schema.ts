import { z } from 'zod'

export const storageFolderSchema = z.object({
  name:                 z.string(),
  path:                 z.string(),
  path_encoded:         z.string(),
  parent_path:          z.string().nullable(),
  parent_path_encoded:  z.string().nullable(),
  depth:                z.number(),
  files_count:          z.number(),
  subdirectories_count: z.number(),
  last_modified:        z.string().nullable(),
})

export type StorageFolder = z.infer<typeof storageFolderSchema>

export type StorageFolderTreeNode = StorageFolder & {
  children: StorageFolderTreeNode[]
}
