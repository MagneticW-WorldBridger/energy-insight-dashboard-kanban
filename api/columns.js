// Adaptador de API para endpoints de columnas - Compatible con Vercel Serverless Functions
import { Pool } from '@neondatabase/serverless';
import ws from 'ws';

// Configuración básica 
let pool;
let storage;

// Inicialización perezosa (solo cuando se necesita)
async function initDb() {
  if (pool) return;
  
  try {
    // Configurar WebSocket para NeonDB
    (await import('@neondatabase/serverless')).neonConfig.webSocketConstructor = ws;
    
    // Obtener URL de conexión
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL o POSTGRES_URL no está definido');
    }
    
    // Crear pool optimizado para serverless
    pool = new Pool({ 
      connectionString,
      max: 1,
      connectionTimeoutMillis: 5000
    });
    
    // Verificar conexión
    const client = await pool.connect();
    try {
      await client.query('SELECT 1');
      console.log('Conexión a la base de datos establecida');
    } finally {
      client.release();
    }
    
    // Crear un wrapper para las consultas de storage
    storage = {
      // Obtener todas las columnas
      async getColumns() {
        const { rows } = await pool.query('SELECT * FROM columns ORDER BY "order" ASC');
        return rows;
      },
      
      // Obtener una columna específica
      async getColumn(id) {
        const { rows } = await pool.query('SELECT * FROM columns WHERE id = $1', [id]);
        return rows[0];
      }
    };
    
  } catch (error) {
    console.error('Error de inicialización de la base de datos:', error);
    throw error;
  }
}

// Handler principal
export default async (req, res) => {
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'self' https://woodstock-technical-chatbot-full-fe.vercel.app;");
  // Optional agent auth
  const agentKey = req.headers['x-agent-key'] || req.headers['X-Agent-Key'] || req.headers['xi-api-key'] || req.headers['Xi-Api-Key'];
  if (process.env.ELEVENLABS_API_KEY) {
    if (!agentKey || agentKey !== process.env.ELEVENLABS_API_KEY) {
      return res.status(403).json({ message: 'Forbidden' });
    }
  }
  console.log('[API:columns] Request received', { 
    url: req.url,
    method: req.method,
    headers: req.headers
  });
  
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Responder a OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    // Inicializar DB
    await initDb();
    
    // GET /api/columns
    if (req.method === 'GET') {
      console.log('[API:columns] Getting all columns');
      const columns = await storage.getColumns();
      console.log(`[API:columns] Retrieved ${columns.length} columns`);
      return res.status(200).json(columns);
    }
    
    // Método no permitido
    console.error(`[API:columns] Method not allowed: ${req.method}`);
    return res.status(405).json({ message: 'Method not allowed' });
    
  } catch (error) {
    console.error('[API:columns] Error:', error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message
    });
  }
}; 