import prisma from '../configs/database.js';
import fs from 'fs';
import type { 
  CreateCarDto, 
  UpdateCarDto, 
  CarResponse, 
  PaginatedCarsResponse 
} from '../interfaces/car.js';

export class CarService {
  private static getFullUrl(path: string): string {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    if (cleanPath.startsWith('http')) return cleanPath;
    // Normalizar slashes para evitar problemas con rutas de Windows en URLs
    const normalizedPath = cleanPath.replace(/\\/g, '/');
    return `${baseUrl}/${normalizedPath}`;
  }

  private static mapCarToResponse(car: any): CarResponse {
    return {
      ...car,
      user: {
        ...car.user,
        photos: car.user.photos.map((photo: any) => ({
          ...photo,
          url: CarService.getFullUrl(photo.url)
        }))
      },
      photos: car.photos.map((photo: any) => ({
        ...photo,
        url: CarService.getFullUrl(photo.url)
      }))
    };
  }

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
              photos: {
                select: {
                  id: true,
                  url: true,
                  isMain: true,
                },
                where: {
                  type: 'PROFILE',
                },
                orderBy: {
                  isMain: 'desc',
                },
              },
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
      cars: cars.map(car => this.mapCarToResponse(car)),
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
            photos: {
              select: {
                id: true,
                url: true,
                isMain: true,
              },
              where: {
                type: 'PROFILE',
              },
              orderBy: {
                isMain: 'desc',
              },
            },
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

    return this.mapCarToResponse(car);
  }

  static async createCar(data: CreateCarDto): Promise<CarResponse> {
    const { userId, brand, model, year, color, licensePlate, description, modifications, photoPath } = data;

    // Verificar que el usuario existe
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      throw new Error('USER_NOT_FOUND');
    }

    // Usar una transacción para crear el auto y la foto si existe
    const car = await prisma.$transaction(async (tx) => {
      const newCar = await tx.car.create({
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
      });

      if (photoPath) {
        await tx.photo.create({
          data: {
            url: photoPath,
            type: 'CAR',
            carId: newCar.id,
            userId: userId,
            isMain: true,
          },
        });
      }

      return newCar;
    });

    // Obtener el auto completo con relaciones
    const fullCar = await prisma.car.findUnique({
      where: { id: car.id },
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
            photos: {
              select: {
                id: true,
                url: true,
                isMain: true,
              },
              where: {
                type: 'PROFILE',
              },
              orderBy: {
                isMain: 'desc',
              },
            },
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

    if (!fullCar) throw new Error('Error al recuperar el auto creado');

    return this.mapCarToResponse(fullCar);
  }

  static async updateCar(id: number, userId: number, data: UpdateCarDto): Promise<CarResponse> {
    const existingCar = await prisma.car.findUnique({
      where: { id },
      include: {
        photos: {
          where: { type: 'CAR', isMain: true }
        }
      }
    });

    if (!existingCar) {
      throw new Error('CAR_NOT_FOUND');
    }

    // Verificar que el auto pertenece al usuario
    if (existingCar.userId !== userId) {
      throw new Error('UNAUTHORIZED');
    }

    // Manejo de la foto del auto
    if (data.photoPath) {
      const currentPhoto = existingCar.photos[0];
      
      if (currentPhoto) {
        // Si existe una foto anterior, eliminar el archivo físico
        if (currentPhoto.url) {
          try {
            // Extraer la ruta relativa si es una URL completa
            const relativePath = currentPhoto.url.includes('http') 
              ? currentPhoto.url.split('/').slice(3).join('/') // Ajustar según estructura de URL
              : currentPhoto.url;

            // Intentar borrar solo si parece ser un archivo local
            if (!relativePath.startsWith('http') && fs.existsSync(relativePath)) {
              fs.unlinkSync(relativePath);
            } else if (fs.existsSync(currentPhoto.url)) {
               // Intento directo por si acaso se guardó la ruta relativa
               fs.unlinkSync(currentPhoto.url);
            }
          } catch (error) {
            console.error('Error al eliminar foto anterior del auto:', error);
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
            type: 'CAR',
            carId: id,
            userId: userId,
            isMain: true,
          }
        });
      }
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
            photos: {
              select: {
                id: true,
                url: true,
                isMain: true,
              },
              where: {
                type: 'PROFILE',
              },
              orderBy: {
                isMain: 'desc',
              },
            },
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

    return this.mapCarToResponse(car);
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
            photos: {
              select: {
                id: true,
                url: true,
                isMain: true,
              },
              where: {
                type: 'PROFILE',
              },
              orderBy: {
                isMain: 'desc',
              },
            },
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

    return cars.map(car => this.mapCarToResponse(car));
  }
}

