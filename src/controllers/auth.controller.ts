import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { ResponseUtil } from '../utils/response.util.js';
import { AuthService } from '../services/auth.service.js';

export class AuthController {

  static async register(req: Request, res: Response): Promise<Response> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseUtil.validationError(res, errors.array());
      }

      const { firstName, lastName, email, phone, password } = req.body;

      const user = await AuthService.register({
        firstName,
        lastName,
        email,
        phone,
        password,
      });

      return ResponseUtil.success(
        res,
        'Usuario registrado exitosamente. Por favor, revisa tu correo para activar tu cuenta.',
        user,
        201
      );
    } catch (error: any) {
      console.error('Error en register:', error);

      if (error.message === 'EMAIL_ALREADY_EXISTS') {
        return ResponseUtil.error(res, 'El email ya está registrado', null, 409);
      }

      return ResponseUtil.serverError(res, 'Error al registrar el usuario', error);
    }
  }

  static async activateAccount(req: Request, res: Response): Promise<Response> {
    try {
      const { token } = req.params;

      if (!token) {
        return ResponseUtil.error(res, 'Token de activación no proporcionado', null, 400);
      }

      const user = await AuthService.activateAccount(token);

      return ResponseUtil.success(
        res,
        '¡Tu cuenta ha sido activada exitosamente! Ya puedes iniciar sesión.',
        user,
        200
      );
    } catch (error: any) {
      console.error('Error en activateAccount:', error);

      if (error.message === 'TOKEN_EXPIRED') {
        return ResponseUtil.error(
          res,
          'El enlace de activación ha expirado. Por favor, solicita uno nuevo.',
          null,
          400
        );
      }

      if (error.message === 'INVALID_TOKEN') {
        return ResponseUtil.error(res, 'El enlace de activación no es válido.', null, 400);
      }

      if (error.message === 'USER_NOT_FOUND') {
        return ResponseUtil.error(res, 'Usuario no encontrado.', null, 404);
      }

      if (error.message === 'ACCOUNT_ALREADY_ACTIVE') {
        return ResponseUtil.error(res, 'Esta cuenta ya ha sido activada.', null, 400);
      }

      return ResponseUtil.serverError(res, 'Error al activar la cuenta', error);
    }
  }

  /**
   * Iniciar sesión con email y contraseña
   */
  static async login(req: Request, res: Response): Promise<Response> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseUtil.validationError(res, errors.array());
      }

      const { email, password } = req.body;

      // Llamar al servicio para autenticar
      const loginResponse = await AuthService.login({ email, password });

      return ResponseUtil.success(
        res,
        'Inicio de sesión exitoso',
        loginResponse,
        200
      );
    } catch (error: any) {
      console.error('Error en login:', error);

      // Manejo de errores específicos del servicio
      if (error.message === 'INVALID_CREDENTIALS') {
        return ResponseUtil.error(res, 'Email o contraseña incorrectos', null, 401);
      }

      if (error.message === 'ACCOUNT_NOT_ACTIVATED') {
        return ResponseUtil.error(
          res, 
          'Tu cuenta no ha sido activada. Por favor, revisa tu correo electrónico.',
          null,
          403
        );
      }

      return ResponseUtil.serverError(res, 'Error al iniciar sesión', error);
    }
  }

  /**
   * Obtener información del usuario autenticado
   */
  static async me(req: Request, res: Response): Promise<Response> {
    try {
      // El usuario viene del middleware de autenticación
      if (!req.user) {
        return ResponseUtil.unauthorized(res, 'Usuario no autenticado');
      }

      // Obtener los datos actualizados del usuario
      const user = await AuthService.getCurrentUser(req.user.userId);

      return ResponseUtil.success(
        res,
        'Información del usuario obtenida exitosamente',
        user,
        200
      );
    } catch (error: any) {
      console.error('Error en me:', error);

      // Manejo de errores específicos
      if (error.message === 'USER_NOT_FOUND') {
        return ResponseUtil.error(res, 'Usuario no encontrado', null, 404);
      }

      if (error.message === 'ACCOUNT_NOT_ACTIVATED') {
        return ResponseUtil.error(
          res,
          'Tu cuenta no ha sido activada. Por favor, revisa tu correo electrónico.',
          null,
          403
        );
      }

      return ResponseUtil.serverError(res, 'Error al obtener información del usuario', error);
    }
  }

}

