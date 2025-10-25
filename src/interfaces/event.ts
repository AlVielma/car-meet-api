// DTOs para operaciones con eventos
export interface CreateEventDto {
  organizerId: number;
  name: string;
  description?: string;
  location: string;
  date: Date;
  startTime: Date;
  endTime?: Date;
}

export interface UpdateEventDto {
  name?: string;
  description?: string;
  location?: string;
  date?: Date;
  startTime?: Date;
  endTime?: Date;
  status?: 'ACTIVE' | 'CANCELLED' | 'FINISHED';
}

// Tipos de respuesta
export interface EventResponse {
  id: number;
  name: string;
  description: string | null;
  location: string;
  date: Date;
  startTime: Date;
  endTime: Date | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  organizer: EventOrganizer;
  photos: EventPhotoResponse[];
  _count?: {
    participants: number;
  };
}

export interface EventOrganizer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  photos: {
    id: number;
    url: string;
    isMain: boolean;
  }[];
}

export interface EventPhotoResponse {
  id: number;
  url: string;
  caption: string | null;
  isMain: boolean;
}

export interface PaginatedEventsResponse {
  events: EventResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface EventDetailResponse extends EventResponse {
  totalParticipants: number;
  confirmedParticipants: number;
  pendingParticipants: number;
  participants: EventParticipantDetail[];
  photos: EventPhoto[];
  comments: EventComment[];
}

interface EventParticipantDetail {
  id: number;
  status: string;
  registeredAt: Date;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    profilePhoto: string | null;
  };
  car: {
    id: number;
    brand: string;
    model: string;
    year: number;
    photos: string[]; // URLs
  };
  votes?: number;
}

interface EventPhoto {
  id: number;
  url: string;
  caption: string | null;
  isMain: boolean;
  createdAt: Date;
}

interface EventComment {
  id: number;
  content: string;
  createdAt: Date;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    profilePhoto: string | null;
  };
}

// Tipos para estadísticas de eventos
export interface EventStatsResponse {
  eventId: number;
  eventName: string;
  totalParticipants: number;
  totalVotes: number;
  totalComments: number;
  topCars: TopCar[];
  categories: CategoryStats[];
}

interface TopCar {
  carId: number;
  brand: string;
  model: string;
  year: number;
  owner: string;
  totalVotes: number;
  averageScore: number;
}

interface CategoryStats {
  category: string;
  totalVotes: number;
  winner: {
    carId: number;
    brand: string;
    model: string;
    owner: string;
    score: number;
  };
}

