import { 
  leads, 
  columns, 
  stats, 
  type Lead, 
  type Column, 
  type Stats, 
  type InsertLead, 
  type InsertColumn, 
  type InsertStats,
  type User,
  type InsertUser
} from "@shared/schema";

// Storage interface
export interface IStorage {
  // User methods (from the original template)
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
}

// Implement the in-memory storage
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private leadsData: Map<number, Lead>;
  private columnsData: Map<string, Column>;
  private statsData: Stats;
  currentUserId: number;
  currentLeadId: number;

  constructor() {
    this.users = new Map();
    this.leadsData = new Map();
    this.columnsData = new Map();
    this.currentUserId = 1;
    this.currentLeadId = 1;
    
    // Initialize with sample data
    this.initializeData();
  }
  
  private initializeData() {
    // Initialize columns
    const initialColumns: Column[] = [
      { id: 'newLeads', title: 'New Leads', order: 1 },
      { id: 'pendingSMS', title: 'SMS Sent', order: 2 },
      { id: 'verified', title: 'Identity Verified', order: 3 },
      { id: 'qualified', title: 'Consultation Ready', order: 4 },
      { id: 'failed', title: 'Failed Verification', order: 5 }
    ];
    
    initialColumns.forEach(column => {
      this.columnsData.set(column.id, column);
    });
    
    // Initialize sample leads
    const sampleLeads: Lead[] = [
      { 
        id: this.currentLeadId++, 
        name: 'Sarah Johnson', 
        username: '@sarahj', 
        time: '5m ago', 
        source: 'Botox Story Ad', 
        avatar: '/api/placeholder/40/40', 
        tags: ['Injectables', 'Botox/Daxxify'],
        assessment: "Pending",
        columnId: 'newLeads',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      { 
        id: this.currentLeadId++, 
        name: 'James Wilson', 
        username: '@jamwilson', 
        time: '1h ago', 
        source: 'Aveli Cellulite Post', 
        avatar: '/api/placeholder/40/40', 
        tags: ['Aesthetics', 'Aveli Treatment'], 
        smsStatus: 'Delivered', 
        sendTime: '10:22 AM',
        assessment: "Pending",
        columnId: 'pendingSMS',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      { 
        id: this.currentLeadId++, 
        name: 'Robert Brown', 
        username: '@robbrown', 
        time: '4h ago', 
        source: 'Male HD Lipo Ad', 
        avatar: '/api/placeholder/40/40', 
        tags: ['Body', 'HD VASER Lipo'], 
        verifiedTime: '11:32 AM', 
        score: 85,
        assessment: {
          likelihood: 6.2,
          benefits: 5.8,
          overall: "High Intent"
        },
        columnId: 'verified',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      { 
        id: this.currentLeadId++, 
        name: 'Daniel Martinez', 
        username: '@daniel_m', 
        time: '1d ago', 
        source: 'BBL Post Engagement', 
        avatar: '/api/placeholder/40/40', 
        tags: ['Butt', 'HD BBL'], 
        qualScore: 95, 
        priority: 'High Intent', 
        consultDate: 'Mar 21',
        assessment: {
          likelihood: 6.8,
          benefits: 6.5,
          overall: "High Intent"
        },
        financing: "Care Credit",
        columnId: 'qualified',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      { 
        id: this.currentLeadId++, 
        name: 'Taylor Smith', 
        username: '@taylors', 
        time: '1d ago', 
        source: 'Profile Visit', 
        avatar: '/api/placeholder/40/40', 
        reason: 'SMS undeliverable',
        assessment: "Incomplete",
        columnId: 'failed',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    sampleLeads.forEach(lead => {
      this.leadsData.set(lead.id, lead);
    });
    
    // Initialize stats
    this.statsData = {
      id: 1,
      totalLeads: 100,
      newLeadsToday: 32,
      consultsBooked: 18,
      smsResponseRate: 67,
      updatedAt: new Date()
    };
  }

  // User methods (from original template)
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Lead methods
  async getLead(id: number): Promise<Lead | undefined> {
    return this.leadsData.get(id);
  }
  
  async getLeads(): Promise<Lead[]> {
    return Array.from(this.leadsData.values());
  }
  
  async getLeadsByColumn(columnId: string): Promise<Lead[]> {
    return Array.from(this.leadsData.values()).filter(lead => lead.columnId === columnId);
  }
  
  async createLead(lead: InsertLead): Promise<Lead> {
    const id = this.currentLeadId++;
    const newLead: Lead = {
      ...lead,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.leadsData.set(id, newLead);
    return newLead;
  }
  
  async updateLead(id: number, lead: Partial<InsertLead>): Promise<Lead | undefined> {
    const existingLead = this.leadsData.get(id);
    
    if (!existingLead) {
      return undefined;
    }
    
    const updatedLead: Lead = {
      ...existingLead,
      ...lead,
      updatedAt: new Date()
    };
    
    this.leadsData.set(id, updatedLead);
    return updatedLead;
  }
  
  async deleteLead(id: number): Promise<boolean> {
    return this.leadsData.delete(id);
  }
  
  // Column methods
  async getColumn(id: string): Promise<Column | undefined> {
    return this.columnsData.get(id);
  }
  
  async getColumns(): Promise<Column[]> {
    return Array.from(this.columnsData.values()).sort((a, b) => a.order - b.order);
  }
  
  async createColumn(column: InsertColumn): Promise<Column> {
    this.columnsData.set(column.id, column);
    return column;
  }
  
  async updateColumn(id: string, column: Partial<InsertColumn>): Promise<Column | undefined> {
    const existingColumn = this.columnsData.get(id);
    
    if (!existingColumn) {
      return undefined;
    }
    
    const updatedColumn: Column = {
      ...existingColumn,
      ...column
    };
    
    this.columnsData.set(id, updatedColumn);
    return updatedColumn;
  }
  
  async deleteColumn(id: string): Promise<boolean> {
    return this.columnsData.delete(id);
  }
  
  // Stats methods
  async getStats(): Promise<Stats> {
    return this.statsData;
  }
  
  async updateStats(newStats: InsertStats): Promise<Stats> {
    this.statsData = {
      ...this.statsData,
      ...newStats,
      updatedAt: new Date()
    };
    
    return this.statsData;
  }
}

export const storage = new MemStorage();
