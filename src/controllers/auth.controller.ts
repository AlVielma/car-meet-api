import { Request, Response } from "express";
import { validationResult } from "express-validator";
import fs from 'fs';
import { ResponseUtil } from "../utils/response.util.js";
import { AuthService } from "../services/auth.service.js";

export class AuthController {
  static async register(req: Request, res: Response): Promise<Response> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // Si hay errores de validación y se subió una imagen, la eliminamos
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return ResponseUtil.validationError(res, errors.array());
      }

      const { firstName, lastName, email, phone, password } = req.body;
      const photoPath = req.file ? req.file.path : undefined;

      console.log("Datos de registro recibidos:", {
        firstName,
        lastName,
        email,
        phone,
        password,
        photoPath,
      });

      const user = await AuthService.register({
        firstName,
        lastName,
        email,
        phone,
        password,
        photoPath
      });

      return ResponseUtil.success(
        res,
        "Usuario registrado exitosamente. Por favor, revisa tu correo para activar tu cuenta.",
        user,
        201
      );
    } catch (error: any) {
      console.error("Error en register:", error);

      // Si hubo un error y se subió un archivo, eliminarlo
      if (req.file) {
        try {
          if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
          }
        } catch (unlinkError) {
          console.error("Error al eliminar archivo tras fallo en registro:", unlinkError);
        }
      }

      if (error.message === "EMAIL_ALREADY_EXISTS") {
        return ResponseUtil.error(
          res,
          "El email ya está registrado",
          null,
          409
        );
      }

      return ResponseUtil.serverError(
        res,
        "Error al registrar el usuario",
        error
      );
    }
  }

  static async activateAccount(req: Request, res: Response): Promise<any> {
    try {
      const { token } = req.params;

      const frontendUrl = process.env.NODE_ENV === 'production'
        ? (process.env.FRONTEND_URL || 'http://localhost:8100')
        : 'http://localhost:8100';

      if (!token) {
        return res.redirect(`${frontendUrl}/login?status=error&message=${encodeURIComponent("Token de activación no proporcionado")}`);
      }

      await AuthService.activateAccount(token);

      return res.redirect(`${frontendUrl}/login?status=success&message=${encodeURIComponent("¡Tu cuenta ha sido activada exitosamente! Ya puedes iniciar sesión.")}`);

    } catch (error: any) {
      console.error("Error en activateAccount:", error);

      const frontendUrl = process.env.NODE_ENV === 'production'
        ? (process.env.FRONTEND_URL || 'http://localhost:8100')
        : 'http://localhost:8100';

      let message = "Error al activar la cuenta";

      if (error.message === "TOKEN_EXPIRED") {
        message = "El enlace de activación ha expirado. Por favor, solicita uno nuevo.";
      } else if (error.message === "INVALID_TOKEN") {
        message = "El enlace de activación no es válido.";
      } else if (error.message === "USER_NOT_FOUND") {
        message = "Usuario no encontrado.";
      } else if (error.message === "ACCOUNT_ALREADY_ACTIVE") {
        message = "Esta cuenta ya ha sido activada.";
      }

      return res.redirect(`${frontendUrl}/login?status=error&message=${encodeURIComponent(message)}`);
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
      const loginStep1Response = await AuthService.loginStep1({
        email,
        password,
      });

      return ResponseUtil.success(
        res,
        loginStep1Response.message,
        { email: loginStep1Response.email },
        200
      );
    } catch (error: any) {
      console.error("Error en login:", error);

      // Manejo de errores específicos del servicio
      if (error.message === "INVALID_CREDENTIALS") {
        return ResponseUtil.error(
          res,
          "Email o contraseña incorrectos",
          null,
          401
        );
      }

      if (error.message === "ACCOUNT_NOT_ACTIVATED") {
        return ResponseUtil.error(
          res,
          "Tu cuenta no ha sido activada. Por favor, revisa tu correo electrónico.",
          null,
          403
        );
      }

      return ResponseUtil.serverError(res, "Error al iniciar sesión", error);
    }
  }

  /**
 * Login específico para administradores: valida rol antes de enviar código
 */
  static async adminLogin(req: Request, res: Response): Promise<Response> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseUtil.validationError(res, errors.array());
      }

      const { email, password } = req.body;

      // Llamar al servicio para verificar si es admin
      const adminLoginResponse = await AuthService.adminLoginStep1({
        email,
        password,
      });

      return ResponseUtil.success(
        res,
        adminLoginResponse.message,
        { email: adminLoginResponse.email, role: adminLoginResponse.role },
        200
      );
    } catch (error: any) {
      console.error("Error en adminLogin:", error);

      // Manejo de errores específicos
      if (error.message === "INVALID_CREDENTIALS") {
        return ResponseUtil.error(
          res,
          "Email o contraseña incorrectos",
          null,
          401
        );
      }

      if (error.message === "ACCOUNT_NOT_ACTIVATED") {
        return ResponseUtil.error(
          res,
          "Tu cuenta no ha sido activada. Por favor, revisa tu correo electrónico.",
          null,
          403
        );
      }

      if (error.message === "NOT_ADMIN") {
        return ResponseUtil.error(
          res,
          "Acceso denegado. Solo administradores pueden acceder.",
          null,
          403
        );
      }

      return ResponseUtil.serverError(res, "Error al iniciar sesión", error);
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
        "Inicio de sesión exitoso",
        verifyResponse,
        200
      );
    } catch (error: any) {
      console.error("Error en verifyCode:", error);

      // Manejo de errores específicos del servicio
      if (error.message === "INVALID_CREDENTIALS") {
        return ResponseUtil.error(res, "Email incorrecto", null, 401);
      }

      if (error.message === "ACCOUNT_NOT_ACTIVATED") {
        return ResponseUtil.error(
          res,
          "Tu cuenta no ha sido activada. Por favor, revisa tu correo electrónico.",
          null,
          403
        );
      }

      if (error.message === "NO_VERIFICATION_CODE") {
        return ResponseUtil.error(
          res,
          "No hay código de verificación pendiente. Por favor, inicia sesión.",
          null,
          400
        );
      }

      if (error.message === "VERIFICATION_CODE_EXPIRED") {
        return ResponseUtil.error(
          res,
          "El código de verificación ha expirado.",
          null,
          400
        );
      }

      if (error.message === "INVALID_VERIFICATION_CODE") {
        return ResponseUtil.error(
          res,
          "Código de verificación incorrecto",
          null,
          400
        );
      }

      return ResponseUtil.serverError(res, "Error al verificar código", error);
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
      const resendResponse = await AuthService.resendVerificationCode({
        email,
      });

      return ResponseUtil.success(
        res,
        resendResponse.message,
        { email: resendResponse.email },
        200
      );
    } catch (error: any) {
      console.error("Error en resendCode:", error);

      // Manejo de errores específicos del servicio
      if (error.message === "USER_NOT_FOUND") {
        return ResponseUtil.error(res, "Usuario no encontrado", null, 404);
      }

      if (error.message === "ACCOUNT_NOT_ACTIVATED") {
        return ResponseUtil.error(
          res,
          "Tu cuenta no ha sido activada. Por favor, revisa tu correo electrónico.",
          null,
          403
        );
      }

      if (error.message.startsWith("CODE_ALREADY_SENT:")) {
        const timeRemaining = error.message.split(": ")[1];
        return ResponseUtil.error(
          res,
          timeRemaining,
          null,
          429 // Too Many Requests
        );
      }

      return ResponseUtil.serverError(res, "Error al reenviar código", error);
    }
  }

  /**
   * Obtener información del usuario autenticado
   */
  static async me(req: Request, res: Response): Promise<Response> {
    try {
      // El usuario viene del middleware de autenticación
      if (!req.user) {
        return ResponseUtil.unauthorized(res, "Usuario no autenticado");
      }

      // Obtener los datos actualizados del usuario
      const user = await AuthService.getCurrentUser(req.user.userId);

      return ResponseUtil.success(
        res,
        "Información del usuario obtenida exitosamente",
        user,
        200
      );
    } catch (error: any) {
      console.error("Error en me:", error);

      // Manejo de errores específicos
      if (error.message === "USER_NOT_FOUND") {
        return ResponseUtil.error(res, "Usuario no encontrado", null, 404);
      }

      if (error.message === "ACCOUNT_NOT_ACTIVATED") {
        return ResponseUtil.error(
          res,
          "Tu cuenta no ha sido activada. Por favor, revisa tu correo electrónico.",
          null,
          403
        );
      }

      return ResponseUtil.serverError(
        res,
        "Error al obtener información del usuario",
        error
      );
    }
  }

  /**
   * Actualizar perfil del usuario autenticado
   */
  static async updateProfile(req: Request, res: Response): Promise<Response> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // Si hay errores de validación y se subió una imagen, la eliminamos
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return ResponseUtil.validationError(res, errors.array());
      }

      if (!req.user) {
        if (req.file) fs.unlinkSync(req.file.path);
        return ResponseUtil.unauthorized(res, "Usuario no autenticado");
      }

      const { firstName, lastName, phone } = req.body;
      const photoPath = req.file ? req.file.path : undefined;

      const updateData: any = {
        firstName,
        lastName,
        phone,
        photoPath
      };

      const user = await AuthService.updateProfile(req.user.userId, updateData);

      return ResponseUtil.success(
        res,
        "Perfil actualizado exitosamente",
        user,
        200
      );
    } catch (error: any) {
      console.error("Error en updateProfile:", error);

      // Si hubo un error y se subió un archivo, eliminarlo
      if (req.file) {
        try {
          if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
          }
        } catch (unlinkError) {
          console.error("Error al eliminar archivo tras fallo en actualización:", unlinkError);
        }
      }

      if (error.message === "USER_NOT_FOUND") {
        return ResponseUtil.error(res, "Usuario no encontrado", null, 404);
      }

      return ResponseUtil.serverError(res, "Error al actualizar el perfil", error);
    }
  }

  static async logout(req: Request, res: Response): Promise<Response> {
    try {
      // Si usas cookie para el token, límpiala (ajusta el nombre de la cookie)
      // res.clearCookie('authToken', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });

      return ResponseUtil.success(res, "Sesión cerrada", null, 200);
      // Alternativa sin ResponseUtil:
      // return res.status(200).json({ success: true, message: 'Sesión cerrada' });
    } catch (error: any) {
      return ResponseUtil.serverError(res, "Error al cerrar sesión", error);
    }
  }
}
