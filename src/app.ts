import express from 'express';
import { Request, Response } from 'express';
import dotenv from 'dotenv';
import prisma from './configs/database.js';

dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('¡Hola, Express con TypeScript! 🚀');
});


app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});