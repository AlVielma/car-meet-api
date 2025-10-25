import { Router } from 'express';
import { EventController } from '../controllers/event.controller.js';
import { 
  createEventValidator, 
  updateEventValidator, 
  eventIdValidator,
  getEventsValidator
} from '../middlewares/validators/event.validator.js';
import { AuthMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

// Obtener todos los eventos con filtros opcionales (público)
router.get('/', getEventsValidator, EventController.getAllEvents);

// Obtener eventos del usuario autenticado
router.get('/my-events', AuthMiddleware.authenticate, EventController.getUserEvents);

// Obtener un evento por ID (público)
router.get('/:id', eventIdValidator, EventController.getEventById);

// Crear un evento (requiere autenticación)
router.post('/', AuthMiddleware.authenticate, createEventValidator, EventController.createEvent);

// Actualizar un evento (requiere autenticación y ser organizador)
router.put('/:id', AuthMiddleware.authenticate, updateEventValidator, EventController.updateEvent);

// Cancelar un evento (requiere autenticación y ser organizador)
router.patch('/:id/cancel', AuthMiddleware.authenticate, eventIdValidator, EventController.cancelEvent);

// Eliminar un evento (requiere autenticación y ser organizador)
router.delete('/:id', AuthMiddleware.authenticate, eventIdValidator, EventController.deleteEvent);

export default router;

