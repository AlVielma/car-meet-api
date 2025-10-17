// DTOs para operaciones con usuarios
export interface CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  roleId?: number; // Opcional, por defecto será USER
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  phone?: string;
  profilePhoto?: string;
  isActive?: boolean;
}

export interface LoginDto {
  email: string;
  password: string;
}

// Tipos de respuesta (sin datos sensibles)
export interface UserResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  profilePhoto: string | null;
  isActive: boolean;
  role: RoleResponse;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoleResponse {
  id: number;
  name: string;
  slug: string;
  description: string | null;
}

export interface AuthResponse {
  user: UserResponse;
  token: string;
}

// Tipos para perfiles de usuario
export interface UserProfileResponse extends UserResponse {
  cars: CarSummary[];
  eventsOrganized: EventSummary[];
  totalParticipations: number;
}

interface CarSummary {
  id: number;
  brand: string;
  model: string;
  year: number;
  color: string;
}

interface EventSummary {
  id: number;
  name: string;
  date: Date;
  location: string;
  status: string;
}

