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
}

