import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { Request, Response, NextFunction } from 'express';

// Asegurarse de que los directorios de subida existan
const profileUploadDir = 'uploads/profiles';
const carUploadDir = 'uploads/cars';

[profileUploadDir, carUploadDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Usamos memoryStorage para tener el buffer disponible para sharp
const storage = multer.memoryStorage();

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Aceptar solo imágenes
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen'));
  }
};

export const uploadProfilePhoto = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // Límite de 10MB
  }
});

export const uploadCarPhoto = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // Límite de 10MB
  }
});

// Agregar este export para compatibilidad
export const upload = uploadProfilePhoto;

export const resizeProfilePhoto = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) return next();

  // Generar nombre de archivo único
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  const filename = `profile-${uniqueSuffix}.webp`;
  const filepath = path.join(profileUploadDir, filename);

  try {
    await sharp(req.file.buffer)
      .resize(500, 500, {
        fit: 'cover',
        position: 'center'
      })
      .toFormat('webp')
      .webp({ quality: 80 })
      .toFile(filepath);

    // Actualizar req.file para que el controlador use el archivo procesado
    req.file.filename = filename;
    req.file.path = filepath;
    req.file.mimetype = 'image/webp';
    
    next();
  } catch (error) {
    console.error('Error al procesar imagen de perfil:', error);
    next(error);
  }
};

export const resizeCarPhoto = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) return next();

  // Generar nombre de archivo único
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  const filename = `car-${uniqueSuffix}.webp`;
  const filepath = path.join(carUploadDir, filename);

  try {
    await sharp(req.file.buffer)
      .resize(1200, 800, { // Autos en mayor resolución
        fit: 'inside', // Mantener proporción, no recortar
        withoutEnlargement: true
      })
      .toFormat('webp')
      .webp({ quality: 85 })
      .toFile(filepath);

    // Actualizar req.file para que el controlador use el archivo procesado
    req.file.filename = filename;
    req.file.path = filepath;
    req.file.mimetype = 'image/webp';
    
    next();
  } catch (error) {
    console.error('Error al procesar imagen de auto:', error);
    next(error);
  }
};
