/**
 * Contrato de respuestas de la API (SDD doc 05.1).
 * Éxito: { success: true, data, message? }
 * Error: { success: false, error, code? }
 */
export interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  code?: string;
}

export type ApiResult<T> = ApiResponse<T> | ApiError;
