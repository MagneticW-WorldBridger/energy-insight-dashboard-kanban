import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Lead schema
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  username: text("username").notNull(),
  time: text("time").notNull(),
  source: text("source").notNull(),
  tags: text("tags").array().notNull(),
  avatar: text("avatar"),
  assessment: jsonb("assessment").notNull(),
  smsStatus: text("sms_status"),
  sendTime: text("send_time"),
  verifiedTime: text("verified_time"),
  score: integer("score"),
  qualScore: integer("qual_score"),
  priority: text("priority"),
  consultDate: text("consult_date"),
  financing: text("financing"),
  reason: text("reason"),
  notes: text("notes"),
  columnId: text("column_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Column schema
export const columns = pgTable("columns", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  order: integer("order").notNull(),
});

export const insertColumnSchema = createInsertSchema(columns);

// Stats schema
export const stats = pgTable("stats", {
  id: serial("id").primaryKey(),
  totalLeads: integer("total_leads").notNull(),
  newLeadsToday: integer("new_leads_today").notNull(),
  consultsBooked: integer("consults_booked").notNull(),
  smsResponseRate: integer("sms_response_rate").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertStatsSchema = createInsertSchema(stats).omit({
  id: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;

export type InsertColumn = z.infer<typeof insertColumnSchema>;
export type Column = typeof columns.$inferSelect;

export type InsertStats = z.infer<typeof insertStatsSchema>;
export type Stats = typeof stats.$inferSelect;
