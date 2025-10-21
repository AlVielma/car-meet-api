import prisma from '../configs/database.js';
import { PasswordUtil } from '../utils/password.util.js';

export interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  roleId?: number;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  roleId?: number;
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
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
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
      },
    });

    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    return user;
  }

  static async createUser(data: CreateUserData): Promise<UserResponse> {
    const { firstName, lastName, email, phone, password, roleId } = data;

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

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        phone: phone || null,
        password: hashedPassword,
        roleId: finalRoleId,
        isActive: true,
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
      },
    });

    return user;
  }

  static async updateUser(id: number, data: UpdateUserData): Promise<UserResponse> {
    const existingUser = await prisma.user.findUnique({
      where: { id },
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
      },
    });

    return user;
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
      },
    });

    return updatedUser;
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
      },
    });

    return updatedUser;
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
      },
    });

    return updatedUser;
  }
}

