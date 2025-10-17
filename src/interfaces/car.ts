// DTOs para operaciones con autos
export interface CreateCarDto {
  brand: string;
  model: string;
  year: number;
  color: string;
  licensePlate?: string;
  description?: string;
  modifications?: CarModifications;
}

export interface UpdateCarDto {
  brand?: string;
  model?: string;
  year?: number;
  color?: string;
  licensePlate?: string;
  description?: string;
  modifications?: CarModifications;
}

// Tipo para las modificaciones del auto (JSON)
export interface CarModifications {
  engine?: string;
  suspension?: string;
  exhaust?: string;
  wheels?: string;
  interior?: string;
  exterior?: string;
  other?: string[];
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
  modifications: CarModifications | null;
  createdAt: Date;
  updatedAt: Date;
  owner: CarOwner;
  photos: PhotoResponse[];
}

export interface CarOwner {
  id: number;
  firstName: string;
  lastName: string;
  profilePhoto: string | null;
}

export interface CarDetailResponse extends CarResponse {
  totalVotes: number;
  averageScore: number;
  participations: CarEventParticipation[];
}

interface CarEventParticipation {
  eventId: number;
  eventName: string;
  eventDate: Date;
  status: string;
}

interface PhotoResponse {
  id: number;
  url: string;
  isMain: boolean;
  caption: string | null;
}

