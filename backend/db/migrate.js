const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');

async function runMigrations() {
  console.log('=== Iniciando Migraciones de spoke! ===');
  const client = await pool.connect();
  try {
    // 1. Ejecutar el esquema principal
    const schemaPath = path.join(__dirname, 'migrations', '001_init_schema.sql');
    console.log(`Leyendo archivo de esquema: ${schemaPath}`);
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Ejecutando script de esquema...');
    await client.query(schemaSql);
    console.log('✅ Esquema creado con éxito.');

    // 2. Ejecutar datos semilla (seed) si existe el archivo
    const seedPath = path.join(__dirname, 'migrations', 'seed.sql');
    if (fs.existsSync(seedPath)) {
      console.log(`Leyendo archivo de semilla: ${seedPath}`);
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      
      console.log('Cargando datos semilla...');
      await client.query(seedSql);
      console.log('✅ Datos semilla cargados con éxito.');
    } else {
      console.log('ℹ️ No se encontró archivo de semilla (seed.sql). Omitiendo.');
    }

    console.log('=== Migraciones Finalizadas con Éxito ===');
  } catch (error) {
    console.error('❌ Error durante la ejecución de las migraciones:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();
