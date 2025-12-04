import prisma from '../configs/database.js';
import { PasswordUtil } from '../utils/password.util.js';
import { JwtUtil } from '../utils/jwt.util.js';
import { EmailService } from './email.service.js';
import { PhotoType } from '@prisma/client';
import fs from 'fs';

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

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  photoPath?: string;
}

export interface UserProfileResponse {
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
  profilePhoto: string;
  totalEvents: number;
  totalCars: number;
  totalVotes: number;
  totalPhotos: number;
  recentActivity: {
    type: string;
    title: string;
    date: Date;
  }[];
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
      throw new Error('EMAIL_ALREADY_EXISTS');
    }

    // Obtener el rol por defecto
    const defaultRole = await this.getOrCreateDefaultRole();

    // Hashear la contraseña
    const hashedPassword = await PasswordUtil.hash(password);

    const finalPhotoPath = photoPath || 'public/defaults/default-profile.webp';

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
   * Actualiza el perfil del usuario autenticado
   */
  static async updateProfile(userId: number, data: UpdateProfileData): Promise<UserProfileResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        photos: {
          where: { type: PhotoType.PROFILE, isMain: true }
        }
      }
    });

    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    // Manejo de la foto de perfil
    if (data.photoPath) {
      const currentPhoto = user.photos[0];
      
      if (currentPhoto) {
        // Si existe una foto anterior y no es la por defecto, eliminar el archivo físico
        if (currentPhoto.url && !currentPhoto.url.includes('defaults/')) {
          try {
            if (fs.existsSync(currentPhoto.url)) {
              fs.unlinkSync(currentPhoto.url);
            }
          } catch (error) {
            console.error('Error al eliminar foto anterior:', error);
          }
        }

        // Actualizar el registro de la foto
        await prisma.photo.update({
          where: { id: currentPhoto.id },
          data: { url: data.photoPath }
        });
      } else {
        // Si no tenía foto, crear una nueva
        await prisma.photo.create({
          data: {
            url: data.photoPath,
            type: PhotoType.PROFILE,
            isMain: true,
            userId: userId
          }
        });
      }
    }

    const updateData: any = {};
    
    if (data.firstName) updateData.firstName = data.firstName;
    if (data.lastName) updateData.lastName = data.lastName;
    if (data.phone !== undefined) updateData.phone = data.phone || null;
    
    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    // Devolver el perfil actualizado usando el método existente
    return this.getCurrentUser(userId);
  }

  /**
   * Obtiene los datos del usuario actual por ID con estadísticas y actividad
   */
  static async getCurrentUser(userId: number): Promise<UserProfileResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        photos: {
          where: { type: PhotoType.PROFILE, isMain: true },
          take: 1,
          select: { url: true }
        },
        _count: {
          select: {
            organizedEvents: true,
            participations: true,
            cars: true,
            votes: true,
            photos: true
          }
        }
      },
    });

    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    if (!user.isActive) {
      throw new Error('ACCOUNT_NOT_ACTIVATED');
    }

    // Obtener actividad reciente (últimos 5 de cada tipo)
    const [recentParticipations, recentVotes, recentCars] = await Promise.all([
      prisma.eventParticipant.findMany({
        where: { userId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { event: { select: { name: true } } }
      }),
      prisma.vote.findMany({
        where: { voterId: userId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { car: { select: { brand: true, model: true } } }
      }),
      prisma.car.findMany({
        where: { userId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { brand: true, model: true, createdAt: true }
      })
    ]);

    // Combinar y ordenar actividades
    const activities = [
      ...recentParticipations.map(p => ({
        type: 'event',
        title: `Te uniste al evento ${p.event.name}`,
        date: p.createdAt
      })),
      ...recentVotes.map(v => ({
        type: 'vote',
        title: `Votaste por ${v.car.brand} ${v.car.model}`,
        date: v.createdAt
      })),
      ...recentCars.map(c => ({
        type: 'car',
        title: `Agregaste un ${c.brand} ${c.model}`,
        date: c.createdAt
      }))
    ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 10);

    // Determinar foto de perfil y construir URL completa
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const rawPhotoPath = user.photos[0]?.url || 'public/defaults/default-profile.webp';
    // Asegurar que la ruta no empiece con / para evitar doble slash
    const cleanPath = rawPhotoPath.startsWith('/') ? rawPhotoPath.substring(1) : rawPhotoPath;
    const profilePhoto = `${baseUrl}/${cleanPath}`;

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      isActive: user.isActive,
      createdAt: user.createdAt,
      role: user.role,
      profilePhoto,
      totalEvents: user._count.organizedEvents + user._count.participations,
      totalCars: user._count.cars,
      totalVotes: user._count.votes,
      totalPhotos: user._count.photos,
      recentActivity: activities
    };
  }
}

