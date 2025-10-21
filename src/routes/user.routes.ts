import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { 
  createUserValidator, 
  updateUserValidator, 
  userIdValidator,
  getUsersValidator
} from '../middlewares/validators/user.validator.js';
import { AuthMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', AuthMiddleware.authenticate, getUsersValidator, UserController.getAllUsers);

router.get('/:id', AuthMiddleware.authenticate, userIdValidator, UserController.getUserById);

router.post('/', AuthMiddleware.authenticate, createUserValidator, UserController.createUser);

router.put('/:id', AuthMiddleware.authenticate, updateUserValidator, UserController.updateUser);

router.delete('/:id', AuthMiddleware.authenticate, userIdValidator, UserController.toggleUserStatus);

export default router;

