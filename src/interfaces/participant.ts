// DTOs para participantes de eventos
export interface CreateParticipantDto {
  eventId: number;
  carId: number;
  // userId se obtiene del token/sesión
}

export interface UpdateParticipantDto {
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
}

// Tipos de respuesta
export interface ParticipantResponse {
  id: number;
  eventId: number;
  userId: number;
  carId: number;
  status: string;
  registeredAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ParticipantDetailResponse extends ParticipantResponse {
  event: {
    id: number;
    name: string;
    date: Date;
    location: string;
  };
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  car: {
    id: number;
    brand: string;
    model: string;
    year: number;
    color: string;
  };
}

