export interface LogoFieldHandle {
  getPendingFile: () => File | null
  wasRemoved: () => boolean
}
