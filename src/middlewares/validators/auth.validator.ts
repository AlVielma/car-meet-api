import { body } from 'express-validator';

export const registerValidator = [
  body('firstName')
    .notEmpty()
    .withMessage('El nombre es requerido')
    .bail()
    .isString()
    .withMessage('El nombre debe ser un texto')
    .bail()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres'),

  body('lastName')
    .notEmpty()
    .withMessage('El apellido es requerido')
    .bail()
    .isString()
    .withMessage('El apellido debe ser un texto')
    .bail()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El apellido debe tener entre 2 y 50 caracteres'),

  body('email')
    .notEmpty()
    .withMessage('El email es requerido')
    .bail()
    .isEmail()
    .withMessage('Debe ser un email válido')
    .bail()
    .normalizeEmail()
    .toLowerCase(),

  body('phone')
    .optional()
    .bail()
    .isString()
    .withMessage('El teléfono debe ser un texto')
    .bail()
    .trim()
    .matches(/^[0-9]{10}$/)
    .withMessage('El teléfono debe tener 10 dígitos'),

  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
    .bail()
    .isString()
    .withMessage('La contraseña debe ser un texto')
    .bail()
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres')
    .bail()
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_\-])[A-Za-z\d@$!%*?&.#_\-]{8,}$/)
    .withMessage('La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial (@$!%*?&.#_-)'),

  body('passwordConfirm')
    .notEmpty()
    .withMessage('La confirmación de contraseña es requerida')
    .bail() // Importante: detiene antes de la validación custom
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Las contraseñas no coinciden');
      }
      return true;
    }),
];

export const loginValidator = [
  body('email')
    .notEmpty()
    .withMessage('El email es requerido')
    .bail()
    .isEmail()
    .withMessage('Debe ser un email válido')
    .bail()
    .normalizeEmail()
    .toLowerCase(),

  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
    .bail()
    .isString()
    .withMessage('La contraseña debe ser un texto'),
];

export const verifyCodeValidator = [
  body('email')
    .notEmpty()
    .withMessage('El email es requerido')
    .bail()
    .isEmail()
    .withMessage('Debe ser un email válido')
    .bail()
    .normalizeEmail()
    .toLowerCase(),

  body('code')
    .notEmpty()
    .withMessage('El código de verificación es requerido')
    .bail()
    .isString()
    .withMessage('El código debe ser un texto')
    .bail()
    .trim()
    .matches(/^[0-9]{6}$/)
    .withMessage('El código debe ser de 6 dígitos numéricos'),
];

export const resendCodeValidator = [
  body('email')
    .notEmpty()
    .withMessage('El email es requerido')
    .bail()
    .isEmail()
    .withMessage('Debe ser un email válido')
    .bail()
    .normalizeEmail()
    .toLowerCase(),
];

export const updateProfileValidator = [
  body("firstName")
    .optional()
    .bail()
    .isString()
    .withMessage("El nombre debe ser un texto")
    .bail()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("El nombre debe tener entre 2 y 50 caracteres"),

  body("lastName")
    .optional()
    .bail()
    .isString()
    .withMessage("El apellido debe ser un texto")
    .bail()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("El apellido debe tener entre 2 y 50 caracteres"),

  body("phone")
    .optional()
    .bail()
    .isString()
    .withMessage("El teléfono debe ser un texto")
    .bail()
    .trim()
    .matches(/^[0-9]{10}$/)
    .withMessage("El teléfono debe tener 10 dígitos"),
];

