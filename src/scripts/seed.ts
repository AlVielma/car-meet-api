import prisma from '../configs/database.js';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🌱 Iniciando seed...');

  console.log('🗑️  Limpiando base de datos...');
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();

  console.log('👥 Creando roles...');
  const adminRole = await prisma.role.create({
    data: {
      name: 'Administrator',
      slug: 'admin',
      description: 'Full access to the system',
    },
  });

  const organizerRole = await prisma.role.create({
    data: {
      name: 'Organizer',
      slug: 'organizer',
      description: 'Can organize and manage car meets',
    },
  });

  const participantRole = await prisma.role.create({
    data: {
      name: 'Participant',
      slug: 'participant',
      description: 'Can register cars and participate in events',
    },
  });

  console.log(`✅ 3 roles creados`);

  // Crea usuarios de ejemplo
  console.log('👤 Creando usuarios...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  const adminUser = await prisma.user.create({
    data: {
      firstName: 'Admin',
      lastName: 'System',
      email: 'admin@carmeet.com',
      password: hashedPassword,
      roleId: adminRole.id,
    },
  });

  const organizerUser = await prisma.user.create({
    data: {
      firstName: 'Carlos',
      lastName: 'Organizer',
      email: 'organizer@carmeet.com',
      password: hashedPassword,
      roleId: organizerRole.id,
    },
  });

  const participantUser = await prisma.user.create({
    data: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@carmeet.com',
      password: hashedPassword,
      roleId: participantRole.id,
    },
  });

  console.log(`✅ 3 usuarios creados`);
  console.log('\n📧 Credenciales de prueba:');
  console.log('  Admin: admin@carmeet.com / password123');
  console.log('  Organizer: organizer@carmeet.com / password123');
  console.log('  Participant: john@carmeet.com / password123');
  console.log('\n🎉 Seed completado!');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
