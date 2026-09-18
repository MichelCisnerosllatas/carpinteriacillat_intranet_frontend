import type { Metadata } from 'next'
import { Header } from '@/widgets/header/header'
import { ModuleDownloadIndicator } from '@/widgets/header/module-download-indicator'
import { StorageFoldersPage } from '@/features/storage-folders'

export const metadata: Metadata = { title: 'Explorador de Storage' }

export default function StorageFoldersRoute() {
  return (
    <>
      <Header fixed title="Explorador de Storage">
        <ModuleDownloadIndicator route="/storage/folders" />
      </Header>
      <StorageFoldersPage />
    </>
  )
}
