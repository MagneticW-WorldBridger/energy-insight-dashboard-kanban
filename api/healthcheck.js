// @ts-nocheck
// API de diagnóstico básico

// Healthcheck endpoint compatible con Vercel
export default async (req, res) => {
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'self' https://woodstock-technical-chatbot-full-fe.vercel.app;");
    console.log('Healthcheck endpoint called', { 
      url: req.url,
      method: req.method,
      headers: req.headers,
      env: process.env.NODE_ENV
    });
    
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Responder a OPTIONS (preflight)
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    // GET /api/healthcheck
    if (req.method === 'GET') {
      return res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        message: 'API is running',
        version: '1.0'
      });
    }
    
    // Método no permitido
    return res.status(405).json({ message: 'Method not allowed' });
  }; 