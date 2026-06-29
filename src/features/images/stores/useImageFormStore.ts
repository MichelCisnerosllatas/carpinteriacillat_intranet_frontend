// src/features/images/stores/useImageFormStore.ts
import { create } from "zustand";
import type { ImagePostRequestDto } from "../model/imagepost.dto";
import { imagesService } from "../services/images.service";
import { useImageListStore } from '@/features/images/stores/useImageListStore'

type State = {
  isSubmitting: boolean;
  error: string | null;
  fieldErrors: Record<string, string[]> | null;
  form: ImagePostRequestDto;
};

type Action = {
  setField: <K extends keyof ImagePostRequestDto>(
    field: K,
    value: ImagePostRequestDto[K]
  ) => void;

  setForm: (data: Partial<ImagePostRequestDto>) => void;

  registerBdFormImage: (data: ImagePostRequestDto) => Promise<boolean>;

  reset: () => void;
};

const initialForm: ImagePostRequestDto = {
  image: null,
  image_name: "",
  image_title: "",
  image_alt: "",
  folder: "",
};

export const useImageFormStore = create<State & Action>((set) => ({
  isSubmitting: false,
  error: null,
  fieldErrors: null,
  form: initialForm,

  setField: (field, value) =>
    set((state) => ({
      form: {
        ...state.form,
        [field]: value,
      },
    })),

  setForm: (data) =>
    set((state) => ({
      form: {
        ...state.form,
        ...data,
      },
    })),

  registerBdFormImage: async (data) => {
    set({
      isSubmitting: true,
      error: null,
      fieldErrors: null,
      form: data,
    });

    try {
      if (!data.image) {
        set({
          isSubmitting: false,
          error: "Selecciona una imagen.",
        });

        return false;
      }

      

      const response = await imagesService.post(data);
      if (!response.success) {
        set({
          isSubmitting: false,
          error: response.message,
          // fieldErrors: response.errors ?? null,
        });

        return false;
      }

      await useImageListStore.getState().load()
      set({
        isSubmitting: false,
        error: null,
        fieldErrors: null,
      });

      return true;
    } catch (error: any) {
      set({
        isSubmitting: false,
        error:
          error?.response?.data?.message ??
          error?.message ??
          "Error al registrar los datos de la imagen.",
        fieldErrors: error?.response?.data?.errors ?? null,
      });

      return false;
    }
  },

  reset: () =>
    set({
      isSubmitting: false,
      error: null,
      fieldErrors: null,
      form: initialForm,
    }),
}));