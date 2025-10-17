/**
 * Ejemplos de cómo importar con alias @ en TypeScript
 */

// ========================================
// 1. Importar tipos desde interfaces
// ========================================

// Importar múltiples tipos desde el barrel export
import { CreateUserDto, UserResponse, LoginDto } from '@/interfaces';

// Importar solo tipos (sin código en runtime)
import type { CarResponse, CreateCarDto } from '@/interfaces';

// Importar tipos de eventos
import type { 
  EventResponse, 
  EventDetailResponse, 
  CreateEventDto 
} from '@/interfaces';

// Importar constantes
import { VOTE_CATEGORIES, DEFAULT_PHOTO_CONFIG } from '@/interfaces';

// ========================================
// 2. Importar desde otros módulos
// ========================================

// Cuando crees tus controladores
// import { UserController } from '@/controllers/user-controller.js';

// Cuando crees middlewares
// import { authMiddleware } from '@/middlewares/auth.js';

// Cuando crees rutas
// import { userRoutes } from '@/routes/user-routes.js';

// Cuando crees utils
// import { hashPassword } from '@/utils/password.js';

// Desde configs
// import { db } from '@/configs/database.js';

// ========================================
// 3. Ejemplo de uso en un controlador
// ========================================

export class ExampleController {
  // Ejemplo de método que usa los tipos
  async createUser(data: CreateUserDto): Promise<UserResponse> {
    // Lógica aquí
    return {} as UserResponse; // Solo ejemplo
  }

  async login(credentials: LoginDto): Promise<{ token: string }> {
    // Lógica aquí
    return { token: 'example-token' };
  }

  async createEvent(data: CreateEventDto): Promise<EventResponse> {
    // Lógica aquí
    return {} as EventResponse; // Solo ejemplo
  }
}

// ========================================
// 4. Ejemplo de uso de constantes
// ========================================

export function getVoteCategories() {
  return Object.entries(VOTE_CATEGORIES).map(([key, label]) => ({
    key,
    label,
  }));
}

export function getPhotoConfig() {
  return DEFAULT_PHOTO_CONFIG;
}

// ========================================
// 5. Tipo genérico con PaginatedResponse
// ========================================

import type { PaginatedResponse } from '@/interfaces';

export async function getPaginatedUsers(
  page: number
): Promise<PaginatedResponse<UserResponse>> {
  // Lógica aquí
  return {
    data: [],
    pagination: {
      total: 0,
      page: 1,
      perPage: 10,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  };
}

