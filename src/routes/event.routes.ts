import { Router, Request, Response } from 'express';
import { EventController } from '../controllers/event.controller.js';
import {
  createEventValidator,
  updateEventValidator,
  eventIdValidator,
  getEventsValidator,
  participateEventValidator,
  listParticipantsValidator,
  participantIdValidator,
  updateParticipantStatusValidator
} from '../middlewares/validators/event.validator.js';
import { AuthMiddleware } from '../middlewares/auth.middleware.js';
import { uploadProfilePhoto, resizeProfilePhoto } from '../middlewares/upload.middleware.js';

const router = Router();

// Endpoint temporal para debug (eliminar después)
router.get('/debug/me', AuthMiddleware.authenticate, (req: Request, res: Response) => {
  const user = (req as any).user;
  return res.json({
    success: true,
    user: user,
    userId: user?.id,
    userType: typeof user?.id
  });
});

// Obtener todos los eventos con filtros opcionales (público)
router.get('/', getEventsValidator, EventController.getAllEvents);

// Obtener eventos del usuario autenticado
router.get('/my-events', AuthMiddleware.authenticate, EventController.getUserEvents);

// Obtener todos los participantes pendientes
router.get('/participants/pending',AuthMiddleware.authenticate,EventController.getAllParticipants);

// Obtener un evento por ID (público)
router.get('/:id', eventIdValidator, EventController.getEventById);

// Listar participantes de un evento
router.get('/:id/participants', listParticipantsValidator, EventController.getEventParticipants);

// Obtener información detallada de un participante
router.get('/:id/participants/:participantId',AuthMiddleware.authenticate,participantIdValidator,EventController.getParticipantById);

// Crear un evento (requiere autenticación)
router.post('/', AuthMiddleware.authenticate, createEventValidator, EventController.createEvent);

// Participar en un evento (usuario autenticado)
router.post('/:id/participate',AuthMiddleware.authenticate,uploadProfilePhoto.single('photo'),resizeProfilePhoto,participateEventValidator,EventController.participateInEvent);

// Actualizar un evento
router.put('/:id', AuthMiddleware.authenticate, updateEventValidator, EventController.updateEvent);

// Cancelar un evento
router.patch('/:id/cancel', AuthMiddleware.authenticate, eventIdValidator, EventController.cancelEvent);

// Aceptar o rechazar un participante
router.patch('/:id/participants/:participantId/status',AuthMiddleware.authenticate,updateParticipantStatusValidator,EventController.updateParticipantStatus);

// Eliminar un evento
router.delete('/:id', AuthMiddleware.authenticate, eventIdValidator, EventController.deleteEvent);

export default router;