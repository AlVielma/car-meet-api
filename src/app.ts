import express from 'express';
import { Request, Response } from 'express';
import dotenv from 'dotenv';
import prisma from './configs/database.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import carRoutes from './routes/car.routes.js';
import multer from 'multer';
const upload = multer();

dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();

// Middleware para parsear JSON
app.use(express.json());
app.use(upload.none()); // Para procesar form-data sin archivos


app.use(express.urlencoded({ extended: true }));

app.get('/', (req: Request, res: Response) => {
  res.send('¡Hola, Express con TypeScript! 🚀');
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cars', carRoutes);

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});