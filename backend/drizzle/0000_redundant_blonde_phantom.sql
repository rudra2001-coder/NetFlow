DO $$ BEGIN
 CREATE TYPE "billing_status" AS ENUM('pending', 'paid', 'overdue', 'cancelled', 'refunded');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "command_status" AS ENUM('pending', 'executing', 'success', 'failed', 'timeout');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "log_severity" AS ENUM('debug', 'info', 'warning', 'error', 'critical');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "ppp_secret_status" AS ENUM('active', 'disabled', 'expired', 'suspended', 'pending');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "router_status" AS ENUM('online', 'offline', 'warning', 'error', 'pending', 'maintenance');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "user_role" AS ENUM('super_admin', 'org_admin', 'technician', 'user', 'reseller');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"user_id" uuid,
	"action" varchar(100) NOT NULL,
	"entity_type" varchar(100) NOT NULL,
	"entity_id" uuid,
	"old_value" jsonb,
	"new_value" jsonb,
	"ip_address" "inet",
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"severity" "log_severity" DEFAULT 'info' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "billing_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"bandwidth_up" bigint,
	"bandwidth_down" bigint,
	"data_cap" bigint,
	"price_monthly" numeric(10, 2),
	"price_yearly" numeric(10, 2),
	"grace_period" integer DEFAULT 7,
	"auto_extend" boolean DEFAULT false,
	"is_active" boolean DEFAULT true NOT NULL,
	"features" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "command_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"router_id" uuid NOT NULL,
	"user_id" uuid,
	"command" text NOT NULL,
	"parameters" jsonb DEFAULT '{}'::jsonb,
	"command_type" varchar(50),
	"status" "command_status" DEFAULT 'pending' NOT NULL,
	"response" text,
	"error_message" text,
	"execution_time" integer,
	"ip_address" "inet",
	"correlation_id" varchar(100),
	"parent_command_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "hotspot_active" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"router_id" uuid NOT NULL,
	"user" varchar(100) NOT NULL,
	"ip_address" "inet",
	"mac_address" varchar(17),
	"uptime" bigint,
	"bytes_in" bigint,
	"bytes_out" bigint,
	"packets_in" bigint,
	"packets_out" bigint,
	"session_id" varchar(50),
	"profile" varchar(100),
	"server" varchar(100),
	"connected_at" timestamp,
	"collected_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "interface_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"router_id" uuid NOT NULL,
	"interface_name" varchar(100) NOT NULL,
	"interface_index" integer,
	"interface_type" varchar(50),
	"interface_status" varchar(20),
	"rx_bytes" bigint,
	"rx_packets" bigint,
	"rx_errors" bigint,
	"rx_drops" bigint,
	"tx_bytes" bigint,
	"tx_packets" bigint,
	"tx_errors" bigint,
	"tx_drops" bigint,
	"speed" bigint,
	"mac_address" varchar(17),
	"mtu" integer,
	"collected_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"customer_id" varchar(100),
	"invoice_number" varchar(50) NOT NULL,
	"billing_plan_id" uuid,
	"amount" numeric(10, 2) NOT NULL,
	"tax" numeric(10, 2) DEFAULT '0',
	"discount" numeric(10, 2) DEFAULT '0',
	"status" "billing_status" DEFAULT 'pending' NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"due_date" timestamp NOT NULL,
	"paid_at" timestamp,
	"payment_method" varchar(50),
	"payment_reference" varchar(200),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invoices_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"domain" varchar(255),
	"logo" text,
	"settings" jsonb DEFAULT '{}'::jsonb,
	"timezone" varchar(50) DEFAULT 'UTC',
	"billing_email" varchar(255),
	"address" text,
	"phone" varchar(50),
	"is_active" boolean DEFAULT true NOT NULL,
	"subscription_plan" varchar(50) DEFAULT 'basic',
	"router_limit" integer DEFAULT 10,
	"user_limit" integer DEFAULT 100,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug"),
	CONSTRAINT "organizations_domain_unique" UNIQUE("domain")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ppp_active" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"router_id" uuid NOT NULL,
	"ppp_secret_id" uuid,
	"name" varchar(100) NOT NULL,
	"service" varchar(20),
	"caller_id" varchar(50),
	"ip_address" "inet",
	"mac_address" varchar(17),
	"uptime" bigint,
	"encoding" varchar(20),
	"session_id" varchar(50),
	"bytes_in" bigint,
	"bytes_out" bigint,
	"packets_in" bigint,
	"packets_out" bigint,
	"link_type" varchar(30),
	"profile" varchar(100),
	"connected_at" timestamp,
	"collected_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ppp_secrets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"router_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"password" varchar(100) NOT NULL,
	"service" varchar(20) DEFAULT 'any',
	"profile" varchar(100),
	"local_address" "inet",
	"remote_address" "inet",
	"caller_id" varchar(50),
	"routes" text,
	"limit_bytes_in" bigint,
	"limit_bytes_out" bigint,
	"limit_bytes_total" bigint,
	"parent_queue" varchar(100),
	"status" "ppp_secret_status" DEFAULT 'pending' NOT NULL,
	"last_login_at" timestamp,
	"last_login_ip" "inet",
	"total_bytes_in" bigint DEFAULT 0,
	"total_bytes_out" bigint DEFAULT 0,
	"total_duration" bigint DEFAULT 0,
	"customer_id" varchar(100),
	"billing_plan" varchar(100),
	"expiry_date" timestamp,
	"auto_extend" boolean DEFAULT false,
	"notes" text,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"sync_status" varchar(20) DEFAULT 'pending',
	"sync_error" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ppp_usage_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ppp_secret_id" uuid NOT NULL,
	"router_id" uuid NOT NULL,
	"session_id" varchar(100) NOT NULL,
	"ip_address" "inet",
	"mac_address" varchar(17),
	"bytes_in" bigint NOT NULL,
	"bytes_out" bigint NOT NULL,
	"duration" bigint NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"disconnect_reason" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "routers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"hostname" varchar(255) NOT NULL,
	"ip_address" "inet" NOT NULL,
	"port" integer DEFAULT 8728,
	"username" varchar(100) NOT NULL,
	"encrypted_credential" text NOT NULL,
	"snmp_community" varchar(100),
	"snmp_port" integer DEFAULT 161,
	"snmp_version" varchar(10) DEFAULT '2c',
	"location" varchar(255),
	"latitude" varchar(20),
	"longitude" varchar(20),
	"model" varchar(100),
	"router_os_version" varchar(50),
	"serial_number" varchar(100),
	"uptime" bigint,
	"status" "router_status" DEFAULT 'pending' NOT NULL,
	"last_seen_at" timestamp,
	"last_check_at" timestamp,
	"last_error" text,
	"connection_timeout" integer DEFAULT 30000,
	"max_retries" integer DEFAULT 3,
	"enable_snmp" boolean DEFAULT true,
	"enable_rest" boolean DEFAULT true,
	"enable_netflow" boolean DEFAULT false,
	"netflow_version" varchar(10) DEFAULT 'v9',
	"netflow_source" varchar(50),
	"tags" jsonb DEFAULT '[]'::jsonb,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "system_resources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"router_id" uuid NOT NULL,
	"cpu_load" integer,
	"memory_total" bigint,
	"memory_used" bigint,
	"memory_free" bigint,
	"hdd_total" bigint,
	"hdd_used" bigint,
	"hdd_free" bigint,
	"uptime" bigint,
	"board_name" varchar(100),
	"version" varchar(50),
	"build_time" varchar(50),
	"factory_software" varchar(50),
	"cpu_count" integer,
	"cpu_frequency" varchar(20),
	"architecture" varchar(20),
	"collected_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "traffic_metrics" (
	"time" timestamp NOT NULL,
	"router_id" uuid NOT NULL,
	"interface_name" varchar(100) NOT NULL,
	"bytes_in" bigint NOT NULL,
	"bytes_out" bigint NOT NULL,
	"packets_in" bigint NOT NULL,
	"packets_out" bigint NOT NULL,
	"errors_in" bigint DEFAULT 0,
	"errors_out" bigint DEFAULT 0,
	"drops_in" bigint DEFAULT 0,
	"drops_out" bigint DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_data_usage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ppp_secret_id" uuid NOT NULL,
	"router_id" uuid NOT NULL,
	"period" varchar(20) NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"bytes_in" bigint NOT NULL,
	"bytes_out" bigint NOT NULL,
	"total_bytes" bigint NOT NULL,
	"session_count" integer DEFAULT 0,
	"total_duration" bigint DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" varchar(500) NOT NULL,
	"ip_address" "inet" NOT NULL,
	"user_agent" text,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"first_name" varchar(100),
	"last_name" varchar(100),
	"phone" varchar(50),
	"avatar" text,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_email_verified" boolean DEFAULT false NOT NULL,
	"email_verified_at" timestamp,
	"last_login_at" timestamp,
	"last_login_ip" "inet",
	"refresh_token" varchar(500),
	"refresh_token_expires_at" timestamp,
	"settings" jsonb DEFAULT '{}'::jsonb,
	"permissions" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_org_idx" ON "audit_logs" ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_user_idx" ON "audit_logs" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_action_idx" ON "audit_logs" ("action");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_created_idx" ON "audit_logs" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "billing_plan_org_idx" ON "billing_plans" ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cmd_log_router_idx" ON "command_logs" ("router_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cmd_log_user_idx" ON "command_logs" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cmd_log_status_idx" ON "command_logs" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cmd_log_created_idx" ON "command_logs" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "hotspot_router_idx" ON "hotspot_active" ("router_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "hotspot_user_idx" ON "hotspot_active" ("user");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "hotspot_ip_idx" ON "hotspot_active" ("ip_address");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "iface_router_idx" ON "interface_stats" ("router_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "iface_collected_idx" ON "interface_stats" ("collected_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "invoice_org_idx" ON "invoices" ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "invoice_status_idx" ON "invoices" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "invoice_number_idx" ON "invoices" ("invoice_number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ppp_active_router_idx" ON "ppp_active" ("router_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ppp_active_ip_idx" ON "ppp_active" ("ip_address");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ppp_active_collected_idx" ON "ppp_active" ("collected_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ppp_secret_router_idx" ON "ppp_secrets" ("router_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ppp_secret_status_idx" ON "ppp_secrets" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ppp_secret_customer_idx" ON "ppp_secrets" ("customer_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ppp_secret_expiry_idx" ON "ppp_secrets" ("expiry_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ppp_usage_secret_idx" ON "ppp_usage_logs" ("ppp_secret_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ppp_usage_router_idx" ON "ppp_usage_logs" ("router_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ppp_usage_start_idx" ON "ppp_usage_logs" ("start_time");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "router_org_idx" ON "routers" ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "router_ip_idx" ON "routers" ("ip_address");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "router_status_idx" ON "routers" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sysres_router_idx" ON "system_resources" ("router_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sysres_collected_idx" ON "system_resources" ("collected_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "traffic_time_idx" ON "traffic_metrics" ("time");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "traffic_router_idx" ON "traffic_metrics" ("router_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "usage_secret_idx" ON "user_data_usage" ("ppp_secret_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "usage_period_idx" ON "user_data_usage" ("period");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_user_idx" ON "user_sessions" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_token_idx" ON "user_sessions" ("token");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_org_idx" ON "users" ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_email_idx" ON "users" ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_role_idx" ON "users" ("role");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "billing_plans" ADD CONSTRAINT "billing_plans_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "command_logs" ADD CONSTRAINT "command_logs_router_id_routers_id_fk" FOREIGN KEY ("router_id") REFERENCES "routers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "command_logs" ADD CONSTRAINT "command_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "hotspot_active" ADD CONSTRAINT "hotspot_active_router_id_routers_id_fk" FOREIGN KEY ("router_id") REFERENCES "routers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "interface_stats" ADD CONSTRAINT "interface_stats_router_id_routers_id_fk" FOREIGN KEY ("router_id") REFERENCES "routers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invoices" ADD CONSTRAINT "invoices_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invoices" ADD CONSTRAINT "invoices_billing_plan_id_billing_plans_id_fk" FOREIGN KEY ("billing_plan_id") REFERENCES "billing_plans"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ppp_active" ADD CONSTRAINT "ppp_active_router_id_routers_id_fk" FOREIGN KEY ("router_id") REFERENCES "routers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ppp_active" ADD CONSTRAINT "ppp_active_ppp_secret_id_ppp_secrets_id_fk" FOREIGN KEY ("ppp_secret_id") REFERENCES "ppp_secrets"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ppp_secrets" ADD CONSTRAINT "ppp_secrets_router_id_routers_id_fk" FOREIGN KEY ("router_id") REFERENCES "routers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ppp_usage_logs" ADD CONSTRAINT "ppp_usage_logs_ppp_secret_id_ppp_secrets_id_fk" FOREIGN KEY ("ppp_secret_id") REFERENCES "ppp_secrets"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ppp_usage_logs" ADD CONSTRAINT "ppp_usage_logs_router_id_routers_id_fk" FOREIGN KEY ("router_id") REFERENCES "routers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "routers" ADD CONSTRAINT "routers_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "system_resources" ADD CONSTRAINT "system_resources_router_id_routers_id_fk" FOREIGN KEY ("router_id") REFERENCES "routers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_data_usage" ADD CONSTRAINT "user_data_usage_ppp_secret_id_ppp_secrets_id_fk" FOREIGN KEY ("ppp_secret_id") REFERENCES "ppp_secrets"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_data_usage" ADD CONSTRAINT "user_data_usage_router_id_routers_id_fk" FOREIGN KEY ("router_id") REFERENCES "routers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
