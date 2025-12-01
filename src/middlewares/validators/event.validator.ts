import { body, param, query } from 'express-validator';

export const createEventValidator = [
  body('name')
    .notEmpty()
    .withMessage('El nombre del evento es requerido')
    .bail()
    .isString()
    .withMessage('El nombre debe ser un texto')
    .bail()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('El nombre debe tener entre 3 y 100 caracteres'),

  body('description')
    .optional({ nullable: true })
    .bail()
    .isString()
    .withMessage('La descripción debe ser un texto')
    .bail()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('La descripción no puede tener más de 2000 caracteres'),

  body('location')
    .notEmpty()
    .withMessage('La ubicación es requerida')
    .bail()
    .isString()
    .withMessage('La ubicación debe ser un texto')
    .bail()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('La ubicación debe tener entre 3 y 200 caracteres'),

  body('date')
    .notEmpty()
    .withMessage('La fecha del evento es requerida')
    .bail()
    .isISO8601()
    .withMessage('La fecha debe ser una fecha válida (formato ISO 8601)')
    .bail()
    .custom((value) => {
      const eventDate = new Date(value);
      const now = new Date();
      if (eventDate < now) {
        throw new Error('La fecha del evento no puede ser en el pasado');
      }
      return true;
    }),

  body('startTime')
    .notEmpty()
    .withMessage('La hora de inicio es requerida')
    .bail()
    .isISO8601()
    .withMessage('La hora de inicio debe ser una fecha/hora válida (formato ISO 8601)'),

  body('endTime')
    .optional({ nullable: true })
    .bail()
    .isISO8601()
    .withMessage('La hora de fin debe ser una fecha/hora válida (formato ISO 8601)')
    .bail()
    .custom((value, { req }) => {
      if (value && req.body.startTime) {
        const startTime = new Date(req.body.startTime);
        const endTime = new Date(value);
        if (endTime <= startTime) {
          throw new Error('La hora de fin debe ser posterior a la hora de inicio');
        }
      }
      return true;
    }),
];

export const updateEventValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID de evento inválido'),

  body('name')
    .optional()
    .bail()
    .isString()
    .withMessage('El nombre debe ser un texto')
    .bail()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('El nombre debe tener entre 3 y 100 caracteres'),

  body('description')
    .optional({ nullable: true })
    .bail()
    .isString()
    .withMessage('La descripción debe ser un texto')
    .bail()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('La descripción no puede tener más de 2000 caracteres'),

  body('location')
    .optional()
    .bail()
    .isString()
    .withMessage('La ubicación debe ser un texto')
    .bail()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('La ubicación debe tener entre 3 y 200 caracteres'),

  body('date')
    .optional()
    .bail()
    .isISO8601()
    .withMessage('La fecha debe ser una fecha válida (formato ISO 8601)'),

  body('startTime')
    .optional()
    .bail()
    .isISO8601()
    .withMessage('La hora de inicio debe ser una fecha/hora válida (formato ISO 8601)'),

  body('endTime')
    .optional({ nullable: true })
    .bail()
    .isISO8601()
    .withMessage('La hora de fin debe ser una fecha/hora válida (formato ISO 8601)')
    .bail()
    .custom((value, { req }) => {
      if (value && req.body.startTime) {
        const startTime = new Date(req.body.startTime);
        const endTime = new Date(value);
        if (endTime <= startTime) {
          throw new Error('La hora de fin debe ser posterior a la hora de inicio');
        }
      }
      return true;
    }),

  body('status')
    .optional()
    .bail()
    .isIn(['ACTIVE', 'CANCELLED', 'FINISHED'])
    .withMessage('El estado debe ser ACTIVE, CANCELLED o FINISHED'),
];

export const eventIdValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID de evento inválido'),
];

export const getEventsValidator = [
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

  query('status')
    .optional()
    .bail()
    .isIn(['ACTIVE', 'CANCELLED', 'FINISHED'])
    .withMessage('El estado debe ser ACTIVE, CANCELLED o FINISHED'),

  query('organizerId')
    .optional()
    .bail()
    .isInt({ min: 1 })
    .withMessage('El organizerId debe ser un número entero positivo'),

  query('upcoming')
    .optional()
    .bail()
    .isBoolean()
    .withMessage('upcoming debe ser true o false'),
];

