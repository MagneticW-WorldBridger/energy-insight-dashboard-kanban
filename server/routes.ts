import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for leads
  
  // Get all leads
  app.get('/api/leads', async (req, res) => {
    try {
      const leads = await storage.getLeads();
      res.json(leads);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching leads' });
    }
  });

  // Get leads by column
  app.get('/api/columns/:columnId/leads', async (req, res) => {
    try {
      const { columnId } = req.params;
      const leads = await storage.getLeadsByColumn(columnId);
      res.json(leads);
    } catch (error) {
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
      res.status(500).json({ message: 'Error fetching lead' });
    }
  });

  // Get all columns
  app.get('/api/columns', async (req, res) => {
    try {
      const columns = await storage.getColumns();
      res.json(columns);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching columns' });
    }
  });

  // Get stats
  app.get('/api/stats', async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching stats' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
