import prisma from '../configs/database.js';
import { PasswordUtil } from '../utils/password.util.js';
import { JwtUtil } from '../utils/jwt.util.js';
import { EmailService } from './email.service.js';

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
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

export class AuthService {
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
    const { firstName, lastName, email, phone, password } = data;

    // Verificar si el email ya existe
    const emailInUse = await this.emailExists(email);
    if (emailInUse) {
      throw new Error('EMAIL_ALREADY_EXISTS');
    }

    // Obtener el rol por defecto
    const defaultRole = await this.getOrCreateDefaultRole();

    // Hashear la contraseña
    const hashedPassword = await PasswordUtil.hash(password);

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
}

