import jwt, { SignOptions } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'tu-secreto-super-seguro-cambialo-en-produccion';
const JWT_ACTIVATION_EXPIRES = process.env.JWT_ACTIVATION_EXPIRES || '24h'; // 24 horas para activar

export interface ActivationTokenPayload {
  userId: number;
  email: string;
  type: 'activation';
}

export class JwtUtil {
  /**
   * Genera un token de activación firmado
   */
  static generateActivationToken(userId: number, email: string): string {
    const payload: ActivationTokenPayload = {
      userId,
      email,
      type: 'activation',
    };

    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: '24h',
    });
  }

  /**
   * Verifica y decodifica un token de activación
   */
  static verifyActivationToken(token: string): ActivationTokenPayload {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as ActivationTokenPayload;
      
      if (decoded.type !== 'activation') {
        throw new Error('INVALID_TOKEN_TYPE');
      }

      return decoded;
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('TOKEN_EXPIRED');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new Error('INVALID_TOKEN');
      }
      throw error;
    }
  }
}

