# spoke! — Inteligencia Comercial Omnicanal

Este proyecto inicializa el ecosistema comercial inteligente y omnicanal de **spoke!**. 
Incluye una estructura unificada en Node.js para el backend y una interfaz moderna con modo Día/Noche dinámico y diseño de Glassmorphism para el CRM de los asesores comerciales.

## Estructura del Proyecto

- `backend/`: Código del servidor, conexión a base de datos y migraciones PostgreSQL.
- `frontend/`: Archivos estáticos de la interfaz Kanban del CRM (HTML, CSS, JS).

## Requisitos Previos

- Node.js (v18 o superior)
- PostgreSQL

## Configuración Inicial

1. Clona o abre el proyecto en tu entorno de desarrollo.
2. Copia el archivo `.env.example` a un nuevo archivo llamado `.env`:
   ```bash
   cp .env.example .env
   ```
3. Edita las variables de entorno en `.env` con las credenciales de tu base de datos de PostgreSQL.

4. Instala las dependencias:
   ```bash
   npm install
   ```

5. Ejecuta las migraciones de la base de datos para crear el esquema multi-tenant:
   ```bash
   npm run migrate
   ```

6. Inicia el servidor de desarrollo:
   ```bash
   npm start
   ```

El servidor estará corriendo en `http://localhost:3000` (o el puerto configurado en el archivo `.env`).
