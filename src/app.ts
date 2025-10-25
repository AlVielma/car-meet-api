import express from 'express';
import { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import prisma from './configs/database.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import carRoutes from './routes/car.routes.js';
import eventRoutes from './routes/event.routes.js';
import multer from 'multer';
const upload = multer();

dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();

// Configuración de CORS
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Middleware para parsear JSON
app.use(express.json());
app.use(upload.none());

app.use(express.urlencoded({ extended: true }));

app.get('/', (req: Request, res: Response) => {
  res.send('¡Hola, Express con TypeScript! 🚀');
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/events', eventRoutes);

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});