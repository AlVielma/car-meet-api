/**
 * Barrel export - Exportación centralizada de todas las interfaces y tipos
 * 
 * @example
 * // Importar múltiples tipos
 * import { CreateUserDto, UserResponse, CarResponse } from '@/interfaces';
 * 
 * @example
 * // Importar solo tipos (mejor rendimiento, no genera código en runtime)
 * import type { EventResponse, VoteResponse } from '@/interfaces';
 * 
 * @example
 * // Importar constantes
 * import { VOTE_CATEGORIES, DEFAULT_PHOTO_CONFIG } from '@/interfaces';
 */

// ============================================
// Core Entities
// ============================================
export * from './user.js';
export * from './car.js';
export * from './event.js';

// ============================================
// Relations & Interactions
// ============================================
export * from './participant.js';
export * from './vote.js';
export * from './comment.js';
export * from './photo.js';

// ============================================
// Common Types & Utilities
// ============================================
export * from './common.js';

