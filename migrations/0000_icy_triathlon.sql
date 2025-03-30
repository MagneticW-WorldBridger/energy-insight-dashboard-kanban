-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"role" varchar(20) NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "users_email_key" UNIQUE("email"),
	CONSTRAINT "users_role_check" CHECK ((role)::text = ANY ((ARRAY['ADMIN'::character varying, 'STUDENT'::character varying])::text[]))
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"enrollment_date" date NOT NULL,
	"program" varchar(100) NOT NULL,
	"total_program_hours" integer NOT NULL,
	"total_program_cost" numeric(10, 2) NOT NULL,
	"payment_plan" varchar(50),
	"address" text,
	"phone" varchar(20),
	"emergency_contact_name" varchar(255),
	"emergency_contact_phone" varchar(20),
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "students_payment_plan_check" CHECK ((payment_plan)::text = ANY ((ARRAY['IN_HOUSE'::character varying, 'MIASHARE'::character varying])::text[]))
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer,
	"amount" numeric(10, 2) NOT NULL,
	"payment_date" date NOT NULL,
	"due_date" date,
	"payment_method" varchar(50),
	"payment_plan" varchar(50),
	"description" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "payments_payment_method_check" CHECK ((payment_method)::text = ANY ((ARRAY['CREDIT_CARD'::character varying, 'BANK_TRANSFER'::character varying, 'CASH'::character varying, 'CHECK'::character varying, 'OTHER'::character varying])::text[])),
	CONSTRAINT "payments_payment_plan_check" CHECK ((payment_plan)::text = ANY ((ARRAY['IN_HOUSE'::character varying, 'MIASHARE'::character varying])::text[]))
);
--> statement-breakpoint
CREATE TABLE "hours" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer,
	"date" date NOT NULL,
	"hours_completed" numeric(5, 2) NOT NULL,
	"category" varchar(100),
	"verified" boolean DEFAULT false,
	"verified_by" integer,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false,
	"type" varchar(50),
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"username" text,
	"time" timestamp with time zone,
	"tags" jsonb,
	"avatar" text,
	"assessment" text,
	"sms_status" text,
	"send_time" timestamp with time zone,
	"verified_time" timestamp with time zone,
	"score" integer,
	"qual_score" integer,
	"priority" text,
	"consult_date" timestamp with time zone,
	"financing" text,
	"reason" text,
	"notes" text,
	"questionnaire" jsonb,
	"demographic" jsonb,
	"contact_info" jsonb,
	"column_id" text DEFAULT 'incomplete',
	"qualification_answers" jsonb,
	"columnId" text,
	"consultation" jsonb,
	"message_history" jsonb,
	"contactInfo" jsonb,
	"qualification_score" integer DEFAULT 0,
	"follow_up_date" timestamp,
	"call_scheduled" boolean DEFAULT false,
	"call_notes" text
);
--> statement-breakpoint
CREATE TABLE "columns" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"order" integer NOT NULL,
	"description" text,
	"color" text DEFAULT 'blue',
	"group" text DEFAULT 'automated'
);
--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hours" ADD CONSTRAINT "hours_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hours" ADD CONSTRAINT "hours_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "leads_column_id_idx" ON "leads" USING btree ("column_id" text_ops);--> statement-breakpoint
CREATE INDEX "leads_time_idx" ON "leads" USING btree ("time" timestamptz_ops);
*/