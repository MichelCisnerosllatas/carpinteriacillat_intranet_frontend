'use client'

import { useEffect, useState } from 'react'
import { useStorageFolderListStore } from '../stores/useStorageFolderListStore'
import { useStorageFolderTreeStore } from '../stores/useStorageFolderTreeStore'
import { useStorageFolderActionStore } from '../stores/useStorageFolderActionStore'
import { useStorageFileListStore } from '@/features/storage-files/stores/useStorageFileListStore'
import { useStorageFileActionStore } from '@/features/storage-files/stores/useStorageFileActionStore'
import { toastSuccess, toastError } from '@/shared/lib/toast'
import { FolderTree } from './folder-tree'
import { StorageExplorer } from './storage-explorer'
import { FolderNewModal } from './folder-new-modal'
import { FolderRenameModal } from './folder-rename-modal'
import { FolderDeleteDialog } from './folder-delete-dialog'
import type { StorageFolder } from '../data/schema'

type DragPayload = { kind: 'file' | 'folder'; paths: string[]; encodeds: string[] }

export function StorageFoldersPage() {
  const { load: loadList, filters, navigate } = useStorageFolderListStore()
  const { tree, isFetching: treeLoading, hasLoaded: treeLoaded, load: loadTree } =
    useStorageFolderTreeStore()
  const { load: loadFiles } = useStorageFileListStore()
  const fileActionStore   = useStorageFileActionStore()
  const folderActionStore = useStorageFolderActionStore()

  const [newModalOpen, setNewModalOpen] = useState(false)
  const [renameFolder, setRenameFolder] = useState<StorageFolder | null>(null)
  const [deleteFolder, setDeleteFolder] = useState<StorageFolder | null>(null)

  const currentPath = filters.path ?? null

  useEffect(() => { void loadTree() }, [])

  const handleNavigate = (path: string | null) => {
    navigate(path)
  }

  const handleDeleted = (deletedPath: string, parentPath: string | null) => {
    if (currentPath === deletedPath) navigate(parentPath)
    refreshAll()
  }

  // Full refresh: list, tree, and files — called after any mutation
  const refreshAll = async () => {
    await Promise.all([
      loadList({ page: 1, per_page: 100 }),
      loadTree(),
      loadFiles({ page: 1 }),
    ])
  }

  // Called when items (files OR folders) are dropped onto a tree node
  const handleTreeItemDrop = async (targetPath: string | null, payload: DragPayload) => {
    const dest = targetPath ? targetPath.split('/').pop()! : 'raíz'

    if (payload.kind === 'file') {
      const items = payload.encodeds.map((enc) => ({ pathEncoded: enc, newFolder: targetPath ?? '' }))
      const { done, errors } = await fileActionStore.moveBulk(items)
      await refreshAll()
      if (errors === 0)
        toastSuccess('Archivos movidos', `${done} archivo${done !== 1 ? 's' : ''} movido${done !== 1 ? 's' : ''} a "${dest}".`)
      else
        toastError('Movimiento parcial', `${done} de ${payload.encodeds.length} movido${done !== 1 ? 's' : ''}, ${errors} con error.`)
    } else {
      // Prevent moving a folder into itself or into a descendant
      if (targetPath && payload.paths.some((p) => targetPath.startsWith(p))) {
        toastError('Movimiento no permitido', 'No puedes mover una carpeta dentro de sí misma.')
        return
      }
      const items = payload.encodeds.map((enc) => ({ path_encoded: enc, new_folder: targetPath ?? '' }))
      const { done, errors, lastError } = await folderActionStore.moveFoldersBulk(items)
      await refreshAll()
      if (errors === 0)
        toastSuccess('Carpetas movidas', `${done} carpeta${done !== 1 ? 's' : ''} movida${done !== 1 ? 's' : ''} a "${dest}".`)
      else
        toastError('Error al mover carpeta', lastError ?? `${done} de ${payload.encodeds.length} movida${done !== 1 ? 's' : ''}, ${errors} con error.`)
    }
  }

  return (
    <div className="flex flex-col gap-0 h-full">
      {/* Body: tree sidebar + unified explorer */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left panel — Tree */}
        <aside className="w-56 shrink-0 border-r flex flex-col gap-2 overflow-y-auto p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-2 pt-1">
            Árbol de carpetas
          </p>
          <FolderTree
            tree={tree}
            activePath={currentPath}
            isLoading={treeLoading && !treeLoaded}
            onNavigate={handleNavigate}
            onItemDrop={(targetPath, payload) => void handleTreeItemDrop(targetPath, payload)}
          />
        </aside>

        {/* Right panel — Unified grid */}
        <main className="flex-1 overflow-y-auto p-5">
          <StorageExplorer
            onNavigate={handleNavigate}
            onNewFolder={() => setNewModalOpen(true)}
            onRename={(f) => setRenameFolder(f)}
            onDelete={(f) => setDeleteFolder(f)}
            onMutation={refreshAll}
          />
        </main>
      </div>

      {/* Folder modals */}
      <FolderNewModal
        open={newModalOpen}
        parentPath={currentPath}
        onClose={() => setNewModalOpen(false)}
        onCreated={refreshAll}
      />
      <FolderRenameModal
        open={renameFolder !== null}
        folder={renameFolder}
        onClose={() => setRenameFolder(null)}
        onRenamed={refreshAll}
      />
      <FolderDeleteDialog
        open={deleteFolder !== null}
        folder={deleteFolder}
        onClose={() => setDeleteFolder(null)}
        onDeleted={handleDeleted}
      />
    </div>
  )
}
