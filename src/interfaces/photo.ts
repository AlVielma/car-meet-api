// DTOs para fotos
export interface CreatePhotoDto {
  url: string;
  type: 'PROFILE' | 'CAR' | 'EVENT';
  carId?: number;
  eventId?: number;
  caption?: string;
  isMain?: boolean;
}

export interface UpdatePhotoDto {
  caption?: string;
  isMain?: boolean;
}

// Tipos de respuesta
export interface PhotoResponse {
  id: number;
  url: string;
  type: string;
  carId: number | null;
  eventId: number | null;
  caption: string | null;
  isMain: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PhotoDetailResponse extends PhotoResponse {
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

// Configuración para subida de fotos
export interface PhotoUploadConfig {
  maxSize: number; // en bytes
  allowedTypes: string[];
  maxPhotosPerCar: number;
  maxPhotosPerEvent: number;
}

export const DEFAULT_PHOTO_CONFIG: PhotoUploadConfig = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  maxPhotosPerCar: 10,
  maxPhotosPerEvent: 50,
};

