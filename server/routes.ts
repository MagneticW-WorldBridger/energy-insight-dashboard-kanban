import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertLeadSchema, insertColumnSchema } from "@shared/schema";

// For webhook authentication
const apiKeySchema = z.object({
  apiKey: z.string().min(1)
});

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for leads
  
  // Get all leads
  app.get('/api/leads', async (req, res) => {
    try {
      const leads = await storage.getLeads();
      res.json(leads);
    } catch (error) {
      console.error('Error fetching leads:', error);
      res.status(500).json({ message: 'Error fetching leads' });
    }
  });

  // Create a new lead
  app.post('/api/leads', async (req, res) => {
    try {
      const validatedData = insertLeadSchema.parse(req.body);
      const lead = await storage.createLead(validatedData);
      res.status(201).json(lead);
    } catch (error) {
      console.error('Error creating lead:', error);
      res.status(400).json({ message: 'Invalid lead data', error });
    }
  });

  // Update a lead
  app.patch('/api/leads/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertLeadSchema.partial().parse(req.body);
      const updatedLead = await storage.updateLead(parseInt(id), validatedData);
      
      if (!updatedLead) {
        return res.status(404).json({ message: 'Lead not found' });
      }
      
      res.json(updatedLead);
    } catch (error) {
      console.error('Error updating lead:', error);
      res.status(400).json({ message: 'Invalid lead data', error });
    }
  });

  // Delete a lead
  app.delete('/api/leads/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteLead(parseInt(id));
      
      if (!success) {
        return res.status(404).json({ message: 'Lead not found' });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting lead:', error);
      res.status(500).json({ message: 'Error deleting lead' });
    }
  });

  // Get leads by column
  app.get('/api/columns/:columnId/leads', async (req, res) => {
    try {
      const { columnId } = req.params;
      const leads = await storage.getLeadsByColumn(columnId);
      res.json(leads);
    } catch (error) {
      console.error('Error fetching leads by column:', error);
      res.status(500).json({ message: 'Error fetching leads by column' });
    }
  });

  // Get a specific lead
  app.get('/api/leads/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const lead = await storage.getLead(parseInt(id));
      
      if (!lead) {
        return res.status(404).json({ message: 'Lead not found' });
      }
      
      res.json(lead);
    } catch (error) {
      console.error('Error fetching lead:', error);
      res.status(500).json({ message: 'Error fetching lead' });
    }
  });

  // Get all columns
  app.get('/api/columns', async (req, res) => {
    try {
      const columns = await storage.getColumns();
      res.json(columns);
    } catch (error) {
      console.error('Error fetching columns:', error);
      res.status(500).json({ message: 'Error fetching columns' });
    }
  });

  // Create a new column
  app.post('/api/columns', async (req, res) => {
    try {
      const validatedData = insertColumnSchema.parse(req.body);
      const column = await storage.createColumn(validatedData);
      res.status(201).json(column);
    } catch (error) {
      console.error('Error creating column:', error);
      res.status(400).json({ message: 'Invalid column data', error });
    }
  });

  // Update a column
  app.patch('/api/columns/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertColumnSchema.partial().parse(req.body);
      const updatedColumn = await storage.updateColumn(id, validatedData);
      
      if (!updatedColumn) {
        return res.status(404).json({ message: 'Column not found' });
      }
      
      res.json(updatedColumn);
    } catch (error) {
      console.error('Error updating column:', error);
      res.status(400).json({ message: 'Invalid column data', error });
    }
  });

  // Delete a column
  app.delete('/api/columns/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteColumn(id);
      
      if (!success) {
        return res.status(404).json({ message: 'Column not found' });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting column:', error);
      res.status(500).json({ message: 'Error deleting column' });
    }
  });

  // Get stats
  app.get('/api/stats', async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ message: 'Error fetching stats' });
    }
  });

  // WEBHOOK ENDPOINT
  // This endpoint receives lead data from external services
  app.post('/api/webhook/leads', validateApiKey, async (req, res) => {
    try {
      const webhookData = req.body;
      
      // Process the webhook data and create a new lead
      const newLead = await storage.processWebhook(webhookData);
      
      res.status(201).json({ 
        success: true, 
        message: 'Lead created successfully', 
        lead: newLead 
      });
    } catch (error) {
      console.error('Webhook processing error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error processing webhook',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // API Key validation middleware for webhooks
  function validateApiKey(req: Request, res: Response, next: Function) {
    try {
      // Skip validation in development environment
      if (process.env.NODE_ENV === 'development') {
        return next();
      }
      
      // Check for API key in headers
      const apiKey = req.headers['x-api-key'];
      
      // Validate API key
      const validation = apiKeySchema.safeParse({ apiKey });
      
      if (!validation.success) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid or missing API key' 
        });
      }
      
      // Check if the API key matches our expected value
      if (apiKey !== process.env.WEBHOOK_API_KEY) {
        return res.status(403).json({ 
          success: false, 
          message: 'Unauthorized' 
        });
      }
      
      next();
    } catch (error) {
      console.error('API key validation error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error validating API key' 
      });
    }
  }

  const httpServer = createServer(app);

  return httpServer;
}
