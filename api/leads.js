// Adaptador de API para endpoints de leads - Compatible con Vercel Serverless Functions
import { Pool } from '@neondatabase/serverless';
import ws from 'ws';
import { OpenAI } from 'openai';

// Configuración básica 
let pool;
let db;
let storage;

// Inicialización perezosa (solo cuando se necesita)
async function initDb() {
  if (pool) return;
  
  try {
    // Configurar WebSocket para NeonDB
    (await import('@neondatabase/serverless')).neonConfig.webSocketConstructor = ws;
    
    // Obtener URL de conexión (prioriza DATABASE_URL)
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL o POSTGRES_URL no está definido');
    }
    
    // Crear pool optimizado para serverless
    pool = new Pool({ 
      connectionString,
      max: 1,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30000
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
      // Obtener todos los leads
      async getLeads() {
        const { rows } = await pool.query('SELECT * FROM leads ORDER BY time DESC');
        return rows;
      },
      
      // Obtener un lead específico
      async getLead(id) {
        const { rows } = await pool.query('SELECT * FROM leads WHERE id = $1', [id]);
        return rows[0];
      },
      
      // Crear un nuevo lead
      async createLead(leadData) {
        // Preparar datos para inserción SQL
        const contactInfo = leadData.contactInfo ? leadData.contactInfo : null;
        
        const { rows } = await pool.query(
          `INSERT INTO leads 
           (name, username, time, tags, assessment, column_id, contact_info) 
           VALUES ($1, $2, $3, $4, $5, $6, $7) 
           RETURNING *`,
          [
            leadData.name,
            leadData.username || `@${leadData.name.toLowerCase().replace(/\s+/g, '_')}`,
            new Date(),
            JSON.stringify(leadData.tags || []),
            leadData.assessment || 'Pending',
            leadData.columnId || 'newLeads',
            contactInfo
          ]
        );
        
        return rows[0];
      },
      
      // Actualizar un lead existente
      async updateLead(id, updateData) {
        // Construir consulta dinámica basada en los campos a actualizar
        const updates = [];
        const values = [id];  // El primer parámetro es el id
        let paramCounter = 2; // Comenzamos en $2
        
        // Campos permitidos para actualizar
        const allowedFields = {
          'columnId': 'column_id',
          'smsStatus': 'sms_status',
          'sendTime': 'send_time',
          'verifiedTime': 'verified_time',
          'consultDate': 'consult_date',
          'followUpDate': 'follow_up_date',
          'callScheduled': 'call_scheduled',
          'callNotes': 'call_notes',
          'tags': 'tags',
          'notes': 'notes',
          'questionnaire': 'questionnaire',
          'demographic': 'demographic',
          'score': 'score',
          'qualScore': 'qual_score',
          'priority': 'priority',
          'financing': 'financing',
          'reason': 'reason',
          'assessment': 'assessment',
          'messageHistory': 'message_history',
          'inboxLink': 'inbox_link',
          'convoHistory': 'convo_history',
          // New fields
          'age': 'age',
          'height': 'height',
          'weight': 'weight',
          'location': 'location',
          'healthInsurance': 'health_insurance',
          'serviceTimeframe': 'service_timeframe',
          'summary': 'summary'
        };
        
        // Construir partes de la consulta SQL
        for (const [key, value] of Object.entries(updateData)) {
          if (key in allowedFields) {
            const dbField = allowedFields[key];
            
            // JSON se guarda como texto
            if (['tags', 'questionnaire', 'demographic', 'assessment', 'convoHistory', 'messageHistory'].includes(key)) {
              updates.push(`${dbField} = $${paramCounter++}`);
              values.push(JSON.stringify(value));
            } 
            // Las fechas se manejan como timestamp
            else if (['sendTime', 'verifiedTime', 'consultDate', 'followUpDate'].includes(key)) {
              updates.push(`${dbField} = $${paramCounter++}`);
              // Si es un string, intentamos convertirlo a fecha
              values.push(value ? new Date(value) : null);
            }
            else {
              updates.push(`${dbField} = $${paramCounter++}`);
              values.push(value);
            }
          }
        }
        
        // Si hay cuestionario completo, analizar con OpenAI
        if (updateData.questionnaire) {
          const questionnaire = updateData.questionnaire;
          const answeredQuestions = Object.values(questionnaire).filter(Boolean).length;
          
          // Si todas las 15 preguntas están respondidas, llamar a OpenAI
          if (answeredQuestions === 15) {
            try {
              console.log('Analizando cuestionario completo con OpenAI');
              const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
              
              // Crear prompt para análisis de OpenAI
              const prompt = `
              I have a patient questionnaire about cosmetic surgery. The patient rated the following statements on a scale from 1 (strongly disagree) to 7 (strongly agree):

              1. It makes sense to have cosmetic surgery rather than spending years feeling bad about the way I look. - Rating: ${questionnaire.q1}
              2. Cosmetic surgery is a good thing because it can help me feel better about myself. - Rating: ${questionnaire.q2}
              3. Within next 2 months, I will end up having some cosmetic surgery. - Rating: ${questionnaire.q3}
              4. I am very unhappy with my physical appearance, and I am considering cosmetic surgery. - Rating: ${questionnaire.q4}
              5. I think cosmetic surgery can make me happier with the way I look, and I am willing to go for it. - Rating: ${questionnaire.q5}
              6. If I could have a cosmetic surgery done for a fair price, I would consider cosmetic surgery. - Rating: ${questionnaire.q6}
              7. If I knew there would be no negative side effects such as pain, I would like to try cosmetic surgery. - Rating: ${questionnaire.q7}
              8. I am constantly thinking about having cosmetic surgery. - Rating: ${questionnaire.q8}
              9. I would seriously consider having cosmetic surgery if my partner thought it, was a good idea. - Rating: ${questionnaire.q9}
              10. I would never have any kind of cosmetic surgery. - Rating: ${questionnaire.q10} (Note: This question is reverse-scored, meaning a low score indicates higher likelihood of having surgery)
              11. I would have cosmetic surgery to keep looking young. - Rating: ${questionnaire.q11}
              12. It would benefit my career, I will have cosmetic surgery. - Rating: ${questionnaire.q12}
              13. I am considering having cosmetic surgery as I think my partner would find me more attractive. - Rating: ${questionnaire.q13}
              14. Cosmetic surgery can be a big benefit to my self-image. - Rating: ${questionnaire.q14}
              15. I think Cosmetic procedure would make me more attractive to others, and that's why I will go for it. - Rating: ${questionnaire.q15}

              Analyze these responses and provide:

              1. Likelihood of having cosmetic surgery score (0-10 scale)
              2. Perceived benefits of cosmetic surgery score (0-10 scale)
              3. An overall assessment category: "High Intent", "Medium Intent", or "Low Intent"

              Note that question 10 is reverse-scored, meaning a low score indicates higher likelihood.
              
              Return ONLY a JSON object in this format:
              {
                "likelihood": number,
                "benefits": number,
                "overall": string
              }
              `;
              
              const response = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [{ role: "user", content: prompt }],
                response_format: { type: "json_object" },
                temperature: 0.3,
              });
              
              if (response.choices && response.choices[0] && response.choices[0].message.content) {
                const assessmentResult = JSON.parse(response.choices[0].message.content);
                
                // Almacenar el resultado en la actualización
                updates.push(`assessment = $${paramCounter++}`);
                values.push(JSON.stringify(assessmentResult));
                
                console.log(`Evaluación de OpenAI: ${JSON.stringify(assessmentResult)}`);
              }
            } catch (error) {
              console.error('Error analizando cuestionario con OpenAI:', error);
            }
          }
        }
        
        // Si no hay campos para actualizar, devolver lead actual
        if (updates.length === 0) {
          return await this.getLead(id);
        }
        
        // Ejecutar la consulta SQL
        const updateQuery = `
          UPDATE leads 
          SET ${updates.join(', ')} 
          WHERE id = $1 
          RETURNING *
        `;
        
        console.log(`Consulta SQL: ${updateQuery}`);
        console.log(`Valores: ${JSON.stringify(values)}`);
        
        const { rows } = await pool.query(updateQuery, values);
        return rows[0];
      },

      // Eliminar un lead
      async deleteLead(id) {
        const { rowCount } = await pool.query('DELETE FROM leads WHERE id = $1', [id]);
        return rowCount > 0;
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
  // Logs detallados para diagnosticar el request en Vercel
  console.log('[API:leads] Request details', { 
    url: req.url,
    method: req.method,
    path: req.path || 'not available',
    query: req.query || 'not available',
    params: req.params || 'not available',
    headers: {
      host: req.headers?.host,
      referer: req.headers?.referer,
      'content-type': req.headers?.['content-type']
    },
    body: req.body ? JSON.stringify(req.body).substring(0, 100) + '...' : 'empty'
  });
  
  // Función para convertir snake_case a camelCase
  const snakeToCamel = (str) => str.replace(/([-_][a-z])/g, group => group.toUpperCase().replace('-', '').replace('_', ''));
  
  // Función para convertir las claves de un objeto de snake_case a camelCase
  const convertToCamelCase = (obj) => {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
    
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = snakeToCamel(key);
      let value = obj[key];
      
      // Asegurar que siempre tenemos columnId (incluso si columnId es null pero column_id tiene valor)
      if (key === 'column_id') {
        acc['columnId'] = value; // Siempre asignar column_id a columnId
        acc[key] = value;
      } 
      // Este caso es para cuando tenemos columnId=null pero column_id con valor
      else if (key === 'columnId' && !value && obj['column_id']) {
        acc[key] = obj['column_id']; // Usar el valor de column_id
      }
      else {
        acc[camelKey] = value;
      }
      
      return acc;
    }, {});
  };
  
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Responder a OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    // Inicializar DB
    await initDb();
    
    // Detectar si es una solicitud para cambio de columna
    const isColumnUpdate = req.url.includes('/column');
    
    // GET /api/leads
    if (req.method === 'GET') {
      console.log('[API:leads] Getting all leads');
      // Support optional id query param
      let url;
      try { url = new URL(req.url, `https://${req.headers.host}`); } catch {}
      const idParam = url?.searchParams?.get('id');
      let leads = [];
      if (idParam) {
        const one = await storage.getLead(parseInt(idParam));
        leads = one ? [one] : [];
      } else {
        leads = await storage.getLeads();
      }
      
      // Convertir todos los leads a camelCase y asegurar que tienen columnId
      const formattedLeads = leads.map(lead => {
        const camelLead = convertToCamelCase(lead);
        
        // Si hay contactInfo, intentar parsearlo
        if (lead.contact_info && typeof lead.contact_info === 'string') {
          try {
            camelLead.contactInfo = JSON.parse(lead.contact_info);
          } catch (e) {
            console.warn('[API:leads] Error parsing contact_info:', e);
          }
        }
        // Parse assessment JSON string if present
        if (lead.assessment && typeof lead.assessment === 'string') {
          try {
            camelLead.assessment = JSON.parse(lead.assessment);
          } catch (e) {
            // ignore
          }
        }
        
        // Add the contact_info field directly to preserve the original data
        camelLead.contact_info = lead.contact_info;
        
        return camelLead;
      });
      
      return res.status(200).json(formattedLeads);
    }
    
    // POST /api/leads - Crear un nuevo lead
    if (req.method === 'POST') {
      console.log('[API:leads] Creating new lead');
      // Validar que hay name
      if (!req.body || !req.body.name) {
        return res.status(400).json({ message: 'Name is required' });
      }
      
      // Preparar datos de contacto
      let leadData = { ...req.body };
      
      // Extraer/procesar contactInfo si viene como campos separados
      if (req.body.email || req.body.phone) {
        const contactInfo = {};
        if (req.body.email) contactInfo.email = req.body.email;
        if (req.body.phone) contactInfo.phone = req.body.phone;
        
        leadData.contactInfo = JSON.stringify(contactInfo);
      }
      
      // Crear lead
      const lead = await storage.createLead(leadData);
      
      return res.status(201).json({
        id: lead.id,
        name: lead.name,
        contactInfo: lead.contact_info, // Nota: el DB devuelve snake_case
        message: 'Lead created successfully'
      });
    }
    
    // PATCH - Actualizar lead
    if (req.method === 'PATCH') {
      // Extraer ID usando múltiples métodos
      let id;
      
      // Método 1: Extraer del path usando expresión regular
      const idMatch = req.url.match(/\/leads\/(\d+)/);
      if (idMatch && idMatch[1]) {
        id = parseInt(idMatch[1]);
      } 
      // Método 2: Intentar extraer de los parámetros de consulta
      else {
        let qid;
        try {
          const u = new URL(req.url, `https://${req.headers.host}`);
          qid = u.searchParams.get('id');
        } catch {}
        if (qid) id = parseInt(qid);
      } 
      // Método 3: Fallback al método anterior
      if (!id) {
        const pathParts = req.url.split('/');
        const idIndex = pathParts.findIndex(part => /^\d+$/.test(part));
        if (idIndex !== -1) {
          id = parseInt(pathParts[idIndex]);
        }
      }

      console.log(`[API:leads] Extracted ID for PATCH: ${id}`, {
        url: req.url
      });
      
      if (!id || isNaN(id)) {
        console.error(`[API:leads] Invalid lead ID: ${id}`);
        return res.status(400).json({ message: 'Invalid lead ID' });
      }
      
      // Verificar que lead existe
      const existingLead = await storage.getLead(id);
      if (!existingLead) {
        console.error(`[API:leads] Lead not found: ${id}`);
        return res.status(404).json({ message: 'Lead not found' });
      }
      
      // Asegurar que el lead tenga columnId en camelCase
      if (existingLead && existingLead.column_id) {
        existingLead.columnId = existingLead.column_id;
      }
      
      let updateData = req.body;
      
      // Process tags if present - automatically split comma-separated values
      if (updateData.tags) {
        if (updateData.tags.length === 1 && typeof updateData.tags[0] === 'string' && updateData.tags[0].includes(',')) {
          // Split by comma and trim whitespace
          updateData.tags = updateData.tags[0].split(',').map(tag => tag.trim()).filter(Boolean);
          console.log('[API:leads] Split comma-separated tags:', updateData.tags);
        }
      }
      
      // If we have questionnaire data, merge it with existing data instead of replacing
      if (updateData.questionnaire) {
        // Get the existing questionnaire
        let existingQuestionnaire = {};
        try {
          if (existingLead.questionnaire) {
            existingQuestionnaire = typeof existingLead.questionnaire === 'string'
              ? JSON.parse(existingLead.questionnaire)
              : existingLead.questionnaire;
          }
        } catch (e) {
          console.error('[API:leads] Error parsing existing questionnaire:', e);
        }
        
        // Merge questionnaire data (new values override existing ones)
        updateData.questionnaire = {
          ...existingQuestionnaire,
          ...updateData.questionnaire
        };
        
        console.log('[API:leads] Merged questionnaire data:', updateData.questionnaire);
      }
      
      // Si es actualización de columna, extraer columnId del body
      if (isColumnUpdate) {
        console.log('[API:leads] Processing column update request:', req.body);
        
        // Si columnId no está en el body, intentar encontrarlo en formato alternativo
        if (!updateData.columnId && updateData.column) {
          updateData = { columnId: updateData.column };
        } else if (!updateData.columnId && updateData.id) {
          updateData = { columnId: updateData.id };
        }
        
        console.log('[API:leads] Extracted column data:', updateData);
      }
      
      console.log(`[API:leads] Lead found, updating with:`, updateData);
      
      // Actualizar lead
      const updatedLead = await storage.updateLead(id, updateData);
      
      // Convertir a camelCase para el frontend
      const camelCaseLead = convertToCamelCase(updatedLead);
      
      // Asegurar que columnId esté disponible para el frontend
      if (updatedLead) {
        camelCaseLead.columnId = updatedLead.column_id;
        
        // Si hay contactInfo, intentar parsearlo
        if (updatedLead.contact_info && typeof updatedLead.contact_info === 'string') {
          try {
            camelCaseLead.contactInfo = JSON.parse(updatedLead.contact_info);
          } catch (e) {
            console.warn('[API:leads] Error parsing contact_info:', e);
          }
        }
        // Parse assessment string if present
        if (updatedLead.assessment && typeof updatedLead.assessment === 'string') {
          try {
            camelCaseLead.assessment = JSON.parse(updatedLead.assessment);
          } catch (e) {
            // ignore
          }
        }
      }
      
      console.log(`[API:leads] Lead updated successfully:`, {
        id: camelCaseLead.id,
        columnId: camelCaseLead.columnId,
        name: camelCaseLead.name
      });
      
      return res.status(200).json({
        id: camelCaseLead.id,
        message: 'Lead updated successfully',
        lead: camelCaseLead
      });
    }
    
    // DELETE - Eliminar lead
    if (req.method === 'DELETE') {
      // Extraer ID usando múltiples métodos
      let id;
      
      // Método 1: Extraer del path usando expresión regular
      const idMatch = req.url.match(/\/leads\/(\d+)/);
      if (idMatch && idMatch[1]) {
        id = parseInt(idMatch[1]);
      } 
      // Método 2: Intentar extraer de los parámetros de consulta
      else if (req.query && req.query.id) {
        id = parseInt(req.query.id);
      } 
      // Método 3: Fallback al método anterior
      else {
        const pathParts = req.url.split('/');
        const idIndex = pathParts.findIndex(part => /^\d+$/.test(part));
        if (idIndex !== -1) {
          id = parseInt(pathParts[idIndex]);
        }
      }

      console.log(`[API:leads] Extracted ID for DELETE: ${id}`, {
        url: req.url
      });
      
      if (!id || isNaN(id)) {
        console.error(`[API:leads] Invalid lead ID for DELETE: ${req.url}`);
        return res.status(400).json({ message: 'Invalid lead ID' });
      }
      
      // Verificar que lead existe
      const existingLead = await storage.getLead(id);
      if (!existingLead) {
        console.error(`[API:leads] Lead not found for DELETE: ${id}`);
        return res.status(404).json({ message: 'Lead not found' });
      }
      
      // Eliminar lead
      const deleted = await storage.deleteLead(id);
      
      if (deleted) {
        console.log(`[API:leads] Lead deleted successfully: ${id}`);
        return res.status(204).end();
      } else {
        console.error(`[API:leads] Failed to delete lead: ${id}`);
        return res.status(500).json({ message: 'Failed to delete lead' });
      }
    }
    
    // Método no permitido
    return res.status(405).json({ message: 'Method not allowed' });
    
  } catch (error) {
    console.error('[API:leads] Error:', error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message
    });
  }
};