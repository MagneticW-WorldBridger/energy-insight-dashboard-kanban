// Minimal webhook endpoint to create leads via POST
import { Pool } from '@neondatabase/serverless';
import ws from 'ws';

let pool;

async function initDb() {
  if (pool) return;
  (await import('@neondatabase/serverless')).neonConfig.webSocketConstructor = ws;
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!connectionString) throw new Error('DATABASE_URL o POSTGRES_URL no está definido');
  pool = new Pool({ connectionString, max: 1, connectionTimeoutMillis: 5000 });
}

export default async (req, res) => {
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'self' https://woodstock-technical-chatbot-full-fe.vercel.app;");
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  try {
    await initDb();
    const body = req.body || {};
    const name = body.name || 'Unknown';
    const username = body.username || `@unknown_${Date.now()}`;
    const tags = Array.isArray(body.tags) ? body.tags : [];
    const columnId = body.columnId || 'newLeads';
    const contactInfo = body.contactInfo ? JSON.stringify(body.contactInfo) : null;

    const { rows } = await pool.query(
      `INSERT INTO leads (name, username, time, tags, assessment, column_id, contact_info)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [name, username, new Date(), JSON.stringify(tags), 'Pending', columnId, contactInfo]
    );

    return res.status(201).json({ success: true, message: 'Lead created successfully', lead: rows[0] });
  } catch (err) {
    console.error('[API:webhook/leads] Error:', err);
    return res.status(500).json({ success: false, message: 'Error processing webhook', error: String(err?.message || err) });
  }
};


