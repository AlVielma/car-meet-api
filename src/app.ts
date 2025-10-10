import express from 'express';
import { Request, Response } from 'express';
import dotenv from 'dotenv';
import prisma from './configs/database.js';

dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());

// Ruta de prueba
app.get('/', (req: Request, res: Response) => {
  res.send('¡Hola, Express con TypeScript! 🚀');
});

// Ejemplo de ruta usando Prisma
app.get('/users', async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});