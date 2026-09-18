import apiClient from '@/shared/api/apiClient'
import { TESTIMONY_ENDPOINTS } from './testimony.endpoint'
import type {
  TestimonyListRequestDto,
  TestimonyListResponseDto,
  TestimonyGetByIdResponseDto,
} from '../model/testimonyget.dto'
import type { TestimonyPostRequestDto, TestimonyPostResponseDto } from '../model/testimonypost.dto'
import type { TestimonyPutRequestDto, TestimonyPutResponseDto } from '../model/testimonyput.dto'
import type { TestimonyReorderRequestDto, TestimonyReorderResponseDto } from '../model/testimonyreorder.dto'
import type { TestimonySectionResponseDto } from '../model/testimonysection.dto'

export const testimonyService = {
  // Lista y detalle usan `_join` (`testimony_join`) — es lo único que trae `section.section_name`
  // e `image.image_patch`, igual que `sectionImagesService`.
  getList: async (param: TestimonyListRequestDto): Promise<TestimonyListResponseDto> => {
    const params = Object.fromEntries(
      Object.entries(param).filter(([, v]) => v !== undefined && v !== null && v !== '')
    )
    const { data } = await apiClient.get<TestimonyListResponseDto>(TESTIMONY_ENDPOINTS.v1.getJoin, { params })
    return data
  },

  getById: async (id: number): Promise<TestimonyGetByIdResponseDto> => {
    const { data } = await apiClient.get<TestimonyGetByIdResponseDto>(TESTIMONY_ENDPOINTS.v1.getByIdJoin(id))
    return data
  },

  post: async (param: TestimonyPostRequestDto): Promise<TestimonyPostResponseDto> => {
    const { data } = await apiClient.post<TestimonyPostResponseDto>(TESTIMONY_ENDPOINTS.v1.post, param)
    return data
  },

  put: async (id: number, param: TestimonyPutRequestDto): Promise<TestimonyPutResponseDto> => {
    const { data } = await apiClient.put<TestimonyPutResponseDto>(TESTIMONY_ENDPOINTS.v1.put(id), param)
    return data
  },

  patch: async (id: number, param: Partial<TestimonyPutRequestDto>): Promise<TestimonyPutResponseDto> => {
    const { data } = await apiClient.patch<TestimonyPutResponseDto>(TESTIMONY_ENDPOINTS.v1.patch(id), param)
    return data
  },

  delete: async (id: number): Promise<boolean> => {
    const { data } = await apiClient.delete(TESTIMONY_ENDPOINTS.v1.delete(id))
    return data.success
  },

  reorder: async (param: TestimonyReorderRequestDto): Promise<TestimonyReorderResponseDto> => {
    const { data } = await apiClient.post<TestimonyReorderResponseDto>(TESTIMONY_ENDPOINTS.v1.reorder, param)
    return data
  },

  // Resuelve la única sección de testimonios (tipo `testimonial_carousel`). 404 (axios lanza) si
  // aún no existe ninguna — instalación nueva sin seed.
  getSection: async (): Promise<TestimonySectionResponseDto> => {
    const { data } = await apiClient.get<TestimonySectionResponseDto>(TESTIMONY_ENDPOINTS.v1.section)
    return data
  },
}
