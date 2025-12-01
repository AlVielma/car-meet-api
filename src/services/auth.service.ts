import prisma from '../configs/database.js';
import { PasswordUtil } from '../utils/password.util.js';
import { JwtUtil } from '../utils/jwt.util.js';
import { EmailService } from './email.service.js';
import { PhotoType } from '@prisma/client';

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  photoPath?: string | undefined;
}

export interface RegisterResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  createdAt: Date;
  role: {
    id: number;
    name: string;
    slug: string;
  };
}

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: RegisterResponse;
  token: string;
  expiresIn: number; // En segundos
}

export interface LoginStep1Response {
  message: string;
  email: string;
}

export interface VerifyCodeData {
  email: string;
  code: string;
}

export interface VerifyCodeResponse {
  user: RegisterResponse;
  token: string;
  expiresIn: number;
}

export interface ResendCodeData {
  email: string;
}

export interface ResendCodeResponse {
  message: string;
  email: string;
}

export class AuthService {
  /**
   * Genera un código de verificación de 6 dígitos
   */
  private static generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Convierte formato de tiempo (ej: "7d", "1h", "30m") a segundos
   */
  private static parseTimeToSeconds(timeString: string): number {
    const timeRegex = /^(\d+)([smhd])$/;
    const match = timeString.match(timeRegex);
    
    if (!match || !match[1] || !match[2]) {
      // Si no puede parsear, asume que son días por defecto
      return 7 * 24 * 60 * 60; // 7 días en segundos
    }
    
    const amount = match[1];
    const unit = match[2];
    const numAmount = parseInt(amount, 10);
    
    switch (unit) {
      case 's': return numAmount; // segundos
      case 'm': return numAmount * 60; // minutos a segundos
      case 'h': return numAmount * 60 * 60; // horas a segundos
      case 'd': return numAmount * 24 * 60 * 60; // días a segundos
      default: return 7 * 24 * 60 * 60; // 7 días por defecto
    }
  }

  /**
   * Verifica si un email ya está registrado
   */
  static async emailExists(email: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    return !!user;
  }

  /**
   * Obtiene o crea el rol por defecto (user)
   */
  private static async getOrCreateDefaultRole() {
    let defaultRole = await prisma.role.findUnique({
      where: { slug: 'user' },
    });

    if (!defaultRole) {
      defaultRole = await prisma.role.create({
        data: {
          name: 'Usuario',
          slug: 'user',
          description: 'Rol de usuario estándar',
        },
      });
    }

    return defaultRole;
  }

  /**
   * Registra un nuevo usuario en el sistema
   */
  static async register(data: RegisterData): Promise<RegisterResponse> {
    const { firstName, lastName, email, phone, password, photoPath } = data;

    // Verificar si el email ya existe
    const emailInUse = await this.emailExists(email);
    if (emailInUse) {
      // Si ya existe el email y se subió una foto, deberíamos borrarla (esto idealmente se maneja en el controlador o aquí si pasamos el path)
      // Pero como el controlador maneja la respuesta de error, dejaremos que el archivo quede huérfano o lo manejamos mejor después.
      // Una mejor práctica sería borrar el archivo aquí si lanzamos error, pero necesitamos 'fs'.
      // Por simplicidad, asumimos que el controlador maneja la limpieza si falla, pero aquí lanzamos excepción.
      // El controlador catch block debería limpiar si hay req.file.
      throw new Error('EMAIL_ALREADY_EXISTS');
    }

    // Obtener el rol por defecto
    const defaultRole = await this.getOrCreateDefaultRole();

    // Hashear la contraseña
    const hashedPassword = await PasswordUtil.hash(password);

    // Definir ruta de la foto (usar la subida o la por defecto)
    const finalPhotoPath = photoPath || 'uploads/defaults/default-profile.webp';

    // Crear el usuario
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        phone: phone || null,
        password: hashedPassword,
        roleId: defaultRole.id,
        isActive: false, // Por defecto inactivo
        photos: {
          create: {
            url: finalPhotoPath,
            type: PhotoType.PROFILE,
            isMain: true
          }
        }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        isActive: true,
        createdAt: true,
        role: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    // Generar token de activación
    const activationToken = JwtUtil.generateActivationToken(user.id, user.email);
    
    // Construir URL de activación
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const activationUrl = `${baseUrl}/api/auth/activate/${activationToken}`;
    
    // Enviar correo de activación (no bloqueante, se ejecuta en segundo plano)
    EmailService.sendActivationEmail(
      user.email,
      `${user.firstName} ${user.lastName}`,
      activationUrl
    ).catch((error) => {
      console.error('Error al enviar correo de activación:', error);
    });

    return user;
  }

  /**
   * Activa la cuenta de un usuario mediante el token
   */
  static async activateAccount(token: string): Promise<RegisterResponse> {
    // Verificar el token
    const payload = JwtUtil.verifyActivationToken(token);

    // Buscar el usuario
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        isActive: true,
        createdAt: true,
        role: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    if (user.email !== payload.email) {
      throw new Error('INVALID_TOKEN');
    }

    if (user.isActive) {
      throw new Error('ACCOUNT_ALREADY_ACTIVE');
    }

    // Activar la cuenta
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { isActive: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        isActive: true,
        createdAt: true,
        role: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    // Enviar correo de confirmación de activación
    EmailService.sendActivationSuccessEmail(
      updatedUser.email,
      `${updatedUser.firstName} ${updatedUser.lastName}`
    ).catch((error) => {
      console.error('Error al enviar correo de confirmación:', error);
    });

    return updatedUser;
  }

  /**
   * Primer paso del login: verifica credenciales y envía código de verificación
   */
  static async loginStep1(data: LoginData): Promise<LoginStep1Response> {
    const { email, password } = data;

    // Buscar el usuario por email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        password: true,
        isActive: true,
        createdAt: true,
        role: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('INVALID_CREDENTIALS');
    }

    // Verificar si la cuenta está activa
    if (!user.isActive) {
      throw new Error('ACCOUNT_NOT_ACTIVATED');
    }

    // Verificar la contraseña
    const isPasswordValid = await PasswordUtil.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('INVALID_CREDENTIALS');
    }

