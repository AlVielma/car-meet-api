import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller.js';
import { AuthMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

// Obtener la clave pública para suscribirse desde el front
router.get('/vapid-key', NotificationController.getVapidPublicKey);

// Guardar la suscripción del usuario
router.post('/subscribe', AuthMiddleware.authenticate, NotificationController.subscribe);

export default router;
