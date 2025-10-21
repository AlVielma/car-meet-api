import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { ResponseUtil } from '../utils/response.util.js';
import { UserService } from '../services/user.service.js';

export class UserController {
  static async getAllUsers(req: Request, res: Response): Promise<Response> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseUtil.validationError(res, errors.array());
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const isActive = req.query.isActive ? req.query.isActive === 'true' : undefined;

      const result = await UserService.getAllUsers(page, limit, isActive);

      return ResponseUtil.success(
        res,
        'Usuarios obtenidos exitosamente',
        result,
        200
      );
    } catch (error: any) {
      console.error('Error en getAllUsers:', error);
      return ResponseUtil.serverError(res, 'Error al obtener los usuarios', error);
    }
  }

  static async getUserById(req: Request, res: Response): Promise<Response> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseUtil.validationError(res, errors.array());
      }

      const id = parseInt(req.params.id as string);
      const user = await UserService.getUserById(id);

      return ResponseUtil.success(
        res,
        'Usuario obtenido exitosamente',
        user,
        200
      );
    } catch (error: any) {
      console.error('Error en getUserById:', error);

      if (error.message === 'USER_NOT_FOUND') {
        return ResponseUtil.error(res, 'Usuario no encontrado', null, 404);
      }

      return ResponseUtil.serverError(res, 'Error al obtener el usuario', error);
    }
  }

  static async createUser(req: Request, res: Response): Promise<Response> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseUtil.validationError(res, errors.array());
      }

      const { firstName, lastName, email, phone, password, roleId } = req.body;

      const userData: any = {
        firstName,
        lastName,
        email,
        phone,
        password,
      };

      if (roleId) {
        userData.roleId = parseInt(roleId);
      }

      const user = await UserService.createUser(userData);

      return ResponseUtil.success(
        res,
        'Usuario creado exitosamente',
        user,
        201
      );
    } catch (error: any) {
      console.error('Error en createUser:', error);

      if (error.message === 'EMAIL_ALREADY_EXISTS') {
        return ResponseUtil.error(res, 'El email ya está registrado', null, 409);
      }

      return ResponseUtil.serverError(res, 'Error al crear el usuario', error);
    }
  }

  static async updateUser(req: Request, res: Response): Promise<Response> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseUtil.validationError(res, errors.array());
      }

      const id = parseInt(req.params.id as string);
      const { firstName, lastName, email, phone, password, roleId } = req.body;

      const updateData: any = {
        firstName,
        lastName,
        email,
        phone,
        password,
      };

      if (roleId) {
        updateData.roleId = parseInt(roleId);
      }

      const user = await UserService.updateUser(id, updateData);

      return ResponseUtil.success(
        res,
        'Usuario actualizado exitosamente',
        user,
        200
      );
    } catch (error: any) {
      console.error('Error en updateUser:', error);

      if (error.message === 'USER_NOT_FOUND') {
        return ResponseUtil.error(res, 'Usuario no encontrado', null, 404);
      }

      if (error.message === 'EMAIL_ALREADY_EXISTS') {
        return ResponseUtil.error(res, 'El email ya está registrado', null, 409);
      }

      return ResponseUtil.serverError(res, 'Error al actualizar el usuario', error);
    }
  }

  static async activateUser(req: Request, res: Response): Promise<Response> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseUtil.validationError(res, errors.array());
      }

      const id = parseInt(req.params.id as string);
      const user = await UserService.activateUser(id);

      return ResponseUtil.success(
        res,
        'Usuario activado exitosamente',
        user,
        200
      );
    } catch (error: any) {
      console.error('Error en activateUser:', error);

      if (error.message === 'USER_NOT_FOUND') {
        return ResponseUtil.error(res, 'Usuario no encontrado', null, 404);
      }

      if (error.message === 'USER_ALREADY_ACTIVE') {
        return ResponseUtil.error(res, 'El usuario ya está activo', null, 400);
      }

      return ResponseUtil.serverError(res, 'Error al activar el usuario', error);
    }
  }

  static async deactivateUser(req: Request, res: Response): Promise<Response> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseUtil.validationError(res, errors.array());
      }

      const id = parseInt(req.params.id as string);
      const user = await UserService.deactivateUser(id);

      return ResponseUtil.success(
        res,
        'Usuario desactivado exitosamente',
        user,
        200
      );
    } catch (error: any) {
      console.error('Error en deactivateUser:', error);

      if (error.message === 'USER_NOT_FOUND') {
        return ResponseUtil.error(res, 'Usuario no encontrado', null, 404);
      }

      if (error.message === 'USER_ALREADY_INACTIVE') {
        return ResponseUtil.error(res, 'El usuario ya está inactivo', null, 400);
      }

      return ResponseUtil.serverError(res, 'Error al desactivar el usuario', error);
    }
  }

  static async toggleUserStatus(req: Request, res: Response): Promise<Response> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseUtil.validationError(res, errors.array());
      }

      const id = parseInt(req.params.id as string);
      const user = await UserService.toggleUserStatus(id);

      const message = user.isActive 
        ? 'Usuario activado exitosamente' 
        : 'Usuario desactivado exitosamente';

      return ResponseUtil.success(
        res,
        message,
        user,
        200
      );
    } catch (error: any) {
      console.error('Error en toggleUserStatus:', error);

      if (error.message === 'USER_NOT_FOUND') {
        return ResponseUtil.error(res, 'Usuario no encontrado', null, 404);
      }

      return ResponseUtil.serverError(res, 'Error al cambiar el estado del usuario', error);
    }
  }
}
