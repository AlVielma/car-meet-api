import { Request, Response } from 'express';
import { NotificationService } from '../services/notification.service.js';
import { ResponseUtil } from '../utils/response.util.js';

export class NotificationController {
  static async subscribe(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const subscription = req.body;

      if (!userId) {
        return ResponseUtil.unauthorized(res, 'Usuario no autenticado');
      }

      if (!subscription || !subscription.endpoint || !subscription.keys) {
        return ResponseUtil.error(res, 'Datos de suscripción inválidos', null, 400);
      }

      await NotificationService.subscribe(userId, subscription);

      return ResponseUtil.success(res, 'Suscripción a notificaciones exitosa', null, 201);
    } catch (error: any) {
      console.error('Error en subscribe:', error);
      return ResponseUtil.serverError(res, 'Error al suscribirse a notificaciones', error);
    }
  }

  static async getVapidPublicKey(req: Request, res: Response) {
    const key = process.env.VAPID_PUBLIC_KEY;
    if (!key) {
      return ResponseUtil.serverError(res, 'Clave pública VAPID no configurada', null);
    }
    return res.json({ success: true, key });
  }
}
