// @ts-check
import fetch from 'node-fetch';
import FormData from 'form-data';

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export default async function handler(req, res) {
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'self' https://woodstock-technical-chatbot-full-fe.vercel.app;");
  // Configurar CORS para permitir solicitudes desde cualquier origen
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Manejar las solicitudes OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Solo permitir solicitudes POST
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: `Método ${req.method} no permitido` 
    });
  }
  
  try {
    // Extraer parámetros del cuerpo de la solicitud
    const { userId, procedures } = req.body;
    
    // Validar que tengamos todos los datos necesarios
    if (!userId || !procedures) {
      return res.status(400).json({ 
        success: false, 
        error: 'Se requieren userId y procedures' 
      });
    }
    
    console.log(`[INFO] Enviando procedimientos para usuario ${userId}: ${procedures}`);
    
    // SOLICITUD 1: Actualizar el campo personalizado
    
    // Crear un FormData para enviar a la API
    const formData = new FormData();
    formData.append('value', procedures);
    
    // El ID del campo personalizado
    const customFieldId = '796590';
    
    // Enviar la primera solicitud a la API de Botfanatics
    const customFieldResponse = await fetch(
      `https://app.botfanatics.com/api/users/${userId}/custom_fields/${customFieldId}`,
      {
        method: 'POST',
        headers: {
          'X-ACCESS-TOKEN': '1604230.OtMye2oK4ze8HqZmfMxC5wYq5O0cj4UjmDp4DGVr7aUHOkNS9V'
        },
        body: formData
      }
    );
    
    // Obtener la respuesta
    const customFieldData = await customFieldResponse.json();
    
    // Verificar si la primera solicitud fue exitosa
    if (!customFieldResponse.ok || !customFieldData.success) {
      console.error('[ERROR] Error al actualizar el campo personalizado:', customFieldData);
      return res.status(customFieldResponse.status || 500).json(customFieldData);
    }
    
    console.log(`[INFO] Campo personalizado actualizado correctamente para el usuario ${userId}`);
    
    // SOLICITUD 2: Enviar el flow al usuario
    
    // ID del flow que queremos enviar
    const flowId = '1743705034738';
    
    console.log(`[INFO] Enviando flow ${flowId} al usuario ${userId}`);
    
    // Enviar la segunda solicitud a la API de Botfanatics
    const flowResponse = await fetch(
      `https://app.botfanatics.com/api/users/${userId}/send/${flowId}`,
      {
        method: 'POST',
        headers: {
          'X-ACCESS-TOKEN': '1604230.OtMye2oK4ze8HqZmfMxC5wYq5O0cj4UjmDp4DGVr7aUHOkNS9V',
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Obtener la respuesta
    const flowData = await flowResponse.json();
    
    // Verificar si la segunda solicitud fue exitosa
    if (!flowResponse.ok || !flowData.success) {
      console.error('[ERROR] Error al enviar el flow:', flowData);
      return res.status(flowResponse.status || 500).json({
        customField: { success: true },
        flow: flowData,
        success: false,
        error: 'Error al enviar el flow'
      });
    }
    
    console.log(`[INFO] Flow enviado correctamente al usuario ${userId}`);
    
    // Devolver ambas respuestas al cliente
    return res.status(200).json({
      success: true,
      customField: customFieldData,
      flow: flowData
    });
    
  } catch (error) {
    console.error('[ERROR] Error al procesar la solicitud:', error);
    
    return res.status(500).json({ 
      success: false, 
      error: 'Error al procesar la solicitud',
      message: error.message
    });
  }
} 