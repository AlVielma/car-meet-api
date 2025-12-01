import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import {
  registerValidator,
  loginValidator,
  verifyCodeValidator,
  resendCodeValidator,
} from "../middlewares/validators/auth.validator.js";
import { AuthMiddleware } from "../middlewares/auth.middleware.js";
import { uploadProfilePhoto, resizeProfilePhoto } from "../middlewares/upload.middleware.js";

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Registrar un nuevo usuario
 * @access  Public
 */
router.post("/register", uploadProfilePhoto.single('photo'), resizeProfilePhoto, registerValidator, AuthController.register);

/**
 * @route   GET /api/auth/activate/:token
 * @desc    Activar cuenta de usuario mediante token firmado
 * @access  Public
 */
router.get("/activate/:token", AuthController.activateAccount);

/**
 * @route   POST /api/auth/login
 * @desc    Primer paso del login: verifica credenciales y envía código de verificación
 * @access  Public
 */
router.post("/login", loginValidator, AuthController.login);

/**
 * @route   POST /api/auth/verify-code
 * @desc    Segundo paso del login: verifica el código de verificación
 * @access  Public
 */
router.post("/verify-code", verifyCodeValidator, AuthController.verifyCode);

/**
 * @route   POST /api/auth/resend-code
 * @desc    Reenvía código de verificación
 * @access  Public
 */
router.post("/resend-code", resendCodeValidator, AuthController.resendCode);

/**
 * @route   GET /api/auth/me
 * @desc    Obtener información del usuario autenticado
 * @access  Private
 */
router.get("/me", AuthMiddleware.authenticate, AuthController.me);

/**
 * @route   POST /api/auth/logout
 * @desc    Cerrar sesión (el cliente debe borrar el token)
 * @access  Private
 */
router.post("/logout", AuthMiddleware.authenticate, AuthController.logout);

export default router;
