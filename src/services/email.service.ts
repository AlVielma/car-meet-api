import { transporter, emailFrom } from '../configs/email.js';
import { getActivationEmailTemplate, getActivationSuccessTemplate } from '../templates/activation-email.template.js';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  /**
   * Envía un correo electrónico
   */
  static async sendEmail(options: SendEmailOptions): Promise<boolean> {
    try {
      const info = await transporter.sendMail({
        from: `"${emailFrom.name}" <${emailFrom.address}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || 'Por favor, habilita la visualización de HTML en tu cliente de correo.',
      });

      console.log('✅ Email enviado:', info.messageId);
      return true;
    } catch (error) {
      console.error('❌ Error al enviar email:', error);
      return false;
    }
  }

  /**
   * Envía el correo de activación de cuenta
   */
  static async sendActivationEmail(
    userEmail: string,
    userName: string,
    activationUrl: string
  ): Promise<boolean> {
    const html = getActivationEmailTemplate(userName, activationUrl);

    return await this.sendEmail({
      to: userEmail,
      subject: '🚗 Activa tu cuenta en Car Meet',
      html,
      text: `Hola ${userName}, bienvenido a Car Meet. Para activar tu cuenta, visita el siguiente enlace: ${activationUrl}`,
    });
  }

  /**
   * Envía confirmación de cuenta activada
   */
  static async sendActivationSuccessEmail(
    userEmail: string,
    userName: string
  ): Promise<boolean> {
    const html = getActivationSuccessTemplate(userName);

    return await this.sendEmail({
      to: userEmail,
      subject: '✅ ¡Tu cuenta ha sido activada! - Car Meet',
      html,
      text: `¡Felicidades ${userName}! Tu cuenta ha sido activada correctamente. Ya puedes iniciar sesión en Car Meet.`,
    });
  }
}

