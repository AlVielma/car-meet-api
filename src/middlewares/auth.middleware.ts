import { Request, Response, NextFunction } from 'express';
import { JwtUtil, AccessTokenPayload } from '../utils/jwt.util.js';
import { ResponseUtil } from '../utils/response.util.js';

// Extender la interfaz Request para incluir los datos del usuario
declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
    }
  }
}

export class AuthMiddleware {
  /**
   * Middleware para verificar el token de acceso
   */
  static authenticate(req: Request, res: Response, next: NextFunction): Response | void {
    try {
      // Obtener el token del header Authorization
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        return ResponseUtil.unauthorized(res, 'Token de acceso no proporcionado');
      }

      // Verificar formato del header (Bearer <token>)
      if (!authHeader.startsWith('Bearer ')) {
        return ResponseUtil.unauthorized(res, 'Formato de token inválido. Use: Bearer <token>');
      }

      // Extraer el token
      const token = authHeader.slice(7); // Remover 'Bearer '
      
      if (!token) {
        return ResponseUtil.unauthorized(res, 'Token de acceso no proporcionado');
      }

      // Verificar el token
      const payload = JwtUtil.verifyAccessToken(token);
      
      // Agregar los datos del usuario al request
      req.user = payload;
      
      // Continuar con el siguiente middleware
      next();
    } catch (error: any) {
      console.error('Error en autenticación:', error);

      // Manejo de errores específicos
      if (error.message === 'TOKEN_EXPIRED') {
        return ResponseUtil.unauthorized(res, 'El token ha expirado');
      }

      if (error.message === 'INVALID_TOKEN' || error.message === 'INVALID_TOKEN_TYPE') {
        return ResponseUtil.unauthorized(res, 'Token de acceso inválido');
      }

      return ResponseUtil.unauthorized(res, 'Token de acceso inválido');
    }
  }

  /**
   * Middleware para verificar roles específicos
   */
  static requireRole(...roles: string[]) {
    return (req: Request, res: Response, next: NextFunction): Response | void => {
      // El usuario debe estar autenticado primero
      if (!req.user) {
        return ResponseUtil.unauthorized(res, 'Usuario no autenticado');
      }

      // Verificar si el usuario tiene uno de los roles requeridos
      if (!roles.includes(req.user.roleSlug)) {
        return ResponseUtil.forbidden(res, 'No tienes permisos para acceder a este recurso');
      }

      next();
    };
  }

  /**
   * Middleware opcional - no falla si no hay token, pero lo procesa si existe
   */
  static optionalAuth(req: Request, res: Response, next: NextFunction): void {
    try {
      const authHeader = req.headers.authorization;
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.slice(7);
        
        if (token) {
          const payload = JwtUtil.verifyAccessToken(token);
          req.user = payload;
        }
      }
    } catch (error) {
      // En autenticación opcional, ignoramos errores de token
      console.log('Token opcional inválido, continuando sin autenticación');
    }
    
    next();
  }
}
