import prisma from '../configs/database.js';

async function testConnection() {
  console.log('🔌 Probando conexión a la base de datos...\n');
  
  try {
    // Intenta conectar y hacer una consulta simple
    await prisma.$connect();
    console.log('✅ Conexión exitosa a la base de datos!');
    
    // Muestra información de la base de datos
    const result = await prisma.$queryRaw`SELECT version()`;
    console.log('📊 Información de PostgreSQL:', result);
    
  } catch (error) {
    console.error('❌ Error al conectar:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('\n👋 Desconectado de la base de datos');
  }
}

testConnection();

