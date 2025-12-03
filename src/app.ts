import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Importar rutas
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import eventRoutes from "./routes/event.routes.js";
import carRoutes from "./routes/car.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";

// Importar seed
import { runSeed } from "./scripts/seed.js";

// Para obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();

// Configuración de CORS
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Middleware para parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// SERVIR ARCHIVOS ESTÁTICOS
// ============================================
// Servir archivos desde la carpeta uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// También puedes agregar logs para debug (opcional)
app.use("/uploads", (req, res, next) => {
  console.log("Accediendo a archivo:", req.url);
  next();
});

app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Car Meet API is running",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      events: "/api/events",
      cars: "/api/cars",
      uploads: "/uploads",
    },
  });
});

// ============================================
// RUTA PROTEGIDA PARA SEED (SOLO UNA VEZ)
// ============================================
app.get("/run-seed", async (req: Request, res: Response) => {
  const secret = req.query.secret as string;

  if (!process.env.SEED_SECRET || secret !== process.env.SEED_SECRET) {
    return res.status(403).json({ 
      success: false,
      error: "Unauthorized - Invalid or missing secret" 
    });
  }

  try {
    const result = await runSeed();
    return res.json({ 
      success: true,
      message: "Seed ejecutado correctamente",
      data: result
    });
  } catch (err: any) {
    console.error("Error ejecutando seed:", err);
    return res.status(500).json({ 
      success: false,
      error: err.message || "Error ejecutando seed"
    });
  }
});

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/cars", carRoutes);
app.use("/api/analytics", analyticsRoutes);

// Manejador de errores 404
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.url}`,
  });
});

// Manejador de errores global
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Error interno del servidor",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Uploads available at http://localhost:${PORT}/uploads`);
});