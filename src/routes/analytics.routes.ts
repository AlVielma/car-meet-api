import { Router } from "express";
import prisma from "../configs/database.js";

const router = Router();

/* ============================================================
    📊 1. Asistencia por evento (detalle completo)
    ============================================================ */
router.get("/attendance", async (req, res) => {
  console.log("GET /api/analytics/attendance");
  try {
    const events = await prisma.event.findMany({
      select: {
        id: true,
        name: true,
        date: true,
        _count: {
          select: { participants: true },
        },
        participants: {
          select: {
            status: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });
    console.log("Eventos encontrados:", events.length);

    type EventWithParticipants = {
      id: number;
      name: string;
      date: Date;
      _count: { participants: number };
      participants: { status: string }[];
    };

    const processed = events.map((ev: EventWithParticipants) => {
      const statusCount = {
        confirmed: ev.participants.filter((p) => p.status === "CONFIRMED")
          .length,
        pending: ev.participants.filter((p) => p.status === "PENDING").length,
        cancelled: ev.participants.filter((p) => p.status === "CANCELLED")
          .length,
      };

      return {
        id: ev.id,
        name: ev.name,
        date: ev.date,
        totalParticipants: ev._count.participants,
        statusBreakdown: statusCount,
      };
    });

    console.log("Procesado:", processed);
    res.json(processed);
  } catch (e) {
    console.error("Error en /attendance:", e);
    res.status(500).json({ error: "Error al obtener asistencia por evento" });
  }
});

/* ============================================================
    🚗 2. Estadísticas de autos (brand + model + year)
    ============================================================ */
router.get("/cars-stats", async (req, res) => {
  console.log("GET /api/analytics/cars-stats");
  try {
    const grouped = await prisma.car.groupBy({
      by: ["brand", "model", "year"],
      _count: { id: true },
      orderBy: {
        brand: "asc",
      },
    });
    console.log("Agrupados:", grouped.length);
    res.json(grouped);
  } catch (e) {
    console.error("Error en /cars-stats:", e);
    res.status(500).json({ error: "Error al obtener estadísticas de autos" });
  }
});

/* ============================================================
    🧍‍♂️ 3. Distribución de roles (Admin/Organizer/Participant)
    ============================================================ */
router.get("/roles-distribution", async (req, res) => {
  console.log("GET /api/analytics/roles-distribution");
  try {
    const group = await prisma.user.groupBy({
      by: ["roleId"],
      _count: { id: true },
    });

    const roles = await prisma.role.findMany();

    type GroupedUser = {
      roleId: number;
      _count: { id: number };
    };

    const result = group.map((g: GroupedUser) => ({
      roleId: g.roleId,
      roleName:
        roles.find((r: { id: number; name: string }) => r.id === g.roleId)
          ?.name || "Unknown",
      totalUsers: g._count.id,
    }));

    console.log("Distribución de roles:", result);
    res.json(result);
  } catch (error) {
    console.error("Error en /roles-distribution:", error);
    res.status(500).json({ error: "Error al obtener distribución de roles" });
  }
});

/* ============================================================
    🏆 4. Top 10 autos con más votos
    ============================================================ */
router.get("/top-cars", async (req, res) => {
  console.log("GET /api/analytics/top-cars");
  try {
    const votes = await prisma.car.findMany({
      select: {
        id: true,
        brand: true,
        model: true,
        year: true,
        _count: { select: { votes: true } }, // <-- CORREGIDO AQUÍ
      },
    });
    console.log("Autos encontrados:", votes.length);

    type CarWithVotes = {
      id: number;
      brand: string;
      model: string;
      year: number;
      _count: { votes: number };
    };

    // Ordena por votos descendente y toma los 10 primeros
    const sorted = votes
      .sort(
        (a: CarWithVotes, b: CarWithVotes) => b._count.votes - a._count.votes
      )
      .slice(0, 10);

    console.log("Top autos:", sorted);
    res.json(sorted);
  } catch (e) {
    console.error("Error en /top-cars:", e);
    res.status(500).json({ error: "Error al obtener ranking de autos" });
  }
});
/* ============================================================
    💬 5. Últimos 20 comentarios (car/event)
    ============================================================ */
router.get("/recent-comments", async (req, res) => {
  console.log("GET /api/analytics/recent-comments");
  try {
    const comments = await prisma.comment.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        content: true,
        createdAt: true,
        user: { select: { firstName: true, lastName: true } },
        car: { select: { brand: true, model: true } },
        event: { select: { name: true } },
      },
    });
    console.log("Comentarios recientes:", comments.length);
    res.json(comments);
  } catch (error) {
    console.error("Error en /recent-comments:", error);
    res.status(500).json({ error: "Error al obtener comentarios recientes" });
  }
});

/* ============================================================
    📸 6. Fotos agrupadas por tipo
    ============================================================ */
router.get("/photos-summary", async (req, res) => {
  console.log("GET /api/analytics/photos-summary");
  try {
    const data = await prisma.photo.groupBy({
      by: ["type"],
      _count: { id: true },
    });
    console.log("Resumen de fotos:", data);
    res.json(data);
  } catch (error) {
    console.error("Error en /photos-summary:", error);
    res.status(500).json({ error: "Error al obtener resumen de fotos" });
  }
});

/* ============================================================
    EXPORTAR
    ============================================================ */
export default router;
