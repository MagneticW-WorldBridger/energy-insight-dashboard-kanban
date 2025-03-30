import { pgTable, unique, check, serial, varchar, timestamp, foreignKey, integer, date, numeric, text, boolean, index, jsonb } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	email: varchar({ length: 255 }).notNull(),
	password: varchar({ length: 255 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	role: varchar({ length: 20 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	unique("users_email_key").on(table.email),
	check("users_role_check", sql`(role)::text = ANY ((ARRAY['ADMIN'::character varying, 'STUDENT'::character varying])::text[])`),
]);

export const students = pgTable("students", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id"),
	enrollmentDate: date("enrollment_date").notNull(),
	program: varchar({ length: 100 }).notNull(),
	totalProgramHours: integer("total_program_hours").notNull(),
	totalProgramCost: numeric("total_program_cost", { precision: 10, scale:  2 }).notNull(),
	paymentPlan: varchar("payment_plan", { length: 50 }),
	address: text(),
	phone: varchar({ length: 20 }),
	emergencyContactName: varchar("emergency_contact_name", { length: 255 }),
	emergencyContactPhone: varchar("emergency_contact_phone", { length: 20 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "students_user_id_fkey"
		}).onDelete("cascade"),
	check("students_payment_plan_check", sql`(payment_plan)::text = ANY ((ARRAY['IN_HOUSE'::character varying, 'MIASHARE'::character varying])::text[])`),
]);

export const payments = pgTable("payments", {
	id: serial().primaryKey().notNull(),
	studentId: integer("student_id"),
	amount: numeric({ precision: 10, scale:  2 }).notNull(),
	paymentDate: date("payment_date").notNull(),
	dueDate: date("due_date"),
	paymentMethod: varchar("payment_method", { length: 50 }),
	paymentPlan: varchar("payment_plan", { length: 50 }),
	description: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
			columns: [table.studentId],
			foreignColumns: [students.id],
			name: "payments_student_id_fkey"
		}).onDelete("cascade"),
	check("payments_payment_method_check", sql`(payment_method)::text = ANY ((ARRAY['CREDIT_CARD'::character varying, 'BANK_TRANSFER'::character varying, 'CASH'::character varying, 'CHECK'::character varying, 'OTHER'::character varying])::text[])`),
	check("payments_payment_plan_check", sql`(payment_plan)::text = ANY ((ARRAY['IN_HOUSE'::character varying, 'MIASHARE'::character varying])::text[])`),
]);

export const hours = pgTable("hours", {
	id: serial().primaryKey().notNull(),
	studentId: integer("student_id"),
	date: date().notNull(),
	hoursCompleted: numeric("hours_completed", { precision: 5, scale:  2 }).notNull(),
	category: varchar({ length: 100 }),
	verified: boolean().default(false),
	verifiedBy: integer("verified_by"),
	notes: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
			columns: [table.studentId],
			foreignColumns: [students.id],
			name: "hours_student_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.verifiedBy],
			foreignColumns: [users.id],
			name: "hours_verified_by_fkey"
		}),
]);

export const notifications = pgTable("notifications", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id"),
	title: varchar({ length: 255 }).notNull(),
	message: text().notNull(),
	isRead: boolean("is_read").default(false),
	type: varchar({ length: 50 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "notifications_user_id_fkey"
		}).onDelete("cascade"),
]);

export const leads = pgTable("leads", {
	id: serial().primaryKey().notNull(),
	name: text(),
	username: text(),
	time: timestamp({ withTimezone: true, mode: 'string' }),
	tags: jsonb(),
	avatar: text(),
	assessment: text(),
	smsStatus: text("sms_status"),
	sendTime: timestamp("send_time", { withTimezone: true, mode: 'string' }),
	verifiedTime: timestamp("verified_time", { withTimezone: true, mode: 'string' }),
	score: integer(),
	qualScore: integer("qual_score"),
	priority: text(),
	consultDate: timestamp("consult_date", { withTimezone: true, mode: 'string' }),
	financing: text(),
	reason: text(),
	notes: text(),
	questionnaire: jsonb(),
	demographic: jsonb(),
	contactInfo: jsonb("contact_info"),
	columnId: text("column_id").default('incomplete'),
	qualificationAnswers: jsonb("qualification_answers"),
	columnId: text(),
	consultation: jsonb(),
	messageHistory: jsonb("message_history"),
	contactInfo: jsonb(),
	qualificationScore: integer("qualification_score").default(0),
	followUpDate: timestamp("follow_up_date", { mode: 'string' }),
	callScheduled: boolean("call_scheduled").default(false),
	callNotes: text("call_notes"),
}, (table) => [
	index("leads_column_id_idx").using("btree", table.columnId.asc().nullsLast().op("text_ops")),
	index("leads_time_idx").using("btree", table.time.asc().nullsLast().op("timestamptz_ops")),
]);

export const columns = pgTable("columns", {
	id: text().primaryKey().notNull(),
	title: text().notNull(),
	order: integer().notNull(),
	description: text(),
	color: text().default('blue'),
	group: text().default('automated'),
});
