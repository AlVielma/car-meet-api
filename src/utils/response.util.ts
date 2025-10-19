import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any;
}

export class ResponseUtil {
  static success<T>(res: Response, message: string, data?: T, statusCode: number = 200): Response {
    const response: ApiResponse<T> = {
      success: true,
      message,
      ...(data !== undefined && { data }),
    };
    return res.status(statusCode).json(response);
  }

  static error(res: Response, message: string, errors?: any, statusCode: number = 400): Response {
    const response: ApiResponse = {
      success: false,
      message,
      errors,
    };
    return res.status(statusCode).json(response);
  }

  static validationError(res: Response, errors: any): Response {
    return this.error(res, 'Errores de validación', errors, 422);
  }

  static unauthorized(res: Response, message: string = 'No autorizado'): Response {
    return this.error(res, message, null, 401);
  }

  static forbidden(res: Response, message: string = 'Acceso denegado'): Response {
    return this.error(res, message, null, 403);
  }

  static notFound(res: Response, message: string = 'Recurso no encontrado'): Response {
    return this.error(res, message, null, 404);
  }

  static serverError(res: Response, message: string = 'Error interno del servidor', error?: any): Response {
    console.error('Error del servidor:', error);
    return this.error(res, message, error, 500);
  }
}

