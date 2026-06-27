// src/features/images/model/imagepost.dto.ts
import { ImageApiItem } from "./imageget.dto";

export type ImagePostRequestDto = {
  image: File | null;
  image_name: string;
  image_title: string;
  image_alt: string;
  folder?: string;
};

export type ImagePostResponseDto = {
  success: boolean;
  status: number;
  message: string;
  data: ImageApiItem | null;
};