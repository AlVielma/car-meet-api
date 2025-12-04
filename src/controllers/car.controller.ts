import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { ResponseUtil } from '../utils/response.util.js';
import { CarService } from '../services/car.service.js';

export class CarController {
  static async getAllCars(req: Request, res: Response): Promise<Response> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseUtil.validationError(res, errors.array());
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      const brand = req.query.brand as string | undefined;
      const year = req.query.year ? parseInt(req.query.year as string) : undefined;

      const result = await CarService.getAllCars(page, limit, userId, brand, year);

      return ResponseUtil.success(
        res,
        'Autos obtenidos exitosamente',
        result,
        200
      );
    } catch (error: any) {
      console.error('Error en getAllCars:', error);
      return ResponseUtil.serverError(res, 'Error al obtener los autos', error);
    }
  }

  static async getCarById(req: Request, res: Response): Promise<Response> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseUtil.validationError(res, errors.array());
      }

      const id = parseInt(req.params.id as string);
      const car = await CarService.getCarById(id);

      return ResponseUtil.success(
        res,
        'Auto obtenido exitosamente',
        car,
        200
      );
    } catch (error: any) {
      console.error('Error en getCarById:', error);

      if (error.message === 'CAR_NOT_FOUND') {
        return ResponseUtil.error(res, 'Auto no encontrado', null, 404);
      }

      return ResponseUtil.serverError(res, 'Error al obtener el auto', error);
    }
  }

  static async createCar(req: Request, res: Response): Promise<Response> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseUtil.validationError(res, errors.array());
      }

      const { brand, model, year, color, licensePlate, description, modifications } = req.body;
      const userId = req.user?.userId; // Del middleware de autenticación
      // Guardar la ruta relativa completa para que getFullUrl funcione correctamente
      const photoPath = req.file ? `uploads/cars/${req.file.filename}` : undefined;

      if (!userId) {
        return ResponseUtil.unauthorized(res, 'Usuario no autenticado');
      }

      const car = await CarService.createCar({
        userId,
        brand,
        model,
        year: parseInt(year),
        color,
        licensePlate,
        description,
        modifications,
        photoPath,
      });

      return ResponseUtil.success(
        res,
        'Auto creado exitosamente',
        car,
        201
      );
    } catch (error: any) {
      console.error('Error en createCar:', error);

      if (error.message === 'USER_NOT_FOUND') {
        return ResponseUtil.error(res, 'Usuario no encontrado', null, 404);
      }

      return ResponseUtil.serverError(res, 'Error al crear el auto', error);
    }
  }

  static async updateCar(req: Request, res: Response): Promise<Response> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseUtil.validationError(res, errors.array());
      }

      const id = parseInt(req.params.id as string);
      const userId = req.user?.userId; // Del middleware de autenticación

      if (!userId) {
        return ResponseUtil.unauthorized(res, 'Usuario no autenticado');
      }

      const { brand, model, year, color, licensePlate, description, modifications } = req.body;
      // Guardar la ruta relativa completa para que getFullUrl funcione correctamente
      const photoPath = req.file ? `uploads/cars/${req.file.filename}` : undefined;

      const updateData: any = {
        brand,
        model,
        color,
        licensePlate,
        description,
        modifications,
        photoPath,
      };

      if (year) {
        updateData.year = parseInt(year);
      }

      const car = await CarService.updateCar(id, userId, updateData);

      return ResponseUtil.success(
        res,
        'Auto actualizado exitosamente',
        car,
        200
      );
    } catch (error: any) {
      console.error('Error en updateCar:', error);

      if (error.message === 'CAR_NOT_FOUND') {
        return ResponseUtil.error(res, 'Auto no encontrado', null, 404);
      }

      if (error.message === 'UNAUTHORIZED') {
        return ResponseUtil.error(res, 'No tienes permiso para modificar este auto', null, 403);
      }

      return ResponseUtil.serverError(res, 'Error al actualizar el auto', error);
    }
  }

  static async deleteCar(req: Request, res: Response): Promise<Response> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseUtil.validationError(res, errors.array());
      }

      const id = parseInt(req.params.id as string);
      const userId = req.user?.userId; // Del middleware de autenticación

      if (!userId) {
        return ResponseUtil.unauthorized(res, 'Usuario no autenticado');
      }

      await CarService.deleteCar(id, userId);

      return ResponseUtil.success(
        res,
        'Auto eliminado exitosamente',
        null,
        200
      );
    } catch (error: any) {
      console.error('Error en deleteCar:', error);

      if (error.message === 'CAR_NOT_FOUND') {
        return ResponseUtil.error(res, 'Auto no encontrado', null, 404);
      }

      if (error.message === 'UNAUTHORIZED') {
        return ResponseUtil.error(res, 'No tienes permiso para eliminar este auto', null, 403);
      }

      return ResponseUtil.serverError(res, 'Error al eliminar el auto', error);
    }
  }

  static async getUserCars(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user?.userId; // Del middleware de autenticación

      if (!userId) {
        return ResponseUtil.unauthorized(res, 'Usuario no autenticado');
      }

      const cars = await CarService.getUserCars(userId);

      return ResponseUtil.success(
        res,
        'Autos del usuario obtenidos exitosamente',
        cars,
        200
      );
    } catch (error: any) {
      console.error('Error en getUserCars:', error);
      return ResponseUtil.serverError(res, 'Error al obtener los autos del usuario', error);
    }
  }
}

