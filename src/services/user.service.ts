import prisma from '../configs/database.js';
import { PasswordUtil } from '../utils/password.util.js';
import { PhotoType } from '@prisma/client';
import fs from 'fs';

export interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  roleId?: number;
  photoPath?: string;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  roleId?: number;
  photoPath?: string;
}

export interface UserResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  role: {
    id: number;
    name: string;
    slug: string;
  };
  profilePhoto: string;
}

export interface PaginatedUsersResponse {
  users: UserResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export class UserService {
  private static getProfilePhotoUrl(photos: any[]): string {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const rawPhotoPath = photos && photos.length > 0 ? photos[0].url : 'public/defaults/default-profile.webp';
    const cleanPath = rawPhotoPath.startsWith('/') ? rawPhotoPath.substring(1) : rawPhotoPath;
    return `${baseUrl}/${cleanPath}`;
  }

  private static mapUserToResponse(user: any): UserResponse {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      role: user.role,
      profilePhoto: this.getProfilePhotoUrl(user.photos)
    };
  }

  static async getAllUsers(page: number = 1, limit: number = 10, isActive?: boolean): Promise<PaginatedUsersResponse> {
    const skip = (page - 1) * limit;
    
    const where = isActive !== undefined ? { isActive } : {};
    
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
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
          }
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users: users.map(user => this.mapUserToResponse(user)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  static async getUserById(id: number): Promise<UserResponse> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
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
        }
      },
    });

    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    return this.mapUserToResponse(user);
  }

  static async createUser(data: CreateUserData): Promise<UserResponse> {
    const { firstName, lastName, email, phone, password, roleId, photoPath } = data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('EMAIL_ALREADY_EXISTS');
    }

    let finalRoleId = roleId;
    if (!finalRoleId) {
      const defaultRole = await prisma.role.findUnique({
        where: { slug: 'user' },
      });
      
      if (!defaultRole) {
        const createdRole = await prisma.role.create({
          data: {
            name: 'Usuario',
            slug: 'user',
            description: 'Rol de usuario estándar',
          },
        });
        finalRoleId = createdRole.id;
      } else {
        finalRoleId = defaultRole.id;
      }
    }

    const hashedPassword = await PasswordUtil.hash(password);
    const finalPhotoPath = photoPath || 'public/defaults/default-profile.webp';

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        phone: phone || null,
        password: hashedPassword,
        roleId: finalRoleId,
        isActive: true,
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
        updatedAt: true,
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
        }
      },
    });

    return this.mapUserToResponse(user);
  }

  static async updateUser(id: number, data: UpdateUserData): Promise<UserResponse> {
    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: {
        photos: {
          where: { type: PhotoType.PROFILE, isMain: true }
        }
      }
    });

    if (!existingUser) {
      throw new Error('USER_NOT_FOUND');
    }

    if (data.email && data.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (emailExists) {
        throw new Error('EMAIL_ALREADY_EXISTS');
      }
    }

    // Manejo de la foto de perfil
    if (data.photoPath) {
      const currentPhoto = existingUser.photos[0];
      
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
            userId: id
          }
        });
      }
    }

    const updateData: any = {};
    
    if (data.firstName) updateData.firstName = data.firstName;
    if (data.lastName) updateData.lastName = data.lastName;
    if (data.email) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone || null;
    if (data.roleId) updateData.roleId = data.roleId;
    
    if (data.password) {
      updateData.password = await PasswordUtil.hash(data.password);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
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
        }
      },
    });

    return this.mapUserToResponse(user);
  }

  static async activateUser(id: number): Promise<UserResponse> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    if (user.isActive) {
      throw new Error('USER_ALREADY_ACTIVE');
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
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
        }
      },
    });

    return this.mapUserToResponse(updatedUser);
  }

  static async deactivateUser(id: number): Promise<UserResponse> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    if (!user.isActive) {
      throw new Error('USER_ALREADY_INACTIVE');
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
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
        }
      },
    });

    return this.mapUserToResponse(updatedUser);
  }

  static async toggleUserStatus(id: number): Promise<UserResponse> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
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
        }
      },
    });

    return this.mapUserToResponse(updatedUser);
  }
}

