import { 
  leads, 
  columns, 
  stats, 
  users,
  type Lead, 
  type Column, 
  type Stats, 
  type InsertLead, 
  type InsertColumn, 
  type InsertStats,
  type User,
  type InsertUser
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, asc } from "drizzle-orm";

// Storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Lead methods
  getLead(id: number): Promise<Lead | undefined>;
  getLeads(): Promise<Lead[]>;
  getLeadsByColumn(columnId: string): Promise<Lead[]>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: number, lead: Partial<InsertLead>): Promise<Lead | undefined>;
  deleteLead(id: number): Promise<boolean>;
  
  // Column methods
  getColumn(id: string): Promise<Column | undefined>;
  getColumns(): Promise<Column[]>;
  createColumn(column: InsertColumn): Promise<Column>;
  updateColumn(id: string, column: Partial<InsertColumn>): Promise<Column | undefined>;
  deleteColumn(id: string): Promise<boolean>;
  
  // Stats methods
  getStats(): Promise<Stats>;
  updateStats(stats: InsertStats): Promise<Stats>;

  // Webhook method
  processWebhook(webhookData: any): Promise<Lead>;
}

// Implement PostgreSQL database storage
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users)
      .where(eq(users.email, username)); // Note: Using email as username
    return user || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }
  
  // Lead methods
  async getLead(id: number): Promise<Lead | undefined> {
    const [lead] = await db.select().from(leads).where(eq(leads.id, id));
    return lead || undefined;
  }
  
  async getLeads(): Promise<Lead[]> {
    return await db.select().from(leads).orderBy(desc(leads.time));
  }
  
  async getLeadsByColumn(columnId: string): Promise<Lead[]> {
    return await db.select().from(leads)
      .where(eq(leads.columnId, columnId))
      .orderBy(desc(leads.time));
  }
  
  async createLead(lead: InsertLead): Promise<Lead> {
    const [newLead] = await db.insert(leads).values(lead).returning();
    return newLead;
  }
  
  async updateLead(id: number, updateData: Partial<InsertLead>): Promise<Lead | undefined> {
    const [updatedLead] = await db.update(leads)
      .set(updateData)
      .where(eq(leads.id, id))
      .returning();
    
    return updatedLead || undefined;
  }
  
  async deleteLead(id: number): Promise<boolean> {
    const result = await db.delete(leads).where(eq(leads.id, id));
    // Handle case when rowCount might be null
    return result.rowCount ? result.rowCount > 0 : false;
  }
  
  // Column methods
  async getColumn(id: string): Promise<Column | undefined> {
    const [column] = await db.select().from(columns).where(eq(columns.id, id));
    return column || undefined;
  }
  
  async getColumns(): Promise<Column[]> {
    return await db.select().from(columns).orderBy(asc(columns.order));
  }
  
  async createColumn(column: InsertColumn): Promise<Column> {
    const [newColumn] = await db.insert(columns).values(column).returning();
    return newColumn;
  }
  
  async updateColumn(id: string, updateData: Partial<InsertColumn>): Promise<Column | undefined> {
    const [updatedColumn] = await db.update(columns)
      .set(updateData)
      .where(eq(columns.id, id))
      .returning();
    
    return updatedColumn || undefined;
  }
  
  async deleteColumn(id: string): Promise<boolean> {
    const result = await db.delete(columns).where(eq(columns.id, id));
    // Handle case when rowCount might be null
    return result.rowCount ? result.rowCount > 0 : false;
  }
  
  // Stats methods
  async getStats(): Promise<Stats> {
    const [existingStats] = await db.select().from(stats);
    
    if (existingStats) {
      return existingStats;
    }
    
    // Create default stats if none exist
    const defaultStats: InsertStats = {
      totalLeads: 0,
      newLeadsToday: 0,
      consultsBooked: 0,
      smsResponseRate: 0
    };
    
    const [newStats] = await db.insert(stats).values(defaultStats).returning();
    return newStats;
  }
  
  async updateStats(newStats: InsertStats): Promise<Stats> {
    const [existingStats] = await db.select().from(stats);
    
    if (existingStats) {
      const [updatedStats] = await db.update(stats)
        .set(newStats)
        .where(eq(stats.id, existingStats.id))
        .returning();
      
      return updatedStats;
    } else {
      const [createdStats] = await db.insert(stats).values(newStats).returning();
      return createdStats;
    }
  }

  // Webhook handler
  async processWebhook(webhookData: any): Promise<Lead> {
    // Default to 'newLeads' column if not specified
    const columnId = webhookData.columnId || 'newLeads';
    
    // Process incoming webhook data to match our Lead schema
    const leadData: InsertLead = {
      name: webhookData.name || 'Unknown',
      username: webhookData.username || `@unknown_${Date.now()}`,
      time: webhookData.time ? new Date(webhookData.time) : new Date(),
      tags: webhookData.tags || [],
      avatar: webhookData.avatar || null,
      assessment: webhookData.assessment || 'Pending',
      columnId: columnId,
      // Additional fields
      smsStatus: webhookData.smsStatus,
      sendTime: webhookData.sendTime,
      verifiedTime: webhookData.verifiedTime,
      score: webhookData.score,
      qualScore: webhookData.qualScore,
      priority: webhookData.priority,
      consultDate: webhookData.consultDate,
      financing: webhookData.financing,
      reason: webhookData.reason,
      notes: webhookData.notes,
      questionnaire: webhookData.questionnaire,
      demographic: webhookData.demographic,
      contactInfo: webhookData.contactInfo,
      qualificationAnswers: webhookData.qualificationAnswers,
      consultation: webhookData.consultation,
      messageHistory: webhookData.messageHistory,
      qualificationScore: webhookData.qualificationScore || 0,
      followUpDate: webhookData.followUpDate,
      callScheduled: webhookData.callScheduled || false,
      callNotes: webhookData.callNotes,
    };
    
    // Create new lead in database
    const [newLead] = await db.insert(leads).values(leadData).returning();
    
    // Update stats
    await this.updateLeadStats();
    
    return newLead;
  }
  
  // Helper method to update stats based on current leads
  private async updateLeadStats(): Promise<void> {
    // Count total leads
    const [totalResult] = await db.select({ count: sql`count(*)` }).from(leads);
    const totalLeads = Number(totalResult?.count || 0);
    
    // Count new leads created today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [newLeadsResult] = await db.select({ count: sql`count(*)` })
      .from(leads)
      .where(sql`time >= ${today.toISOString()}`);
    const newLeadsToday = Number(newLeadsResult?.count || 0);
    
    // Count consults booked
    const [consultsResult] = await db.select({ count: sql`count(*)` })
      .from(leads)
      .where(and(
        sql`consult_date IS NOT NULL`,
        sql`column_id = 'qualified'`
      ));
    const consultsBooked = Number(consultsResult?.count || 0);
    
    // Calculate SMS response rate (simplified)
    // This is a placeholder calculation - you might need to adjust based on your specific SMS response tracking
    const [smsDeliveredResult] = await db.select({ count: sql`count(*)` })
      .from(leads)
      .where(eq(leads.smsStatus, 'Delivered'));
    const smsDelivered = Number(smsDeliveredResult?.count || 0);
    
    const [smsRespondedResult] = await db.select({ count: sql`count(*)` })
      .from(leads)
      .where(and(
        eq(leads.smsStatus, 'Delivered'),
        sql`column_id IN ('verified', 'qualified')`
      ));
    const smsResponded = Number(smsRespondedResult?.count || 0);
    
    const smsResponseRate = smsDelivered > 0 ? Math.round((smsResponded / smsDelivered) * 100) : 0;
    
    // Update stats
    await this.updateStats({
      totalLeads,
      newLeadsToday,
      consultsBooked,
      smsResponseRate
    });
  }
}

export const storage = new DatabaseStorage();