    // Generar código de verificación de 6 dígitos
    const verificationCode = this.generateVerificationCode();
    const hashedCode = await PasswordUtil.hash(verificationCode);
    
    // Calcular tiempo de expiración (5 minutos)
    const codeExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Guardar el código hasheado y tiempo de expiración en la base de datos
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationCode: hashedCode,
        codeExpiresAt: codeExpiresAt,
      },
    });

    // Enviar código por email (no bloqueante)
    EmailService.sendVerificationCode(
      user.email,
      `${user.firstName} ${user.lastName}`,
      verificationCode
    ).catch((error) => {
      console.error('Error al enviar código de verificación:', error);
    });

    return {
      message: 'Código de verificación enviado a tu correo electrónico',
      email: user.email,
    };
  }

  /**
   * Segundo paso del login: verifica el código y genera el token
   */
  static async verifyCode(data: VerifyCodeData): Promise<VerifyCodeResponse> {
    const { email, code } = data;

    // Buscar el usuario por email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        password: true,
        isActive: true,
        verificationCode: true,
        codeExpiresAt: true,
        createdAt: true,
        role: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('INVALID_CREDENTIALS');
    }

    // Verificar si la cuenta está activa
    if (!user.isActive) {
      throw new Error('ACCOUNT_NOT_ACTIVATED');
    }

    // Verificar si existe un código de verificación
    if (!user.verificationCode || !user.codeExpiresAt) {
      throw new Error('NO_VERIFICATION_CODE');
    }

    // Verificar si el código ha expirado
    if (new Date() > user.codeExpiresAt) {
      // Limpiar el código expirado
      await prisma.user.update({
        where: { id: user.id },
        data: {
          verificationCode: null,
          codeExpiresAt: null,
        },
      });
      throw new Error('VERIFICATION_CODE_EXPIRED');
    }

    // Verificar el código
    const isCodeValid = await PasswordUtil.compare(code, user.verificationCode);
    if (!isCodeValid) {
      throw new Error('INVALID_VERIFICATION_CODE');
    }

    // Limpiar el código de verificación después de uso exitoso
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationCode: null,
        codeExpiresAt: null,
      },
    });

    // Generar token de acceso
    const token = JwtUtil.generateAccessToken(user.id, user.email, user.role.slug);

    // Crear respuesta sin la contraseña y código
    const { password: _, verificationCode: __, codeExpiresAt: ___, ...userWithoutSensitiveData } = user;

    // Obtener el tiempo de expiración configurado y convertir a segundos
    const expiresInString = process.env.JWT_ACCESS_EXPIRES || '7d';
    const expiresIn = this.parseTimeToSeconds(expiresInString);

    return {
      user: userWithoutSensitiveData,
      token,
      expiresIn,
    };
  }

  /**
   * Reenvía un código de verificación para un usuario
   */
  static async resendVerificationCode(data: ResendCodeData): Promise<ResendCodeResponse> {
    const { email } = data;

    // Buscar el usuario por email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        isActive: true,
        verificationCode: true,
        codeExpiresAt: true,
      },
    });

    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    // Verificar si la cuenta está activa
    if (!user.isActive) {
      throw new Error('ACCOUNT_NOT_ACTIVATED');
    }

    // Verificar si ya hay un código pendiente y si no ha expirado
    if (user.verificationCode && user.codeExpiresAt && new Date() < user.codeExpiresAt) {
      // Calcular tiempo restante
      const timeRemaining = Math.ceil((user.codeExpiresAt.getTime() - new Date().getTime()) / 1000 / 60);
      throw new Error(`CODE_ALREADY_SENT: Debes esperar ${timeRemaining} minutos antes de solicitar un nuevo código`);
    }

    // Generar nuevo código de verificación de 6 dígitos
    const verificationCode = this.generateVerificationCode();
    const hashedCode = await PasswordUtil.hash(verificationCode);
    
    // Calcular tiempo de expiración (5 minutos)
    const codeExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Guardar el nuevo código hasheado y tiempo de expiración en la base de datos
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationCode: hashedCode,
        codeExpiresAt: codeExpiresAt,
      },
    });

    // Enviar código por email (no bloqueante)
    EmailService.sendVerificationCode(
      user.email,
      `${user.firstName} ${user.lastName}`,
      verificationCode
    ).catch((error) => {
      console.error('Error al reenviar código de verificación:', error);
    });

    return {
      message: 'Nuevo código de verificación enviado a tu correo electrónico',
      email: user.email,
    };
  }

  /**
   * Obtiene los datos del usuario actual por ID
   */
  static async getCurrentUser(userId: number): Promise<RegisterResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        isActive: true,
        createdAt: true,
        role: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    if (!user.isActive) {
      throw new Error('ACCOUNT_NOT_ACTIVATED');
    }

    return user;
  }
}

