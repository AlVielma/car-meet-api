// DTOs para votos
export interface CreateVoteDto {
  eventId: number;
  carId: number;
  category: string;
  score: number; // 1-10
  // voterId se obtiene del token/sesión
}

export interface UpdateVoteDto {
  score: number;
}

// Tipos de respuesta
export interface VoteResponse {
  id: number;
  eventId: number;
  carId: number;
  voterId: number;
  category: string;
  score: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface VoteDetailResponse extends VoteResponse {
  event: {
    id: number;
    name: string;
  };
  car: {
    id: number;
    brand: string;
    model: string;
    year: number;
  };
  voter: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

// Tipos para resultados de votación
export interface VoteResultsResponse {
  eventId: number;
  carId: number;
  car: {
    brand: string;
    model: string;
    year: number;
    owner: string;
  };
  categories: CategoryResult[];
  totalVotes: number;
  averageScore: number;
}

interface CategoryResult {
  category: string;
  votes: number;
  totalScore: number;
  averageScore: number;
}

// Categorías predefinidas de votación
export const VOTE_CATEGORIES = {
  BEST_SOUND: 'Mejor Sonido',
  BEST_EXTERIOR: 'Mejor Exterior',
  BEST_INTERIOR: 'Mejor Interior',
  BEST_WHEELS: 'Mejores Rines',
  BEST_PAINT: 'Mejor Pintura',
  BEST_PERFORMANCE: 'Mejor Performance',
  BEST_IN_SHOW: 'Mejor del Show',
  CLEANEST: 'Más Limpio',
} as const;

