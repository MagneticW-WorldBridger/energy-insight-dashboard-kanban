import { db } from './db';
import { columns, stats } from '@shared/schema';

/**
 * Initialize default database tables and values if they don't exist
 */
export async function initDatabase() {
  console.log('Initializing database...');
  
  try {
    // Check if columns table has data
    const existingColumns = await db.select().from(columns);
    
    // If no columns exist, create the default ones
    if (existingColumns.length === 0) {
      console.log('Creating default columns...');
      
      const defaultColumns = [
        { id: 'newLeads', title: 'New Leads', order: 1, color: 'blue', group: 'automated' },
        { id: 'pendingSMS', title: 'SMS Sent', order: 2, color: 'amber', group: 'automated' },
        { id: 'verified', title: 'Identity Verified', order: 3, color: 'green', group: 'automated' },
        { id: 'qualified', title: 'Consultation Ready', order: 4, color: 'purple', group: 'automated' },
        { id: 'failed', title: 'Failed Verification', order: 5, color: 'red', group: 'automated' }
      ];
      
      for (const column of defaultColumns) {
        await db.insert(columns).values(column);
      }
      
      console.log('Default columns created successfully!');
    } else {
      console.log(`Found ${existingColumns.length} existing columns, skipping initialization.`);
    }
    
    // Check if stats table has data
    const existingStats = await db.select().from(stats);
    
    // If no stats exist, create default stats
    if (existingStats.length === 0) {
      console.log('Creating default stats...');
      
      await db.insert(stats).values({
        totalLeads: 0,
        newLeadsToday: 0,
        consultsBooked: 0,
        smsResponseRate: 0
      });
      
      console.log('Default stats created successfully!');
    } else {
      console.log(`Found existing stats, skipping initialization.`);
    }
    
    console.log('Database initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}