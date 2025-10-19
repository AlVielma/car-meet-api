import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { ResponseUtil } from '../utils/response.util.js';
import { AuthService } from '../services/auth.service.js';

export class AuthController {
  /**
   * Registrar un nuevo usuario
   */
  static async register(req: Request, res: Response): Promise<Response> {
    try {
      // Validar los datos de entrada
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseUtil.validationError(res, errors.array());
      }

      const { firstName, lastName, email, phone, password } = req.body;

      // Llamar al servicio para registrar el usuario
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

      // Manejo de errores específicos del servicio
      if (error.message === 'EMAIL_ALREADY_EXISTS') {
        return ResponseUtil.error(res, 'El email ya está registrado', null, 409);
      }

      return ResponseUtil.serverError(res, 'Error al registrar el usuario', error);
    }
  }

  /**
   * Activar cuenta de usuario mediante token
   */
  static async activateAccount(req: Request, res: Response): Promise<Response> {
    try {
      const { token } = req.params;

      if (!token) {
        return ResponseUtil.error(res, 'Token de activación no proporcionado', null, 400);
      }

      // Activar la cuenta
      const user = await AuthService.activateAccount(token);

      return ResponseUtil.success(
        res,
        '¡Tu cuenta ha sido activada exitosamente! Ya puedes iniciar sesión.',
        user,
        200
      );
    } catch (error: any) {
      console.error('Error en activateAccount:', error);

      // Manejo de errores específicos
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
}

