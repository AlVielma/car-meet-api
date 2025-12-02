import prisma from '../configs/database.js';
import { Prisma } from '@prisma/client';

import type {
  CreateEventDto,
  UpdateEventDto,
  EventResponse,
  PaginatedEventsResponse
} from '../interfaces/event.js';

export class EventService {
  static async getAllEvents(
    page: number = 1,
    limit: number = 10,
    status?: string,
    organizerId?: number,
    upcoming?: boolean
  ): Promise<PaginatedEventsResponse> {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (organizerId) {
      where.organizerId = organizerId;
    }

    if (upcoming) {
      where.date = {
        gte: new Date(),
      };
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          description: true,
          location: true,
          date: true,
          startTime: true,
          endTime: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          organizer: {
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
            where: {
              type: 'EVENT',
            },
            orderBy: {
              isMain: 'desc',
            },
          },
          _count: {
            select: {
              participants: true,
            },
          },
        },
        orderBy: {
          date: 'asc',
        },
      }),
      prisma.event.count({ where }),
    ]);

    return {
      events,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  static async getEventById(id: number): Promise<EventResponse> {
    const event = await prisma.event.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        location: true,
        date: true,
        startTime: true,
        endTime: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        organizer: {
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
          where: {
            type: 'EVENT',
          },
          orderBy: {
            isMain: 'desc',
          },
        },
        _count: {
          select: {
            participants: true,
          },
        },
      },
    });

    if (!event) {
      throw new Error('EVENT_NOT_FOUND');
    }

    return event;
  }

  static async createEvent(data: CreateEventDto): Promise<EventResponse> {
    const { organizerId, name, description, location, date, startTime, endTime } = data;

    // Verificar que el organizador existe
    const organizerExists = await prisma.user.findUnique({
      where: { id: organizerId },
    });

    if (!organizerExists) {
      throw new Error('USER_NOT_FOUND');
    }

    const event = await prisma.event.create({
      data: {
        organizerId,
        name,
        description: description || null,
        location,
        date,
        startTime,
        endTime: endTime || null,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        description: true,
        location: true,
        date: true,
        startTime: true,
        endTime: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        organizer: {
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
          where: {
            type: 'EVENT',
          },
        },
        _count: {
          select: {
            participants: true,
          },
        },
      },
    });

    return event;
  }

  static async updateEvent(id: number, organizerId: number, data: UpdateEventDto): Promise<EventResponse> {
    const existingEvent = await prisma.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      throw new Error('EVENT_NOT_FOUND');
    }

    // Verificar que el evento pertenece al organizador
    // if (existingEvent.organizerId !== organizerId) {
    //   console.log(`⛔ Error de permisos: El usuario ${organizerId} intentó modificar el evento ${id}, pero el dueño es ${existingEvent.organizerId}`);
    //   throw new Error('UNAUTHORIZED');
    // }

    const updateData: any = {};

    if (data.name) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description || null;
    if (data.location) updateData.location = data.location;
    if (data.date) updateData.date = data.date;
    if (data.startTime) updateData.startTime = data.startTime;
    if (data.endTime !== undefined) updateData.endTime = data.endTime || null;
    if (data.status) updateData.status = data.status;

    const event = await prisma.event.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        description: true,
        location: true,
        date: true,
        startTime: true,
        endTime: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        organizer: {
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
          where: {
            type: 'EVENT',
          },
          orderBy: {
            isMain: 'desc',
          },
        },
        _count: {
          select: {
            participants: true,
          },
        },
      },
    });

    return event;
  }

  static async deleteEvent(id: number, organizerId: number): Promise<void> {
    const existingEvent = await prisma.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      throw new Error('EVENT_NOT_FOUND');
    }

    // Verificar que el evento pertenece al organizador
    // if (existingEvent.organizerId !== organizerId) {
    //   throw new Error('UNAUTHORIZED');
    // }

    await prisma.event.delete({
      where: { id },
    });
  }

  static async getUserEvents(userId: number): Promise<EventResponse[]> {
    const events = await prisma.event.findMany({
      where: { organizerId: userId },
      select: {
        id: true,
        name: true,
        description: true,
        location: true,
        date: true,
        startTime: true,
        endTime: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        organizer: {
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
          where: {
            type: 'EVENT',
          },
          orderBy: {
            isMain: 'desc',
          },
        },
        _count: {
          select: {
            participants: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    return events;
  }

  static async cancelEvent(id: number, organizerId: number): Promise<EventResponse> {
    const existingEvent = await prisma.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      throw new Error('EVENT_NOT_FOUND');
    }

    // if (existingEvent.organizerId !== organizerId) {
    //   console.log(`⛔ Error de permisos: El usuario ${organizerId} intentó cancelar el evento ${id}, pero el dueño es ${existingEvent.organizerId}`);
    //   throw new Error('UNAUTHORIZED');
    // }

    if (existingEvent.status === 'CANCELLED') {
      throw new Error('EVENT_ALREADY_CANCELLED');
    }

    if (existingEvent.status === 'FINISHED') {
      throw new Error('EVENT_ALREADY_FINISHED');
    }

    const event = await prisma.event.update({
      where: { id },
      data: { status: 'CANCELLED' },
      select: {
        id: true,
        name: true,
        description: true,
        location: true,
        date: true,
        startTime: true,
        endTime: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        organizer: {
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
          where: {
            type: 'EVENT',
          },
          orderBy: {
            isMain: 'desc',
          },
        },
        _count: {
          select: {
            participants: true,
          },
        },
      },
    });

    return event;
  }

  static async isOrganizer(userId: number, eventId: number): Promise<boolean> {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { organizerId: true }
    });

    return !!event && event.organizerId === userId;
  }

  static async participateInEvent(params: {
    userId: number;
    eventId: number;
    car: {
      brand: string;
      model: string;
      year: number;
      color: string;
      licensePlate?: string | null;
      description?: string | null;
      modifications?: string | null;
    };
    photoUrl?: string | null;
  }) {
    const { userId, eventId, car, photoUrl } = params;

    // Verificar que el evento existe y está activo
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      throw new Error('EVENT_NOT_FOUND');
    }

    if (event.status === 'CANCELLED') {
      throw new Error('EVENT_CANCELLED');
    }

    if (event.status === 'FINISHED') {
      throw new Error('EVENT_FINISHED');
    }

    // Verificar si el usuario ya está participando en este evento
    const existingParticipation = await prisma.eventParticipant.findFirst({
      where: {
        eventId,
        userId
      }
    });

    if (existingParticipation) {
      throw new Error('USER_ALREADY_PARTICIPATING');
    }

    try {
      const result = await prisma.$transaction(async (tx) => {
        // Crear el auto
        const createdCar = await tx.car.create({
          data: {
            userId,
            brand: car.brand,
            model: car.model,
            year: car.year,
            color: car.color,
            licensePlate: car.licensePlate ?? null,
            description: car.description ?? null,
            modifications: car.modifications ?? null
          }
        });

        // Si hay foto, crearla
        if (photoUrl) {
          await tx.photo.create({
            data: {
              url: photoUrl,
              type: 'CAR',
              carId: createdCar.id,
              isMain: true
            }
          });
        }

        // Crear la participación
        const participant = await tx.eventParticipant.create({
          data: {
            eventId,
            userId,
            carId: createdCar.id,
            status: 'PENDING'
          },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            },
            car: {
              include: {
                photos: {
                  where: { isMain: true },
                  take: 1
                }
              }
            }
          }
        });

        return participant;
      });

      return result;
    } catch (e: any) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new Error('DUPLICATE_PARTICIPATION');
        }
      }
      throw e;
    }
  }

  static async getEventParticipants(
    eventId: number,
    status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED'
  ) {
    const whereClause: any = { eventId };

    if (status) {
      whereClause.status = status;
    }

    return prisma.eventParticipant.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        car: {
          include: {
            photos: {
              where: { isMain: true },
              take: 1
            }
          }
        }
      }
    });
  }

  static async getParticipantById(participantId: number) {
    const participant = await prisma.eventParticipant.findUnique({
      where: { id: participantId },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            organizerId: true,
            location: true,
            date: true,
            startTime: true,
            endTime: true,
            status: true
          }
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            photos: {
              where: { type: 'PROFILE', isMain: true },
              take: 1
            }
          }
        },
        car: {
          include: {
            photos: true,
            comments: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true
                  }
                }
              }
            },
            votes: {
              include: {
                voter: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!participant) {
      throw new Error('PARTICIPANT_NOT_FOUND');
    }

    return participant;
  }

  static async updateParticipantStatus(
    participantId: number,
    status: 'CONFIRMED' | 'CANCELLED'
  ) {
    const participant = await prisma.eventParticipant.findUnique({
      where: { id: participantId }
    });

    if (!participant) {
      throw new Error('PARTICIPANT_NOT_FOUND');
    }

    return prisma.eventParticipant.update({
      where: { id: participantId },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        car: {
          include: {
            photos: {
              where: { isMain: true },
              take: 1
            }
          }
        }
      }
    });
  }

  static async getAllParticipants(params: {
    organizerId?: number;
    status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
    page?: number;
    limit?: number;
  }) {
    const { organizerId, status, page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    // Si se proporciona organizerId, filtrar por eventos del organizador
    if (organizerId) {
      whereClause.event = {
        organizerId
      };
    }

    // Filtrar por status si se proporciona
    if (status) {
      whereClause.status = status;
    }

    const [participants, total] = await Promise.all([
      prisma.eventParticipant.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          event: {
            select: {
              id: true,
              name: true,
              location: true,
              date: true,
              startTime: true,
              status: true,
              organizerId: true,
              organizer: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true
                }
              }
            }
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              photos: {
                where: { type: 'PROFILE', isMain: true },
                take: 1
              }
            }
          },
          car: {
            include: {
              photos: {
                where: { isMain: true },
                take: 1
              }
            }
          }
        }
      }),
      prisma.eventParticipant.count({ where: whereClause })
    ]);

    return {
      participants,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

}

