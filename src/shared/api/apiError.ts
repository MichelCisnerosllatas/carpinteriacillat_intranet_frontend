// src/shared/api/apiError.ts
import axios from 'axios';

export const getApiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as any;

    if (data?.message) {
      return data.message;
    }

    if (Array.isArray(data?.errors) && data.errors.length > 0) {
      return data.errors.join('\n');
    }

    if (typeof data?.errors === 'object' && data.errors !== null) {
      return Object.values(data.errors).flat().join('\n');
    }

    if (error.response?.status === 400) {
      return 'Solicitud inválida. Verifica los datos enviados.';
    }

    if (error.response?.status === 401) {
      return 'No autorizado. Verifica tus credenciales.';
    }

    if (error.response?.status === 500) {
      return 'Error interno del servidor.';
    }

    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Error desconocido.';
};