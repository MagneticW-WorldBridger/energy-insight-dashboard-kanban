// Adaptador de API para endpoints de estadísticas - Compatible con Vercel Serverless Functions
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
      // Obtener estadísticas
      async getStats() {
        // Primero actualizar las estadísticas 
        await this.updateLeadStats();
        
        // Luego obtener estadísticas existentes
        const { rows } = await pool.query('SELECT * FROM stats LIMIT 1');
        
        // Si hay estadísticas, devolverlas
        if (rows.length > 0) {
          return rows[0];
        }
        
        // Si no hay estadísticas, crear estadísticas por defecto
        const defaultStats = {
          total_leads: 0,
          new_leads_today: 0,
          consults_booked: 0,
          sms_response_rate: 0
        };
        
        const { rows: newStatsRows } = await pool.query(
          `INSERT INTO stats 
           (total_leads, new_leads_today, consults_booked, sms_response_rate) 
           VALUES ($1, $2, $3, $4) 
           RETURNING *`,
          [
            defaultStats.total_leads,
            defaultStats.new_leads_today,
            defaultStats.consults_booked,
            defaultStats.sms_response_rate
          ]
        );
        
        return newStatsRows[0];
      },
      
      // Función para actualizar estadísticas en tiempo real
      async updateLeadStats() {
        try {
          // Contar total de leads
          const { rows: totalResult } = await pool.query('SELECT COUNT(*) as count FROM leads');
          const totalLeads = Number(totalResult[0]?.count || 0);
          
          // Contar nuevos leads creados hoy
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const todayIsoString = today.toISOString();
          
          const { rows: newLeadsResult } = await pool.query(
            'SELECT COUNT(*) as count FROM leads WHERE time >= $1',
            [todayIsoString]
          );
          const newLeadsToday = Number(newLeadsResult[0]?.count || 0);
          
          // Obtener estadísticas existentes
          const { rows: existingStats } = await pool.query('SELECT * FROM stats LIMIT 1');
          
          if (existingStats.length > 0) {
            // Actualizar estadísticas existentes
            await pool.query(
              `UPDATE stats SET 
               total_leads = $1, 
               new_leads_today = $2,
               updated_at = CURRENT_TIMESTAMP
               WHERE id = $3`,
              [
                totalLeads,
                newLeadsToday,
                existingStats[0].id
              ]
            );
          } else {
            // Crear nuevas estadísticas
            await pool.query(
              `INSERT INTO stats 
               (total_leads, new_leads_today, consults_booked, sms_response_rate) 
               VALUES ($1, $2, 0, 0)`,
              [totalLeads, newLeadsToday]
            );
          }
        } catch (error) {
          console.error('Error updating lead stats:', error);
          // No lanzamos el error para no interrumpir el flujo principal
        }
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
  console.log("[DEBUG] Endpoint /api/stats invocado en Vercel:", { 
    method: req.method,
    headers: req.headers,
    url: req.url
  });
  
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Responder a OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    console.log('[DEBUG] Respondiendo a OPTIONS request');
    return res.status(200).end();
  }
  
  try {
    // Inicializar DB
    console.log('[DEBUG] Inicializando base de datos');
    await initDb();
    console.log('[DEBUG] Base de datos inicializada correctamente');
    
    // GET /api/stats
    if (req.method === 'GET') {
      console.log('[DEBUG] Procesando GET request en /api/stats');
      try {
        // 1. Contar total de leads en la base de datos
        console.log('[DEBUG] Contando leads totales');
        const { rows: totalResult } = await pool.query('SELECT COUNT(*) as count FROM leads');
        const totalLeads = Number(totalResult[0]?.count || 0);
        console.log(`[DEBUG] Total leads encontrados: ${totalLeads}, tipo: ${typeof totalLeads}`);
        
        // 2. Contar leads creados hoy
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayIsoString = today.toISOString();
        console.log(`[DEBUG] Fecha para filtrar leads de hoy: ${todayIsoString}`);
        
        const { rows: newLeadsResult } = await pool.query(
          'SELECT COUNT(*) as count FROM leads WHERE time >= $1',
          [todayIsoString]
        );
        const newLeadsToday = Number(newLeadsResult[0]?.count || 0);
        console.log(`[DEBUG] Leads creados hoy: ${newLeadsToday}, tipo: ${typeof newLeadsToday}`);
        
        // 3. Obtener estadísticas existentes
        console.log('[DEBUG] Obteniendo estadísticas existentes');
        const { rows: statsRows } = await pool.query('SELECT * FROM stats LIMIT 1');
        console.log('[DEBUG] Estadísticas actuales:', statsRows[0] || 'No existen estadísticas');
        
        let stats;
        
        if (statsRows.length > 0) {
          // 4. Actualizar estadísticas con valores calculados
          console.log('[DEBUG] Actualizando estadísticas existentes');
          await pool.query(
            `UPDATE stats SET 
             total_leads = $1, 
             new_leads_today = $2,
             updated_at = CURRENT_TIMESTAMP
             WHERE id = $3`,
            [totalLeads, newLeadsToday, statsRows[0].id]
          );
          console.log('[DEBUG] Estadísticas actualizadas correctamente');
          
          // 5. Devolver los datos actualizados
          stats = {
            ...statsRows[0],
            total_leads: totalLeads,
            new_leads_today: newLeadsToday
          };
        } else {
          // Si no existen estadísticas, crearlas
          console.log('[DEBUG] Creando nuevas estadísticas');
          const { rows: newStatsRows } = await pool.query(
            `INSERT INTO stats 
             (total_leads, new_leads_today, consults_booked, sms_response_rate) 
             VALUES ($1, $2, 0, 0) 
             RETURNING *`,
            [totalLeads, newLeadsToday]
          );
          stats = newStatsRows[0];
          console.log('[DEBUG] Nuevas estadísticas creadas:', stats);
        }
        
        console.log('[DEBUG] Preparando respuesta con estadísticas:', stats);
        console.log('[DEBUG] Verificando tipos de datos enviados:', {
          total_leads: typeof stats.total_leads, 
          new_leads_today: typeof stats.new_leads_today,
          total_leads_value: stats.total_leads,
          new_leads_today_value: stats.new_leads_today
        });
        
        // Asegurar que los valores son numéricos antes de enviar
        const responseStats = {
          ...stats,
          total_leads: Number(stats.total_leads),
          new_leads_today: Number(stats.new_leads_today),
          consults_booked: Number(stats.consults_booked || 0),
          sms_response_rate: Number(stats.sms_response_rate || 0)
        };
        
        console.log('[DEBUG] Enviando respuesta con estadísticas convertidas:', responseStats);
        return res.status(200).json(responseStats);
      } catch (error) {
        console.error('[DEBUG] Error procesando estadísticas en Vercel:', error);
        return res.status(500).json({ 
          message: 'Error calculando estadísticas', 
          error: error.message,
          stack: error.stack
        });
      }
    }
    
    // Método no permitido
    console.log(`[DEBUG] Método no permitido: ${req.method}`);
    return res.status(405).json({ message: 'Method not allowed' });
    
  } catch (error) {
    console.error('[DEBUG] Error general en API de estadísticas:', error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message,
      stack: error.stack
    });
  }
}; 