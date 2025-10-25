import prisma from '../configs/database.js';
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
    if (existingEvent.organizerId !== organizerId) {
      throw new Error('UNAUTHORIZED');
    }

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
    if (existingEvent.organizerId !== organizerId) {
      throw new Error('UNAUTHORIZED');
    }

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

    if (existingEvent.organizerId !== organizerId) {
      throw new Error('UNAUTHORIZED');
    }

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
}

