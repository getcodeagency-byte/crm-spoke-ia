// /api/health.js
import { query } from '../lib/database';

export default async function handler(req, res) {
  try {
    const result = await query('SELECT NOW()');
    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: result.rows[0].now,
      serverTime: new Date()
    });
  } catch (error) {
    console.error('Error de conexión a la base de datos:', error.message);
    res.status(500).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
      serverTime: new Date()
    });
  }
}
