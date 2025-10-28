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
   * Primer paso del login: verifica credenciales y envía código de verificación
   */
  static async login(req: Request, res: Response): Promise<Response> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseUtil.validationError(res, errors.array());
      }

      const { email, password } = req.body;

      // Llamar al servicio para el primer paso del login
      const loginStep1Response = await AuthService.loginStep1({ email, password });

      return ResponseUtil.success(
        res,
        loginStep1Response.message,
        { email: loginStep1Response.email },
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
   * Segundo paso del login: verifica el código de verificación
   */
  static async verifyCode(req: Request, res: Response): Promise<Response> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseUtil.validationError(res, errors.array());
      }

      const { email, code } = req.body;

      // Llamar al servicio para verificar el código
      const verifyResponse = await AuthService.verifyCode({ email, code });

      return ResponseUtil.success(
        res,
        'Inicio de sesión exitoso',
        verifyResponse,
        200
      );
    } catch (error: any) {
      console.error('Error en verifyCode:', error);

      // Manejo de errores específicos del servicio
      if (error.message === 'INVALID_CREDENTIALS') {
        return ResponseUtil.error(res, 'Email incorrecto', null, 401);
      }

      if (error.message === 'ACCOUNT_NOT_ACTIVATED') {
        return ResponseUtil.error(
          res, 
          'Tu cuenta no ha sido activada. Por favor, revisa tu correo electrónico.',
          null,
          403
        );
      }

      if (error.message === 'NO_VERIFICATION_CODE') {
        return ResponseUtil.error(
          res, 
          'No hay código de verificación pendiente. Por favor, inicia sesión.',
          null,
          400
        );
      }

      if (error.message === 'VERIFICATION_CODE_EXPIRED') {
        return ResponseUtil.error(
          res, 
          'El código de verificación ha expirado.',
          null,
          400
        );
      }

      if (error.message === 'INVALID_VERIFICATION_CODE') {
        return ResponseUtil.error(
          res, 
          'Código de verificación incorrecto',
          null,
          400
        );
      }

      return ResponseUtil.serverError(res, 'Error al verificar código', error);
    }
  }

  /**
   * Reenvía código de verificación
   */
  static async resendCode(req: Request, res: Response): Promise<Response> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseUtil.validationError(res, errors.array());
      }

      const { email } = req.body;

      // Llamar al servicio para reenviar el código
      const resendResponse = await AuthService.resendVerificationCode({ email });

      return ResponseUtil.success(
        res,
        resendResponse.message,
        { email: resendResponse.email },
        200
      );
    } catch (error: any) {
      console.error('Error en resendCode:', error);

      // Manejo de errores específicos del servicio
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

      if (error.message.startsWith('CODE_ALREADY_SENT:')) {
        const timeRemaining = error.message.split(': ')[1];
        return ResponseUtil.error(
          res, 
          timeRemaining,
          null,
          429 // Too Many Requests
        );
      }

      return ResponseUtil.serverError(res, 'Error al reenviar código', error);
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

