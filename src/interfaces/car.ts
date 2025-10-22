// DTOs para operaciones con autos
export interface CreateCarDto {
  userId: number;
  brand: string;
  model: string;
  year: number;
  color: string;
  licensePlate?: string;
  description?: string;
  modifications?: string;
}

export interface UpdateCarDto {
  brand?: string;
  model?: string;
  year?: number;
  color?: string;
  licensePlate?: string;
  description?: string;
  modifications?: string;
}

// Tipos de respuesta
export interface CarResponse {
  id: number;
  userId: number;
  brand: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string | null;
  description: string | null;
  modifications: string | null;
  createdAt: Date;
  updatedAt: Date;
  user: CarOwner;
  photos: CarPhotoResponse[];
}

export interface CarOwner {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  profilePhoto: string | null;
}

export interface CarPhotoResponse {
  id: number;
  url: string;
  isMain: boolean;
  caption: string | null;
}

export interface CarDetailResponse extends CarResponse {
  totalVotes: number;
  averageScore: number;
  participations: CarEventParticipation[];
}

export interface CarEventParticipation {
  eventId: number;
  eventName: string;
  eventDate: Date;
  status: string;
}

export interface PaginatedCarsResponse {
  cars: CarResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

