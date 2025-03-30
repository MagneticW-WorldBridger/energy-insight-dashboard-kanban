import { pgTable, text, serial, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// USERS TABLE
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// LEADS TABLE (based on your database structure)
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: text("name"),
  username: text("username"),
  time: timestamp("time", { withTimezone: true }),
  tags: jsonb("tags"),
  avatar: text("avatar"),
  assessment: text("assessment"),
  smsStatus: text("sms_status"),
  sendTime: timestamp("send_time", { withTimezone: true }),
  verifiedTime: timestamp("verified_time", { withTimezone: true }),
  score: integer("score"),
  qualScore: integer("qual_score"),
  priority: text("priority"),
  consultDate: timestamp("consult_date", { withTimezone: true }),
  financing: text("financing"),
  reason: text("reason"),
  notes: text("notes"),
  questionnaire: jsonb("questionnaire"),
  demographic: jsonb("demographic"),
  contactInfo: jsonb("contact_info"),
  columnId: text("column_id").default('incomplete'),
  qualificationAnswers: jsonb("qualification_answers"),
  consultation: jsonb("consultation"),
  messageHistory: jsonb("message_history"),
  qualificationScore: integer("qualification_score").default(0),
  followUpDate: timestamp("follow_up_date"),
  callScheduled: boolean("call_scheduled").default(false),
  callNotes: text("call_notes"),
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
});

// COLUMNS TABLE (based on your database structure)
export const columns = pgTable("columns", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  order: integer("order").notNull(),
  description: text("description"),
  color: text("color").default('blue'),
  group: text("group").default('automated'),
});

export const insertColumnSchema = createInsertSchema(columns);

// STATS TABLE (for analytics on the dashboard)
export const stats = pgTable("stats", {
  id: serial("id").primaryKey(),
  totalLeads: integer("total_leads").default(0),
  newLeadsToday: integer("new_leads_today").default(0),
  consultsBooked: integer("consults_booked").default(0),
  smsResponseRate: integer("sms_response_rate").default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertStatsSchema = createInsertSchema(stats).omit({
  id: true,
  updatedAt: true,
});

// EXPORT TYPES
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;

export type InsertColumn = z.infer<typeof insertColumnSchema>;
export type Column = typeof columns.$inferSelect;

export type InsertStats = z.infer<typeof insertStatsSchema>;
export type Stats = typeof stats.$inferSelect;

// RELATIONS
export const leadsRelations = {
  column: {
    relationField: "columnId",
    references: "columns.id",
  },
};

export const columnsRelations = {
  leads: {
    relationField: "id",
    references: "leads.columnId",
  },
};
