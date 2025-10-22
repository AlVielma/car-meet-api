import prisma from '../configs/database.js';
import type { 
  CreateCarDto, 
  UpdateCarDto, 
  CarResponse, 
  PaginatedCarsResponse 
} from '../interfaces/car.js';

export class CarService {
  static async getAllCars(
    page: number = 1, 
    limit: number = 10, 
    userId?: number,
    brand?: string,
    year?: number
  ): Promise<PaginatedCarsResponse> {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    
    if (userId) {
      where.userId = userId;
    }
    
    if (brand) {
      where.brand = {
        contains: brand,
        mode: 'insensitive'
      };
    }
    
    if (year) {
      where.year = year;
    }
    
    const [cars, total] = await Promise.all([
      prisma.car.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          userId: true,
          brand: true,
          model: true,
          year: true,
          color: true,
          licensePlate: true,
          description: true,
          modifications: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              profilePhoto: true,
            },
          },
          photos: {
            select: {
              id: true,
              url: true,
              caption: true,
              isMain: true,
            },
            orderBy: {
              isMain: 'desc',
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.car.count({ where }),
    ]);

    return {
      cars,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  static async getCarById(id: number): Promise<CarResponse> {
    const car = await prisma.car.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        brand: true,
        model: true,
        year: true,
        color: true,
        licensePlate: true,
        description: true,
        modifications: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profilePhoto: true,
          },
        },
        photos: {
          select: {
            id: true,
            url: true,
            caption: true,
            isMain: true,
          },
          orderBy: {
            isMain: 'desc',
          },
        },
      },
    });

    if (!car) {
      throw new Error('CAR_NOT_FOUND');
    }

    return car;
  }

  static async createCar(data: CreateCarDto): Promise<CarResponse> {
    const { userId, brand, model, year, color, licensePlate, description, modifications } = data;

    // Verificar que el usuario existe
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      throw new Error('USER_NOT_FOUND');
    }

    const car = await prisma.car.create({
      data: {
        userId,
        brand,
        model,
        year,
        color,
        licensePlate: licensePlate || null,
        description: description || null,
        modifications: modifications || null,
      },
      select: {
        id: true,
        userId: true,
        brand: true,
        model: true,
        year: true,
        color: true,
        licensePlate: true,
        description: true,
        modifications: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profilePhoto: true,
          },
        },
        photos: {
          select: {
            id: true,
            url: true,
            caption: true,
            isMain: true,
          },
        },
      },
    });

    return car;
  }

  static async updateCar(id: number, userId: number, data: UpdateCarDto): Promise<CarResponse> {
    const existingCar = await prisma.car.findUnique({
      where: { id },
    });

    if (!existingCar) {
      throw new Error('CAR_NOT_FOUND');
    }

    // Verificar que el auto pertenece al usuario
    if (existingCar.userId !== userId) {
      throw new Error('UNAUTHORIZED');
    }

    const updateData: any = {};
    
    if (data.brand) updateData.brand = data.brand;
    if (data.model) updateData.model = data.model;
    if (data.year) updateData.year = data.year;
    if (data.color) updateData.color = data.color;
    if (data.licensePlate !== undefined) updateData.licensePlate = data.licensePlate || null;
    if (data.description !== undefined) updateData.description = data.description || null;
    if (data.modifications !== undefined) updateData.modifications = data.modifications || null;

    const car = await prisma.car.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        userId: true,
        brand: true,
        model: true,
        year: true,
        color: true,
        licensePlate: true,
        description: true,
        modifications: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profilePhoto: true,
          },
        },
        photos: {
          select: {
            id: true,
            url: true,
            caption: true,
            isMain: true,
          },
          orderBy: {
            isMain: 'desc',
          },
        },
      },
    });

    return car;
  }

  static async deleteCar(id: number, userId: number): Promise<void> {
    const existingCar = await prisma.car.findUnique({
      where: { id },
    });

    if (!existingCar) {
      throw new Error('CAR_NOT_FOUND');
    }

    // Verificar que el auto pertenece al usuario
    if (existingCar.userId !== userId) {
      throw new Error('UNAUTHORIZED');
    }

    await prisma.car.delete({
      where: { id },
    });
  }

  static async getUserCars(userId: number): Promise<CarResponse[]> {
    const cars = await prisma.car.findMany({
      where: { userId },
      select: {
        id: true,
        userId: true,
        brand: true,
        model: true,
        year: true,
        color: true,
        licensePlate: true,
        description: true,
        modifications: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profilePhoto: true,
          },
        },
        photos: {
          select: {
            id: true,
            url: true,
            caption: true,
            isMain: true,
          },
          orderBy: {
            isMain: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return cars;
  }
}

