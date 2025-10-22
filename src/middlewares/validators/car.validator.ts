import { body, param, query } from 'express-validator';

export const createCarValidator = [
  body('brand')
    .notEmpty()
    .withMessage('La marca es requerida')
    .bail()
    .isString()
    .withMessage('La marca debe ser un texto')
    .bail()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('La marca debe tener entre 2 y 50 caracteres'),

  body('model')
    .notEmpty()
    .withMessage('El modelo es requerido')
    .bail()
    .isString()
    .withMessage('El modelo debe ser un texto')
    .bail()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('El modelo debe tener entre 1 y 50 caracteres'),

  body('year')
    .notEmpty()
    .withMessage('El año es requerido')
    .bail()
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage(`El año debe ser entre 1900 y ${new Date().getFullYear() + 1}`),

  body('color')
    .notEmpty()
    .withMessage('El color es requerido')
    .bail()
    .isString()
    .withMessage('El color debe ser un texto')
    .bail()
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage('El color debe tener entre 2 y 30 caracteres'),

  body('licensePlate')
    .optional()
    .bail()
    .isString()
    .withMessage('La placa debe ser un texto')
    .bail()
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('La placa debe tener entre 3 y 20 caracteres'),

  body('description')
    .optional()
    .bail()
    .isString()
    .withMessage('La descripción debe ser un texto')
    .bail()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('La descripción no puede tener más de 1000 caracteres'),

  body('modifications')
    .optional()
    .bail()
    .isString()
    .withMessage('Las modificaciones deben ser un texto')
    .bail()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Las modificaciones no pueden tener más de 2000 caracteres'),
];

export const updateCarValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID de auto inválido'),

  body('brand')
    .optional()
    .bail()
    .isString()
    .withMessage('La marca debe ser un texto')
    .bail()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('La marca debe tener entre 2 y 50 caracteres'),

  body('model')
    .optional()
    .bail()
    .isString()
    .withMessage('El modelo debe ser un texto')
    .bail()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('El modelo debe tener entre 1 y 50 caracteres'),

  body('year')
    .optional()
    .bail()
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage(`El año debe ser entre 1900 y ${new Date().getFullYear() + 1}`),

  body('color')
    .optional()
    .bail()
    .isString()
    .withMessage('El color debe ser un texto')
    .bail()
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage('El color debe tener entre 2 y 30 caracteres'),

  body('licensePlate')
    .optional()
    .bail()
    .isString()
    .withMessage('La placa debe ser un texto')
    .bail()
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('La placa debe tener entre 3 y 20 caracteres'),

  body('description')
    .optional()
    .bail()
    .isString()
    .withMessage('La descripción debe ser un texto')
    .bail()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('La descripción no puede tener más de 1000 caracteres'),

  body('modifications')
    .optional()
    .bail()
    .isString()
    .withMessage('Las modificaciones deben ser un texto')
    .bail()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Las modificaciones no pueden tener más de 2000 caracteres'),
];

export const carIdValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID de auto inválido'),
];

export const getCarsValidator = [
  query('page')
    .optional()
    .bail()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero positivo'),

  query('limit')
    .optional()
    .bail()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe ser un número entre 1 y 100'),

  query('userId')
    .optional()
    .bail()
    .isInt({ min: 1 })
    .withMessage('El userId debe ser un número entero positivo'),

  query('brand')
    .optional()
    .bail()
    .isString()
    .withMessage('La marca debe ser un texto'),

  query('year')
    .optional()
    .bail()
    .isInt({ min: 1900 })
    .withMessage('El año debe ser un número válido'),
];

