import prisma from "../configs/database.js";
import bcrypt from "bcryptjs";

function randomFrom<T>(array: T[]): T {
  if (array.length === 0) {
    throw new Error("Cannot select a random element from an empty array.");
  }
  return array[Math.floor(Math.random() * array.length)]!;
}

interface Role {
  id: number;
  name: string;
  slug: string;
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roleId: number;
  isActive: boolean;
}

interface Car {
  id: number;
  userId: number;
  brand: string;
  model: string;
  year: number;
  color: string;
  modifications: string;
  description: string;
}

interface Event {
  id: number;
  name: string;
  description: string;
  location: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  organizerId: number;
}

interface EventParticipant {
  id: number;
  eventId: number;
  userId: number;
  carId: number;
  status: string;
}

interface Comment {
  id: number;
  userId: number;
  eventId: number;
  content: string;
}

interface Vote {
  id: number;
  eventId: number;
  carId: number;
  voterId: number;
  category: string;
  score: number;
}

interface Photo {
  id: number;
  url: string;
  type: string;
  carId: number;
  isMain: boolean;
}

interface RandomIntFn {
  (min: number, max: number): number;
}

const randomInt: RandomIntFn = function randomInt(
  min: number,
  max: number
): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const carBrands = [
  "Honda",
  "Nissan",
  "Toyota",
  "Mazda",
  "BMW",
  "Audi",
  "Volkswagen",
  "Ford",
  "Chevrolet",
  "Subaru",
  "Mercedes-Benz",
  "Acura",
  "Kia",
  "Hyundai",
];

const carModels = [
  "Civic",
  "GT-R",
  "Supra",
  "RX-7",
  "M3",
  "A4",
  "Golf GTI",
  "Mustang",
  "Camaro",
  "WRX",
  "C-Class",
  "Stinger",
  "Veloster",
];

const colors = ["Rojo", "Negro", "Blanco", "Azul", "Plata", "Gris", "Verde"];
const eventNames = [
  "Night Meet",
  "JDM Legends",
  "Euro Fest",
  "Muscle Power",
  "Tuning Showdown",
  "Track Day",
  "Street Culture Meet",
  "Midnight Run",
  "Static vs Bags",
  "Dyno Day",
];

const locations = [
  "Monterrey",
  "CDMX",
  "Guadalajara",
  "Tijuana",
  "Saltillo",
  "León",
  "Querétaro",
  "Puebla",
  "Mérida",
  "Cancún",
];

const commentsSamples = [
  "Ese coche está brutal 🔥",
  "Muy buena vibra en el evento 👌",
  "¡Me encantó la exhibición!",
  "Gran ambiente, buenas fotos",
  "Esa modificación quedó épica 😎",
  "Hermoso proyecto 🔧",
  "Mis respetos al nivel del evento",
];

async function createRoles() {
  await prisma.role.deleteMany();

  return prisma.role.createManyAndReturn({
    data: [
      { name: "Administrator", slug: "admin" },
      { name: "Organizer", slug: "organizer" },
      { name: "Participant", slug: "participant" },
    ],
  });
}

