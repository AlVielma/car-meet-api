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
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'Token no proporcionado'
        });
      }

      const token = authHeader.substring(7);

      const decoded = JwtUtil.verifyAccessToken(token);

      if (!decoded || !decoded.userId) {
        return res.status(401).json({
          success: false,
          message: 'Token inválido'
        });
      }

      // Normalizar: copiar userId a id para compatibilidad
      (req as any).user = {
        ...decoded,
        id: decoded.userId // ← Agregar id como alias de userId
      };

      next();
    } catch (error: any) {
      console.error('Error en autenticación:', error);

      return res.status(401).json({
        success: false,
        message: 'Token inválido o expirado'
      });
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
