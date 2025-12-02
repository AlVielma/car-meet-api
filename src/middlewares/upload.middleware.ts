import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { Request, Response, NextFunction } from 'express';

// Asegurarse de que el directorio de subida exista
const uploadDir = 'uploads/profiles';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

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
    fileSize: 10 * 1024 * 1024 // Límite de 10MB de entrada
  }
});

// Agregar este export para compatibilidad
export const upload = uploadProfilePhoto;

export const resizeProfilePhoto = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) return next();

  // Generar nombre de archivo único
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  const filename = `profile-${uniqueSuffix}.webp`;
  const filepath = path.join(uploadDir, filename);

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
    console.error('Error al procesar imagen:', error);
    next(error);
  }
};
