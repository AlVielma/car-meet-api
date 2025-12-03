import { resend, emailConfig } from '../configs/resend.js';
import { 
  getActivationEmailTemplate, 
  getActivationSuccessTemplate, 
  getVerificationCodeTemplate 
} from '../templates/activation-email.template.js';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  /**
   * Envía un correo electrónico usando Resend
   */
  static async sendEmail(options: SendEmailOptions): Promise<boolean> {
    try {
      // Si no hay API key configurada, solo logea (para desarrollo)
      if (!process.env.RESEND_API_KEY) {
        console.log('📧 Email simulado (Resend no configurado):');
        console.log('Para:', options.to);
        console.log('Asunto:', options.subject);
        console.log('---');
        return true;
      }

      const { data, error } = await resend.emails.send({
        from: `${emailConfig.fromName} <${emailConfig.from}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || 'Por favor, habilita la visualización de HTML en tu cliente de correo.',
      });

      if (error) {
        console.error('❌ Error al enviar email con Resend:', error);
        return false;
      }

      console.log('✅ Email enviado con Resend:', data?.id);
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

  /**
   * Envía código de verificación para 2FA
   */
  static async sendVerificationCode(
    userEmail: string,
    userName: string,
    verificationCode: string
  ): Promise<boolean> {
    const html = getVerificationCodeTemplate(userName, verificationCode);

    return await this.sendEmail({
      to: userEmail,
      subject: '🔐 Código de verificación - Car Meet',
      html,
      text: `Hola ${userName}, tu código de verificación es: ${verificationCode}. Este código expira en 5 minutos.`,
    });
  }
}

