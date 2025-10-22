import { Router } from 'express';
import { CarController } from '../controllers/car.controller.js';
import { 
  createCarValidator, 
  updateCarValidator, 
  carIdValidator,
  getCarsValidator
} from '../middlewares/validators/car.validator.js';
import { AuthMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

// Obtener todos los autos con filtros opcionales
router.get('/', getCarsValidator, CarController.getAllCars);

// Obtener autos del usuario autenticado
router.get('/my-cars', AuthMiddleware.authenticate, CarController.getUserCars);

// Obtener un auto por ID
router.get('/:id', carIdValidator, CarController.getCarById);

// Crear un auto (requiere autenticación)
router.post('/', AuthMiddleware.authenticate, createCarValidator, CarController.createCar);

// Actualizar un auto (requiere autenticación y ser propietario)
router.put('/:id', AuthMiddleware.authenticate, updateCarValidator, CarController.updateCar);

// Eliminar un auto (requiere autenticación y ser propietario)
router.delete('/:id', AuthMiddleware.authenticate, carIdValidator, CarController.deleteCar);

export default router;

