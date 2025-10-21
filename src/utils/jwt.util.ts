import jwt, { SignOptions } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'tu-secreto-super-seguro-cambialo-en-produccion';
const JWT_ACTIVATION_EXPIRES = process.env.JWT_ACTIVATION_EXPIRES || '24h'; // 24 horas para activar
const JWT_ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES || '7d'; // 7 días para acceso

export interface ActivationTokenPayload {
  userId: number;
  email: string;
  type: 'activation';
}

export interface AccessTokenPayload {
  userId: number;
  email: string;
  roleSlug: string;
  type: 'access';
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

  /**
   * Genera un token de acceso firmado
   */
  static generateAccessToken(userId: number, email: string, roleSlug: string): string {
    const payload: AccessTokenPayload = {
      userId,
      email,
      roleSlug,
      type: 'access',
    };

    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_ACCESS_EXPIRES,
    } as SignOptions);
  }

  /**
   * Verifica y decodifica un token de acceso
   */
  static verifyAccessToken(token: string): AccessTokenPayload {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AccessTokenPayload;
      
      if (decoded.type !== 'access') {
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

