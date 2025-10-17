// Tipos comunes y compartidos

// Respuesta paginada genérica
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Parámetros de paginación
export interface PaginationParams {
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Respuesta de API estándar
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: ErrorDetail;
}

export interface ErrorDetail {
  code: string;
  message: string;
  details?: any;
}

// Filtros comunes
export interface DateRangeFilter {
  startDate?: string;
  endDate?: string;
}

export interface SearchFilter {
  search?: string;
  fields?: string[];
}

// Tipos para validación
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// Query params comunes
export interface BaseQueryParams extends PaginationParams, SearchFilter {
  filter?: Record<string, any>;
}

// Tipos para archivos subidos
export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
}

// Tipos para respuestas de operaciones
export interface OperationResponse {
  success: boolean;
  message: string;
  affectedRows?: number;
}

// Tipos para estadísticas generales
export interface DashboardStats {
  totalUsers: number;
  totalCars: number;
  totalEvents: number;
  activeEvents: number;
  upcomingEvents: number;
  finishedEvents: number;
  recentActivity: ActivityItem[];
}

interface ActivityItem {
  id: number;
  type: 'USER_REGISTERED' | 'CAR_ADDED' | 'EVENT_CREATED' | 'EVENT_PARTICIPATION';
  description: string;
  timestamp: Date;
  user?: {
    id: number;
    name: string;
  };
}

