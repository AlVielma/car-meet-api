# 🚗 Car Meet API

API REST para gestionar eventos de car meets (reuniones de autos), permitiendo a usuarios registrar sus vehículos, organizar eventos, participar y votar.


## 🚀 Instalación

### 1. Instalar dependencias

```bash
npm install
```

### 2. Sincronizar base de datos

```bash
npm run prisma:migrate
```

**Nota:** Este comando automáticamente ejecuta `prisma:generate`, por lo que no necesitas ejecutarlo por separado.

### 3. Poblar la base de datos (Opcional)

Para poblar la base de datos con datos de prueba:

```bash
npm run prisma:seed
```

### 4. Probar la conexión

```bash
npm run db:test
```

Si todo está correcto, deberías ver: ✅ Conexión exitosa a la base de datos!

## 🎯 Ejecutar el proyecto

### Modo desarrollo (con hot reload)

```bash
npm run dev
```
