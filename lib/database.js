import { Pool } from 'pg';
import 'dotenv/config';

// Configuración de la conexión a PostgreSQL utilizando variables de entorno
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // Opciones de producción recomendadas
  max: 20, // máximo número de clientes en el pool
  idleTimeoutMillis: 30000, // cuánto tiempo permanece inactivo un cliente antes de cerrarse
  connectionTimeoutMillis: 2000, // cuánto tiempo esperar para conectarse antes de un error
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Comprobar la conexión inicial a la base de datos
pool.on('error', (err) => {
  console.error('Error inesperado en el cliente del pool de PostgreSQL:', err);
});

export const query = (text, params) => pool.query(text, params);
export { pool };
