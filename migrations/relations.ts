import { relations } from "drizzle-orm/relations";
import { users, students, payments, hours, notifications } from "./schema";

export const studentsRelations = relations(students, ({one, many}) => ({
	user: one(users, {
		fields: [students.userId],
		references: [users.id]
	}),
	payments: many(payments),
	hours: many(hours),
}));

export const usersRelations = relations(users, ({many}) => ({
	students: many(students),
	hours: many(hours),
	notifications: many(notifications),
}));

export const paymentsRelations = relations(payments, ({one}) => ({
	student: one(students, {
		fields: [payments.studentId],
		references: [students.id]
	}),
}));

export const hoursRelations = relations(hours, ({one}) => ({
	student: one(students, {
		fields: [hours.studentId],
		references: [students.id]
	}),
	user: one(users, {
		fields: [hours.verifiedBy],
		references: [users.id]
	}),
}));

export const notificationsRelations = relations(notifications, ({one}) => ({
	user: one(users, {
		fields: [notifications.userId],
		references: [users.id]
	}),
}));