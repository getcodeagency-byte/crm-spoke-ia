const express = require('express');
const path = require('path');
const { query } = require('./config/database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON y solicitudes urlencoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// API para verificar la conexión a la base de datos (Health Check)
app.get('/api/health', async (req, res) => {
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
});

// Ruta comodín para redirigir al index.html si no coincide con las APIs
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`=============================================`);
  console.log(`🚀 Servidor de spoke! corriendo en el puerto ${PORT}`);
  console.log(`👉 Visita: http://localhost:${PORT}`);
  console.log(`=============================================`);
});
