import { create } from 'zustand'
import { imagesService } from '../services/images.service'
import { getImageUrl, getImageDisplayName } from '../lib/image-url'
import type { ImageApiItem } from '../model/imageget.dto'

export type ImageSelectOption = {
  id_image: number
  displayName: string
  imageUrl: string
  image_patch: string
}

type State = {
  options:   ImageSelectOption[]
  isLoading: boolean
  isError:   boolean
}

type Action = {
  load: () => Promise<void>
  reload: () => Promise<void>
}

const mapOption = (item: ImageApiItem): ImageSelectOption => ({
  id_image: item.id_image,
  displayName: getImageDisplayName(item),
  imageUrl: getImageUrl(item.image_patch),
  image_patch: item.image_patch,
})

export const useImageSelectStore = create<State & Action>((set, get) => ({
  options:   [],
  isLoading: false,
  isError:   false,

  load: async () => {
    if (get().isLoading || get().options.length > 0) return
    set({ isLoading: true, isError: false })
    try {
      const res = await imagesService.getForSelect()
      if (res.success) {
        set({ options: res.data.map(mapOption), isLoading: false })
      } else {
        set({ isError: true, isLoading: false })
      }
    } catch {
      set({ isError: true, isLoading: false })
    }
  },

  reload: async () => {
    set({ isLoading: false })
    await get().load()
  },
}))
