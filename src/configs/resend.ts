import { Resend } from "resend";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Obtener __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar .env desde la raíz del proyecto
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Verificar que la API key existe
if (!process.env.RESEND_API_KEY) {
  console.warn("⚠️  RESEND_API_KEY no está configurada en .env");
}

export const resend = new Resend(process.env.RESEND_API_KEY);

export const emailConfig = {
  from: process.env.EMAIL_FROM || "onboarding@resend.dev",
  fromName: process.env.EMAIL_FROM_NAME || "Car Meet",
};