async function main() {
  console.log("🌱 Seed MASIVO iniciando...");

  // LIMPIAR TODO
  await prisma.vote.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.photo.deleteMany();
  await prisma.eventParticipant.deleteMany();
  await prisma.event.deleteMany();
  await prisma.car.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();

  console.log("🧹 BD limpia.");

  // Roles
  const roles = await createRoles();
  const adminRole: Role | undefined = roles.find(
    (x: Role) => x.slug === "admin"
  );
  const organizerRole: Role | undefined = roles.find(
    (x: Role) => x.slug === "organizer"
  );
  const participantRole: Role | undefined = roles.find(
    (x: Role) => x.slug === "participant"
  );

  // Password encriptado
  const hashedPassword = await bcrypt.hash("password123", 10);

  console.log("👥 Creando usuarios...");

  // Admin fijo
  if (!adminRole) {
    throw new Error("Admin role not found");
  }
  await prisma.user.create({
    data: {
      firstName: "Admin",
      lastName: "Master",
      email: "admin@carmeet.com",
      password: hashedPassword,
      roleId: adminRole.id,
      isActive: true,
    },
  });

  // Crear 10 organizadores
  if (!organizerRole) {
    throw new Error("Organizer role not found");
  }
  const organizers = await Promise.all(
    [...Array(10)].map((_, i) =>
      prisma.user.create({
        data: {
          firstName: `Organizador${i + 1}`,
          lastName: "Eventos",
          email: `org${i + 1}@carmeet.com`,
          password: hashedPassword,
          roleId: organizerRole.id,
          isActive: true,
        },
      })
    )
  );

  // Crear 40 participantes
  if (!participantRole) {
    throw new Error("Participant role not found");
  }
  const participants = await Promise.all(
    [...Array(40)].map((_, i) =>
      prisma.user.create({
        data: {
          firstName: `Usuario${i + 1}`,
          lastName: "Auto",
          email: `user${i + 1}@carmeet.com`,
          password: hashedPassword,
          roleId: participantRole.id,
          isActive: true,
        },
      })
    )
  );

  console.log("🚗 Creando autos...");

  const cars = [];
  for (let i = 0; i < 120; i++) {
    const user = randomFrom(participants);

    const car = await prisma.car.create({
      data: {
        userId: user.id,
        brand: randomFrom(carBrands),
        model: randomFrom(carModels),
        year: randomInt(1995, 2024),
        color: randomFrom(colors),
        modifications: "Suspensión, Rines, Escape deportivo",
        description: "Proyecto personal cargado de estilo",
      },
    });

    cars.push(car);
  }

  console.log("🎉 Autos creados:", cars.length);

  console.log("📅 Creando eventos...");

  const events = [];
  for (let i = 0; i < 12; i++) {
    const event = await prisma.event.create({
      data: {
        name: randomFrom(eventNames),
        description: "Evento automotriz lleno de adrenalina",
        location: randomFrom(locations),
        date: new Date(Date.now() + i * 86400000 * 5),
        startTime: new Date(),
        endTime: new Date(Date.now() + 3600000 * 3),
        organizerId: randomFrom(organizers).id,
      },
    });
    events.push(event);
  }

  console.log("🎊 Eventos creados:", events.length);

  console.log("🏎️ Creando participaciones...");

  const eventParticipants = [];
  for (let i = 0; i < 300; i++) {
    const event = randomFrom(events);
    const user = randomFrom(participants);
    const car = randomFrom(cars.filter((c) => c.userId === user.id));

    if (!car) continue;

    try {
      const ep = await prisma.eventParticipant.create({
        data: {
          eventId: event.id,
          userId: user.id,
          carId: car.id,
          status: "CONFIRMED",
        },
      });

      eventParticipants.push(ep);
    } catch {}
  }

  console.log("👥 Participaciones creadas:", eventParticipants.length);

  console.log("💬 Creando comentarios...");

  for (const event of events) {
    for (let i = 0; i < 20; i++) {
      const user = randomFrom(participants);
      await prisma.comment.create({
        data: {
          userId: user.id,
          eventId: event.id,
          content: randomFrom(commentsSamples),
        },
      });
    }
  }

  console.log("🗳️ Creando votos...");

  for (const event of events) {
    const eventCars = eventParticipants
      .filter((ep) => ep.eventId === event.id)
      .map((ep) => ep.carId);

    for (const carId of eventCars) {
      for (let j = 0; j < 3; j++) {
        await prisma.vote.create({
          data: {
            eventId: event.id,
            carId,
            voterId: randomFrom(participants).id,
            category: ["Best Style", "Engine", "Interior"][randomInt(0, 2)],
            score: randomInt(1, 10),
          },
        });
      }
    }
  }

  console.log("📸 Creando fotos...");

  for (const car of cars.slice(0, 50)) {
    await prisma.photo.create({
      data: {
        url: `https://picsum.photos/seed/car${car.id}/800/600`,
        type: "CAR",
        carId: car.id,
        isMain: true,
      },
    });
  }

  console.log("🎉 SEED MASIVO COMPLETADO.");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
