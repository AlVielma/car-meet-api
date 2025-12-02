import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { ResponseUtil } from '../utils/response.util.js';
import { EventService } from '../services/event.service.js';

export class EventController {
  static async getAllEvents(req: Request, res: Response): Promise<Response> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseUtil.validationError(res, errors.array());
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string | undefined;
      const organizerId = req.query.organizerId ? parseInt(req.query.organizerId as string) : undefined;
      const upcoming = req.query.upcoming === 'true';

      const result = await EventService.getAllEvents(page, limit, status, organizerId, upcoming);

      return ResponseUtil.success(
        res,
        'Eventos obtenidos exitosamente',
        result,
        200
      );
    } catch (error: any) {
      console.error('Error en getAllEvents:', error);
      return ResponseUtil.serverError(res, 'Error al obtener los eventos', error);
    }
  }

  static async getEventById(req: Request, res: Response): Promise<Response> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseUtil.validationError(res, errors.array());
      }

      const id = parseInt(req.params.id as string);
      const event = await EventService.getEventById(id);

      return ResponseUtil.success(
        res,
        'Evento obtenido exitosamente',
        event,
        200
      );
    } catch (error: any) {
      console.error('Error en getEventById:', error);

      if (error.message === 'EVENT_NOT_FOUND') {
        return ResponseUtil.error(res, 'Evento no encontrado', null, 404);
      }

      return ResponseUtil.serverError(res, 'Error al obtener el evento', error);
    }
  }

  static async createEvent(req: Request, res: Response): Promise<Response> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseUtil.validationError(res, errors.array());
      }

      const { name, description, location, date, startTime, endTime } = req.body;
      const organizerId = req.user?.userId;

      if (!organizerId) {
        return ResponseUtil.unauthorized(res, 'Usuario no autenticado');
      }

      const eventData: any = {
        organizerId,
        name,
        description,
        location,
        date: new Date(date),
        startTime: new Date(startTime),
      };

      if (endTime) {
        eventData.endTime = new Date(endTime);
      }

      const event = await EventService.createEvent(eventData);

      return ResponseUtil.success(
        res,
        'Evento creado exitosamente',
        event,
        201
      );
    } catch (error: any) {
      console.error('Error en createEvent:', error);

      if (error.message === 'USER_NOT_FOUND') {
        return ResponseUtil.error(res, 'Usuario no encontrado', null, 404);
      }

      return ResponseUtil.serverError(res, 'Error al crear el evento', error);
    }
  }

  static async updateEvent(req: Request, res: Response): Promise<Response> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // Log para depuración: ver qué validación falló
        console.log("Errores de validación en updateEvent:", JSON.stringify(errors.array(), null, 2));
        return ResponseUtil.validationError(res, errors.array());
      }

      const id = parseInt(req.params.id as string);
      const organizerId = req.user?.userId;

      if (!organizerId) {
        return ResponseUtil.unauthorized(res, 'Usuario no autenticado');
      }

      const { name, description, location, date, startTime, endTime, status } = req.body;

      const updateData: any = {
        name,
        description,
        location,
        status,
      };

      if (date) updateData.date = new Date(date);
      if (startTime) updateData.startTime = new Date(startTime);
      if (endTime) updateData.endTime = new Date(endTime);

      const event = await EventService.updateEvent(id, organizerId, updateData);

      return ResponseUtil.success(
        res,
        'Evento actualizado exitosamente',
        event,
        200
      );
    } catch (error: any) {
      console.error('Error en updateEvent:', error);

      if (error.message === 'EVENT_NOT_FOUND') {
        return ResponseUtil.error(res, 'Evento no encontrado', null, 404);
      }

      if (error.message === 'UNAUTHORIZED') {
        return ResponseUtil.error(res, 'No tienes permiso para modificar este evento', null, 403);
      }

      return ResponseUtil.serverError(res, 'Error al actualizar el evento', error);
    }
  }

  static async deleteEvent(req: Request, res: Response): Promise<Response> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseUtil.validationError(res, errors.array());
      }

      const id = parseInt(req.params.id as string);
      const organizerId = req.user?.userId;

      if (!organizerId) {
        return ResponseUtil.unauthorized(res, 'Usuario no autenticado');
      }

      await EventService.deleteEvent(id, organizerId);

      return ResponseUtil.success(
        res,
        'Evento eliminado exitosamente',
        null,
        200
      );
    } catch (error: any) {
      console.error('Error en deleteEvent:', error);

      if (error.message === 'EVENT_NOT_FOUND') {
        return ResponseUtil.error(res, 'Evento no encontrado', null, 404);
      }

      if (error.message === 'UNAUTHORIZED') {
        return ResponseUtil.error(res, 'No tienes permiso para eliminar este evento', null, 403);
      }

      return ResponseUtil.serverError(res, 'Error al eliminar el evento', error);
    }
  }

  static async getUserEvents(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return ResponseUtil.unauthorized(res, 'Usuario no autenticado');
      }

      const events = await EventService.getUserEvents(userId);

      return ResponseUtil.success(
        res,
        'Eventos del usuario obtenidos exitosamente',
        events,
        200
      );
    } catch (error: any) {
      console.error('Error en getUserEvents:', error);
      return ResponseUtil.serverError(res, 'Error al obtener los eventos del usuario', error);
    }
  }

  static async cancelEvent(req: Request, res: Response): Promise<Response> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseUtil.validationError(res, errors.array());
      }

      const id = parseInt(req.params.id as string);
      const organizerId = req.user?.userId;

      if (!organizerId) {
        return ResponseUtil.unauthorized(res, 'Usuario no autenticado');
      }

      const event = await EventService.cancelEvent(id, organizerId);

      return ResponseUtil.success(
        res,
        'Evento cancelado exitosamente',
        event,
        200
      );
    } catch (error: any) {
      console.error('Error en cancelEvent:', error);

      if (error.message === 'EVENT_NOT_FOUND') {
        return ResponseUtil.error(res, 'Evento no encontrado', null, 404);
      }

      if (error.message === 'UNAUTHORIZED') {
        return ResponseUtil.error(res, 'No tienes permiso para cancelar este evento', null, 403);
      }

      if (error.message === 'EVENT_ALREADY_CANCELLED') {
        return ResponseUtil.error(res, 'El evento ya está cancelado', null, 400);
      }

      if (error.message === 'EVENT_ALREADY_FINISHED') {
        return ResponseUtil.error(res, 'El evento ya finalizó', null, 400);
      }

      return ResponseUtil.serverError(res, 'Error al cancelar el evento', error);
    }
  }

  static async participateInEvent(req: Request, res: Response) {
    try {
      // Verificar que el usuario esté autenticado
      const user = (req as any).user;

      if (!user || !user.id) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      const userId = user.userId;
      const eventId = Number(req.params.id);

      // Log para debug (puedes quitarlo después)
      console.log('User ID:', userId);
      console.log('Event ID:', eventId);

      const {
        brand,
        model,
        year,
        color,
        licensePlate,
        description,
        modifications
      } = req.body;

      // Obtener URL de foto desde el archivo subido
      const file = (req as any).file as Express.Multer.File | undefined;

      if (!file || !file.path) {
        return res.status(400).json({
          success: false,
          message: 'La foto del auto es requerida'
        });
      }

      const photoUrl = file.path;

      // Log para debug
      console.log('Photo URL:', photoUrl);
      console.log('Car data:', { brand, model, year, color });

      const participant = await EventService.participateInEvent({
        userId,
        eventId,
        car: {
          brand,
          model,
          year: Number(year),
          color,
          licensePlate: licensePlate || null,
          description: description || null,
          modifications: modifications || null
        },
        photoUrl
      });

      return res.status(201).json({
        success: true,
        message: 'Solicitud de participación enviada exitosamente',
        data: participant
      });
    } catch (error: any) {
      console.error('Error al participar en evento:', error);

      const errorMessages: Record<string, string> = {
        EVENT_NOT_FOUND: 'El evento no existe',
        EVENT_CANCELLED: 'El evento ha sido cancelado',
        EVENT_FINISHED: 'El evento ya ha finalizado',
        USER_ALREADY_PARTICIPATING: 'Ya has enviado una solicitud para este evento',
        DUPLICATE_PARTICIPATION: 'Ya existe una participación con estos datos'
      };

      const message = errorMessages[error.message] || 'Error al enviar solicitud de participación';

      return res.status(400).json({
        success: false,
        message,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  static async getEventParticipants(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const eventId = Number(req.params.id);
      const status = req.query.status as 'PENDING' | 'CONFIRMED' | 'CANCELLED' | undefined;

      const participants = await EventService.getEventParticipants(eventId, status);

      return res.json({
        success: true,
        data: participants,
        count: participants.length
      });
    } catch (error: any) {
      console.error('Error al obtener participantes:', error);

      return res.status(400).json({
        success: false,
        message: 'Error al obtener los participantes del evento'
      });
    }
  }

  static async getParticipantById(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const eventId = Number(req.params.id);
      const participantId = Number(req.params.participantId);

      // Verificar que el usuario es el organizador
      const isOrg = await EventService.isOrganizer(userId, eventId);

      if (!isOrg) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para ver este participante. Solo el organizador puede acceder.'
        });
      }

      const participant = await EventService.getParticipantById(participantId);

      // Verificar que el participante pertenece a este evento
      if (participant.event.id !== eventId) {
        return res.status(404).json({
          success: false,
          message: 'El participante no pertenece a este evento'
        });
      }

      return res.json({
        success: true,
        data: participant
      });
    } catch (error: any) {
      console.error('Error al obtener participante:', error);

      const errorMessages: Record<string, string> = {
        PARTICIPANT_NOT_FOUND: 'Participante no encontrado'
      };

      const message = errorMessages[error.message] || 'Error al obtener información del participante';

      return res.status(400).json({
        success: false,
        message
      });
    }
  }

  static async updateParticipantStatus(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const eventId = Number(req.params.id);
      const participantId = Number(req.params.participantId);
      const { status } = req.body as { status: 'CONFIRMED' | 'CANCELLED' };

      // Verificar que el usuario es el organizador
      const isOrg = await EventService.isOrganizer(userId, eventId);

      if (!isOrg) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para gestionar participantes. Solo el organizador puede realizar esta acción.'
        });
      }

      // Verificar que el participante pertenece a este evento
      const participant = await EventService.getParticipantById(participantId);

      if (participant.event.id !== eventId) {
        return res.status(404).json({
          success: false,
          message: 'El participante no pertenece a este evento'
        });
      }

      const updatedParticipant = await EventService.updateParticipantStatus(participantId, status);

      const statusMessage = status === 'CONFIRMED'
        ? 'Participante aceptado exitosamente'
        : 'Participante rechazado';

      return res.json({
        success: true,
        message: statusMessage,
        data: updatedParticipant
      });
    } catch (error: any) {
      console.error('Error al actualizar estado del participante:', error);

      const errorMessages: Record<string, string> = {
        PARTICIPANT_NOT_FOUND: 'Participante no encontrado'
      };

      const message = errorMessages[error.message] || 'Error al actualizar el estado del participante';

      return res.status(400).json({
        success: false,
        message
      });
    }
  }

  static async getAllParticipants(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const status = req.query.status as 'PENDING' | 'CONFIRMED' | 'CANCELLED' | undefined;
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 20;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      // Obtener todas las participaciones de los eventos del organizador
      const participantParams: {
        organizerId: number;
        status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
        page?: number;
        limit?: number;
      } = {
        organizerId: userId,
        page,
        limit
      };
      if (status !== undefined) {
        participantParams.status = status;
      }
      const result = await EventService.getAllParticipants(participantParams);

      return res.json({
        success: true,
        data: result.participants,
        pagination: result.pagination
      });
    } catch (error: any) {
      console.error('Error al obtener participantes:', error);

      return res.status(400).json({
        success: false,
        message: 'Error al obtener las participaciones',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

