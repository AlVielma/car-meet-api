import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { registerValidator } from '../middlewares/validators/auth.validator.js';

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

export default router;

