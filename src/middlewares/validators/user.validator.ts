import { body, param, query } from "express-validator";

export const createUserValidator = [
  body("firstName")
    .notEmpty()
    .withMessage("El nombre es requerido")
    .bail()
    .isString()
    .withMessage("El nombre debe ser un texto")
    .bail()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("El nombre debe tener entre 2 y 50 caracteres"),

  body("lastName")
    .notEmpty()
    .withMessage("El apellido es requerido")
    .bail()
    .isString()
    .withMessage("El apellido debe ser un texto")
    .bail()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("El apellido debe tener entre 2 y 50 caracteres"),

  body("email")
    .notEmpty()
    .withMessage("El email es requerido")
    .bail()
    .isEmail()
    .withMessage("Debe ser un email válido")
    .bail()
    .normalizeEmail()
    .toLowerCase(),

  body("phone")
    .optional()
    .bail()
    .isString()
    .withMessage("El teléfono debe ser un texto")
    .bail()
    .trim()
    .matches(/^[0-9]{10}$/)
    .withMessage("El teléfono debe tener 10 dígitos"),

  body("password")
    .optional() // antes: .notEmpty()
    .bail()
    .isString()
    .withMessage("La contraseña debe ser un texto")
    .bail()
    .isLength({ min: 8 })
    .withMessage("La contraseña debe tener al menos 8 caracteres")
    .bail()
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_\-])[A-Za-z\d@$!%*?&.#_\-]{8,}$/
    )
    .withMessage(
      "La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial (@$!%*?&.#_-)"
    ),

  body("roleId")
    .notEmpty()
    .withMessage("El rol es requerido")
    .bail()
    .isInt({ min: 1 })
    .withMessage("El rol debe ser un número entero positivo"),
];

export const updateUserValidator = [
  param("id").isInt({ min: 1 }).withMessage("ID de usuario inválido"),

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

  body("email")
    .optional()
    .bail()
    .isEmail()
    .withMessage("Debe ser un email válido")
    .bail()
    .normalizeEmail()
    .toLowerCase(),

  body("phone")
    .optional()
    .bail()
    .isString()
    .withMessage("El teléfono debe ser un texto")
    .bail()
    .trim()
    .matches(/^[0-9]{10}$/)
    .withMessage("El teléfono debe tener 10 dígitos"),

  body("password")
    .optional({ checkFalsy: true })
    .bail()
    .isString()
    .withMessage("La contraseña debe ser un texto")
    .bail()
    .isLength({ min: 8 })
    .withMessage("La contraseña debe tener al menos 8 caracteres")
    .bail()
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_\-])[A-Za-z\d@$!%*?&.#_\-]{8,}$/
    )
    .withMessage(
      "La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial (@$!%*?&.#_-)"
    ),

  body("roleId")
    .optional()
    .bail()
    .isInt({ min: 1 })
    .withMessage("El rol debe ser un número entero positivo"),
];

export const userIdValidator = [
  param("id").isInt({ min: 1 }).withMessage("ID de usuario inválido"),
];

export const getUsersValidator = [
  query("page")
    .optional()
    .bail()
    .isInt({ min: 1 })
    .withMessage("La página debe ser un número entero positivo"),

  query("limit")
    .optional()
    .bail()
    .isInt({ min: 1, max: 100 })
    .withMessage("El límite debe ser un número entre 1 y 100"),

  query("isActive")
    .optional()
    .bail()
    .isBoolean()
    .withMessage("isActive debe ser true o false"),
];
