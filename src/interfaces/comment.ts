// DTOs para comentarios
export interface CreateCommentDto {
  content: string;
  carId?: number;
  eventId?: number;
  // userId se obtiene del token/sesión
}

export interface UpdateCommentDto {
  content: string;
}

// Tipos de respuesta
export interface CommentResponse {
  id: number;
  userId: number;
  carId: number | null;
  eventId: number | null;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  user: CommentUser;
}

interface CommentUser {
  id: number;
  firstName: string;
  lastName: string;
  profilePhoto: string | null;
}

export interface CommentDetailResponse extends CommentResponse {
  car?: {
    id: number;
    brand: string;
    model: string;
    year: number;
  };
  event?: {
    id: number;
    name: string;
    date: Date;
  };
}

