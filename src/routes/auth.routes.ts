import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { registerValidator, loginValidator } from '../middlewares/validators/auth.validator.js';
import { AuthMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Registrar un nuevo usuario
 * @access  Public
 */
router.post('/register', registerValidator, AuthController.register);

/**
 * @route   GET /api/auth/activate/:token
 * @desc    Activar cuenta de usuario mediante token firmado
 * @access  Public
 */
router.get('/activate/:token', AuthController.activateAccount);

/**
 * @route   POST /api/auth/login
 * @desc    Iniciar sesión con email y contraseña
 * @access  Public
 */
router.post('/login', loginValidator, AuthController.login);

/**
 * @route   GET /api/auth/me
 * @desc    Obtener información del usuario autenticado
 * @access  Private
 */
router.get('/me', AuthMiddleware.authenticate, AuthController.me);

export default router;

