import webpush from 'web-push';
import prisma from '../configs/database.js';

// Configurar web-push con las claves del entorno
// Asegúrate de llamar a esta función al iniciar la app o antes de enviar
export const configureWebPush = () => {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || 'mailto:example@yourdomain.org';

  if (!publicKey || !privateKey) {
    console.warn('VAPID keys not found in environment variables. Push notifications will not work.');
    return;
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
};

export class NotificationService {
  /**
   * Envía una notificación push a un usuario específico
   */
  static async sendPushNotification(userId: number, payload: { title: string; body: string; url?: string }) {
    try {
      // 1. Obtener todas las suscripciones del usuario (puede tener varios dispositivos: móvil, laptop, etc.)
      const subscriptions = await prisma.pushSubscription.findMany({
        where: { userId }
      });

      if (subscriptions.length === 0) {
        console.log(`El usuario ${userId} no tiene suscripciones push activas.`);
        return;
      }

      // 2. Enviar la notificación a todas las suscripciones
      const notifications = subscriptions.map(async (sub: any) => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        };

        const notificationData = {
          notification: {
            title: payload.title,
            body: payload.body,
            icon: 'assets/icons/icon-192x192.png',
            vibrate: [100, 50, 100],
            data: {
              url: payload.url,
              dateOfArrival: Date.now()
            }
          }
        };

        try {
          await webpush.sendNotification(pushSubscription, JSON.stringify(notificationData));
        } catch (error: any) {
          // Si el endpoint ya no es válido (410 Gone), eliminar la suscripción
          if (error.statusCode === 410 || error.statusCode === 404) {
            console.log(`Suscripción caducada para usuario ${userId}, eliminando...`);
            await prisma.pushSubscription.delete({
              where: { id: sub.id }
            });
          } else {
            console.error('Error al enviar push notification:', error);
          }
        }
      });

      await Promise.all(notifications);
      console.log(`Notificación enviada a ${subscriptions.length} dispositivos del usuario ${userId}`);

    } catch (error) {
      console.error('Error general en sendPushNotification:', error);
    }
  }

  /**
   * Guarda una nueva suscripción push para un usuario
   */
  static async subscribe(userId: number, subscription: { endpoint: string; keys: { p256dh: string; auth: string } }) {
    // Verificar si ya existe para evitar duplicados exactos
    const existing = await prisma.pushSubscription.findUnique({
      where: { endpoint: subscription.endpoint }
    });

    if (existing) {
      // Si existe pero cambió de usuario (raro, pero posible), actualizamos
      if (existing.userId !== userId) {
        return prisma.pushSubscription.update({
          where: { id: existing.id },
          data: { userId }
        });
      }
      return existing;
    }

    return prisma.pushSubscription.create({
      data: {
        userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth
      }
    });
  }
}
