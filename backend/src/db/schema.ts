/**
 * Database schema for NetFlow ISP Management Platform
 * Uses Drizzle ORM with PostgreSQL + TimescaleDB for time-series data
 * Multi-tenant architecture with row-level security
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  bigint,
  jsonb,
  numeric,
  inet,
  pgEnum,
  index,
  check
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { type InferSelectModel, type InferInsertModel } from 'drizzle-orm';

// ============================================================================
// ENUMS
// ============================================================================

export const userRoleEnum = pgEnum('user_role', [
  'super_admin',
  'org_admin',
  'technician',
  'user',
  'reseller'
]);

export const routerStatusEnum = pgEnum('router_status', [
  'online',
  'offline',
  'warning',
  'error',
  'pending',
  'maintenance'
]);

export const pppSecretStatusEnum = pgEnum('ppp_secret_status', [
  'active',
  'disabled',
  'expired',
  'suspended',
  'pending'
]);

export const billingStatusEnum = pgEnum('billing_status', [
  'pending',
  'paid',
  'overdue',
  'cancelled',
  'refunded'
]);

// ============================================================================
// BILLING EVENT TYPES (for audit trail)
// ============================================================================

export const billingEventTypeEnum = pgEnum('billing_event_type', [
  'invoice_generated',
  'payment_received',
  'late_fee_applied',
  'suspension',
  'activation',
  'plan_changed',
  'subscription_extended',
  'credit_limit_exceeded',
  'wallet_recharged',
  'partial_payment'
]);

// ============================================================================
// BILLING MODE ENUM (Unified Flexible Billing)
// ============================================================================

export const billingModeEnum = pgEnum('billing_mode', [
  'calendar',      // Calendar billing (1st to 30th/31st)
  'anniversary',   // Anniversary billing (billing date matches signup date)
  'fixed_days',    // Fixed days (7-day, 15-day, etc.)
  'prepaid',       // Prepaid (pay before service)
  'postpaid',      // Postpaid (pay after service)
  'on_demand'      // On-demand (manual activation only)
]);

export const commandStatusEnum = pgEnum('command_status', [
  'pending',
  'executing',
  'success',
  'failed',
  'timeout'
]);

export const logSeverityEnum = pgEnum('log_severity', [
  'debug',
  'info',
  'warning',
  'error',
  'critical'
]);

export const snmpVersionEnum = pgEnum('snmp_version', ['v1', 'v2c', 'v3']);

export const oltStatusEnum = pgEnum('olt_status', [
  'online',
  'offline',
  'warning',
  'error',
  'maintenance',
  'pending'
]);

export const onuStatusEnum = pgEnum('onu_status', [
  'online',
  'offline',
  'los',
  'degraded',
  'disabled',
  'pending'
]);

export const alarmSeverityEnum = pgEnum('alarm_severity', [
  'critical',
  'warning',
  'info'
]);

export const ponPortStatusEnum = pgEnum('pon_port_status', [
  'online',
  'offline',
  'disabled',
  'warning'
]);

// ============================================================================
// ORGANIZATIONS (Multi-tenant isolation)
// ============================================================================

export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).unique().notNull(),
  domain: varchar('domain', { length: 255 }).unique(),
  logo: text('logo'),
  settings: jsonb('settings').default({}),
  timezone: varchar('timezone', { length: 50 }).default('UTC'),
  billingEmail: varchar('billing_email', { length: 255 }),
  address: text('address'),
  phone: varchar('phone', { length: 50 }),
  isActive: boolean('is_active').default(true).notNull(),
  subscriptionPlan: varchar('subscription_plan', { length: 50 }).default('basic'),
  routerLimit: integer('router_limit').default(10),
  userLimit: integer('user_limit').default(100),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================================================
// USERS
// ============================================================================

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  phone: varchar('phone', { length: 50 }),
  avatar: text('avatar'),
  role: userRoleEnum('role').default('user').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  isEmailVerified: boolean('is_email_verified').default(false).notNull(),
  emailVerifiedAt: timestamp('email_verified_at'),
  lastLoginAt: timestamp('last_login_at'),
  lastLoginIp: inet('last_login_ip'),
  refreshToken: varchar('refresh_token', { length: 500 }),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  settings: jsonb('settings').default({}),
  permissions: jsonb('permissions').default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userOrgIdx: index('user_org_idx').on(table.organizationId),
  userEmailIdx: index('user_email_idx').on(table.email),
  userRoleIdx: index('user_role_idx').on(table.role),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
  sessions: many(userSessions),
  auditLogs: many(auditLogs),
}));

// ============================================================================
// USER SESSIONS
// ============================================================================

export const userSessions = pgTable('user_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  token: varchar('token', { length: 500 }).unique().notNull(),
  ipAddress: inet('ip_address').notNull(),
  userAgent: text('user_agent'),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  sessionUserIdx: index('session_user_idx').on(table.userId),
  sessionTokenIdx: index('session_token_idx').on(table.token),
}));

export const userSessionsRelations = relations(userSessions, ({ one }) => ({
  user: one(users, {
    fields: [userSessions.userId],
    references: [users.id],
  }),
}));

// ============================================================================
// ROUTERS
// ============================================================================

export const routers = pgTable('routers', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  hostname: varchar('hostname', { length: 255 }).notNull(),
  ipAddress: inet('ip_address').notNull(),
  port: integer('port').default(8728),
  username: varchar('username', { length: 100 }).notNull(),
  encryptedCredential: text('encrypted_credential').notNull(),
  snmpCommunity: varchar('snmp_community', { length: 100 }),
  snmpPort: integer('snmp_port').default(161),
  snmpVersion: varchar('snmp_version', { length: 10 }).default('2c'),
  location: varchar('location', { length: 255 }),
  latitude: varchar('latitude', { length: 20 }),
  longitude: varchar('longitude', { length: 20 }),
  model: varchar('model', { length: 100 }),
  routerOSVersion: varchar('router_os_version', { length: 50 }),
  serialNumber: varchar('serial_number', { length: 100 }),
  uptime: bigint('uptime', { mode: 'number' }),
  status: routerStatusEnum('status').default('pending').notNull(),
  lastSeenAt: timestamp('last_seen_at'),
  lastCheckAt: timestamp('last_check_at'),
  lastError: text('last_error'),
  connectionTimeout: integer('connection_timeout').default(30000),
  maxRetries: integer('max_retries').default(3),
  enableSnmp: boolean('enable_snmp').default(true),
  enableRest: boolean('enable_rest').default(true),
  enableNetflow: boolean('enable_netflow').default(false),
  netflowVersion: varchar('netflow_version', { length: 10 }).default('v9'),
  netflowSource: varchar('netflow_source', { length: 50 }),
  tags: jsonb('tags').default([]),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  routerOrgIdx: index('router_org_idx').on(table.organizationId),
  routerIpIdx: index('router_ip_idx').on(table.ipAddress),
  routerStatusIdx: index('router_status_idx').on(table.status),
}));

export const routersRelations = relations(routers, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [routers.organizationId],
    references: [organizations.id],
  }),
  interfaceStats: many(interfaceStats),
  systemResources: many(systemResources),
  pppSecrets: many(pppSecrets),
  pppActive: many(pppActive),
  hotspotActive: many(hotspotActive),
  commandLogs: many(commandLogs),
  trafficMetrics: many(trafficMetrics),
}));

// ============================================================================
// INTERFACE STATISTICS
// ============================================================================

export const interfaceStats = pgTable('interface_stats', {
  id: uuid('id').primaryKey().defaultRandom(),
  routerId: uuid('router_id').references(() => routers.id, { onDelete: 'cascade' }).notNull(),
  interfaceName: varchar('interface_name', { length: 100 }).notNull(),
  interfaceIndex: integer('interface_index'),
  interfaceType: varchar('interface_type', { length: 50 }),
  interfaceStatus: varchar('interface_status', { length: 20 }),
  rxBytes: bigint('rx_bytes', { mode: 'number' }),
  rxPackets: bigint('rx_packets', { mode: 'number' }),
  rxErrors: bigint('rx_errors', { mode: 'number' }),
  rxDrops: bigint('rx_drops', { mode: 'number' }),
  txBytes: bigint('tx_bytes', { mode: 'number' }),
  txPackets: bigint('tx_packets', { mode: 'number' }),
  txErrors: bigint('tx_errors', { mode: 'number' }),
  txDrops: bigint('tx_drops', { mode: 'number' }),
  speed: bigint('speed', { mode: 'number' }),
  macAddress: varchar('mac_address', { length: 17 }),
  mtu: integer('mtu'),
  collectedAt: timestamp('collected_at').defaultNow().notNull(),
}, (table) => ({
  ifaceRouterIdx: index('iface_router_idx').on(table.routerId),
  ifaceCollectedIdx: index('iface_collected_idx').on(table.collectedAt),
}));

export const interfaceStatsRelations = relations(interfaceStats, ({ one }) => ({
  router: one(routers, {
    fields: [interfaceStats.routerId],
    references: [routers.id],
  }),
}));

// ============================================================================
// SYSTEM RESOURCES
// ============================================================================

export const systemResources = pgTable('system_resources', {
  id: uuid('id').primaryKey().defaultRandom(),
  routerId: uuid('router_id').references(() => routers.id, { onDelete: 'cascade' }).notNull(),
  cpuLoad: integer('cpu_load'),
  memoryTotal: bigint('memory_total', { mode: 'number' }),
  memoryUsed: bigint('memory_used', { mode: 'number' }),
  memoryFree: bigint('memory_free', { mode: 'number' }),
  hddTotal: bigint('hdd_total', { mode: 'number' }),
  hddUsed: bigint('hdd_used', { mode: 'number' }),
  hddFree: bigint('hdd_free', { mode: 'number' }),
  uptime: bigint('uptime', { mode: 'number' }),
  boardName: varchar('board_name', { length: 100 }),
  version: varchar('version', { length: 50 }),
  buildTime: varchar('build_time', { length: 50 }),
  factorySoftware: varchar('factory_software', { length: 50 }),
  cpuCount: integer('cpu_count'),
  cpuFrequency: varchar('cpu_frequency', { length: 20 }),
  architecture: varchar('architecture', { length: 20 }),
  collectedAt: timestamp('collected_at').defaultNow().notNull(),
}, (table) => ({
  sysresRouterIdx: index('sysres_router_idx').on(table.routerId),
  sysresCollectedIdx: index('sysres_collected_idx').on(table.collectedAt),
}));

export const systemResourcesRelations = relations(systemResources, ({ one }) => ({
  router: one(routers, {
    fields: [systemResources.routerId],
    references: [routers.id],
  }),
}));

// ============================================================================
// PPP SECRETS
// ============================================================================

export const pppSecrets = pgTable('ppp_secrets', {
  id: uuid('id').primaryKey().defaultRandom(),
  routerId: uuid('router_id').references(() => routers.id, { onDelete: 'cascade' }).notNull(),
  resellerId: uuid('reseller_id').references(() => resellers.id, { onDelete: 'set null' }),
  name: varchar('name', { length: 100 }).notNull(),
  password: varchar('password', { length: 100 }).notNull(),
  service: varchar('service', { length: 20 }).default('any'),
  profile: varchar('profile', { length: 100 }),
  localAddress: inet('local_address'),
  remoteAddress: inet('remote_address'),
  callerId: varchar('caller_id', { length: 50 }),
  routes: text('routes'),
  limitBytesIn: bigint('limit_bytes_in', { mode: 'number' }),
  limitBytesOut: bigint('limit_bytes_out', { mode: 'number' }),
  limitBytesTotal: bigint('limit_bytes_total', { mode: 'number' }),
  parentQueue: varchar('parent_queue', { length: 100 }),
  status: pppSecretStatusEnum('status').default('pending').notNull(),
  lastLoginAt: timestamp('last_login_at'),
  lastLoginIp: inet('last_login_ip'),
  totalBytesIn: bigint('total_bytes_in', { mode: 'number' }).default(0),
  totalBytesOut: bigint('total_bytes_out', { mode: 'number' }).default(0),
  totalDuration: bigint('total_duration', { mode: 'number' }).default(0),
  customerId: varchar('customer_id', { length: 100 }),
  // Billing Plan reference (what they get)
  billingPlan: varchar('billing_plan', { length: 100 }),  // Legacy: plan name as string
  billingPlanId: uuid('billing_plan_id').references(() => billingPlans.id, { onDelete: 'set null' }),
  // Billing Profile reference (how they are billed)
  billingProfileId: uuid('billing_profile_id').references(() => billingProfiles.id, { onDelete: 'set null' }),
  // Billing period tracking
  currentPeriodStart: timestamp('current_period_start'),
  currentPeriodEnd: timestamp('current_period_end'),
  nextBillingDate: timestamp('next_billing_date'),
  // Credit limit used for postpaid
  creditUsed: numeric('credit_used', { precision: 10, scale: 2 }).default('0'),
  // Wallet balance for prepaid/on-demand
  walletBalance: numeric('wallet_balance', { precision: 10, scale: 2 }).default('0'),
  expiryDate: timestamp('expiry_date'),
  autoExtend: boolean('auto_extend').default(false),
  notes: text('notes'),
  tags: jsonb('tags').default([]),
  syncStatus: varchar('sync_status', { length: 20 }).default('pending'),
  syncError: text('sync_error'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  pppSecretRouterIdx: index('ppp_secret_router_idx').on(table.routerId),
  pppSecretResellerIdx: index('ppp_secret_reseller_idx').on(table.resellerId),
  pppSecretStatusIdx: index('ppp_secret_status_idx').on(table.status),
  pppSecretCustomerIdx: index('ppp_secret_customer_idx').on(table.customerId),
  pppSecretExpiryIdx: index('ppp_secret_expiry_idx').on(table.expiryDate),
  pppSecretBillingProfileIdx: index('ppp_secret_billing_profile_idx').on(table.billingProfileId),
  pppSecretNextBillingIdx: index('ppp_secret_next_billing_idx').on(table.nextBillingDate),
}));

export const pppSecretsRelations = relations(pppSecrets, ({ one, many }) => ({
  router: one(routers, {
    fields: [pppSecrets.routerId],
    references: [routers.id],
  }),
  reseller: one(resellers, {
    fields: [pppSecrets.resellerId],
    references: [resellers.id],
  }),
  billingPlan: one(billingPlans, {
    fields: [pppSecrets.billingPlanId],
    references: [billingPlans.id],
  }),
  billingProfile: one(billingProfiles, {
    fields: [pppSecrets.billingProfileId],
    references: [billingProfiles.id],
  }),
  activeConnections: many(pppActive),
  usageLogs: many(pppUsageLogs),
}));

// ============================================================================
// PPP ACTIVE CONNECTIONS
// ============================================================================

export const pppActive = pgTable('ppp_active', {
  id: uuid('id').primaryKey().defaultRandom(),
  routerId: uuid('router_id').references(() => routers.id, { onDelete: 'cascade' }).notNull(),
  pppSecretId: uuid('ppp_secret_id').references(() => pppSecrets.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  service: varchar('service', { length: 20 }),
  callerId: varchar('caller_id', { length: 50 }),
  ipAddress: inet('ip_address'),
  macAddress: varchar('mac_address', { length: 17 }),
  uptime: bigint('uptime', { mode: 'number' }),
  encoding: varchar('encoding', { length: 20 }),
  sessionId: varchar('session_id', { length: 50 }),
  bytesIn: bigint('bytes_in', { mode: 'number' }),
  bytesOut: bigint('bytes_out', { mode: 'number' }),
  packetsIn: bigint('packets_in', { mode: 'number' }),
  packetsOut: bigint('packets_out', { mode: 'number' }),
  linkType: varchar('link_type', { length: 30 }),
  profile: varchar('profile', { length: 100 }),
  connectedAt: timestamp('connected_at'),
  collectedAt: timestamp('collected_at').defaultNow().notNull(),
}, (table) => ({
  pppActiveRouterIdx: index('ppp_active_router_idx').on(table.routerId),
  pppActiveIpIdx: index('ppp_active_ip_idx').on(table.ipAddress),
  pppActiveCollectedIdx: index('ppp_active_collected_idx').on(table.collectedAt),
}));

export const pppActiveRelations = relations(pppActive, ({ one }) => ({
  router: one(routers, {
    fields: [pppActive.routerId],
    references: [routers.id],
  }),
  secret: one(pppSecrets, {
    fields: [pppActive.pppSecretId],
    references: [pppSecrets.id],
  }),
}));

// ============================================================================
// HOTSPOT ACTIVE USERS
// ============================================================================

export const hotspotActive = pgTable('hotspot_active', {
  id: uuid('id').primaryKey().defaultRandom(),
  routerId: uuid('router_id').references(() => routers.id, { onDelete: 'cascade' }).notNull(),
  user: varchar('user', { length: 100 }).notNull(),
  ipAddress: inet('ip_address'),
  macAddress: varchar('mac_address', { length: 17 }),
  uptime: bigint('uptime', { mode: 'number' }),
  bytesIn: bigint('bytes_in', { mode: 'number' }),
  bytesOut: bigint('bytes_out', { mode: 'number' }),
  packetsIn: bigint('packets_in', { mode: 'number' }),
  packetsOut: bigint('packets_out', { mode: 'number' }),
  sessionId: varchar('session_id', { length: 50 }),
  profile: varchar('profile', { length: 100 }),
  server: varchar('server', { length: 100 }),
  connectedAt: timestamp('connected_at'),
  collectedAt: timestamp('collected_at').defaultNow().notNull(),
}, (table) => ({
  hotspotRouterIdx: index('hotspot_router_idx').on(table.routerId),
  hotspotUserIdx: index('hotspot_user_idx').on(table.user),
  hotspotIpIdx: index('hotspot_ip_idx').on(table.ipAddress),
}));

export const hotspotActiveRelations = relations(hotspotActive, ({ one }) => ({
  router: one(routers, {
    fields: [hotspotActive.routerId],
    references: [routers.id],
  }),
}));

// ============================================================================
// PPP USAGE LOGS
// ============================================================================

export const pppUsageLogs = pgTable('ppp_usage_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  pppSecretId: uuid('ppp_secret_id').references(() => pppSecrets.id, { onDelete: 'cascade' }).notNull(),
  routerId: uuid('router_id').references(() => routers.id, { onDelete: 'cascade' }).notNull(),
  sessionId: varchar('session_id', { length: 100 }).notNull(),
  ipAddress: inet('ip_address'),
  macAddress: varchar('mac_address', { length: 17 }),
  bytesIn: bigint('bytes_in', { mode: 'number' }).notNull(),
  bytesOut: bigint('bytes_out', { mode: 'number' }).notNull(),
  duration: bigint('duration', { mode: 'number' }).notNull(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  disconnectReason: varchar('disconnect_reason', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  pppUsageSecretIdx: index('ppp_usage_secret_idx').on(table.pppSecretId),
  pppUsageRouterIdx: index('ppp_usage_router_idx').on(table.routerId),
  pppUsageStartIdx: index('ppp_usage_start_idx').on(table.startTime),
}));

export const pppUsageLogsRelations = relations(pppUsageLogs, ({ one }) => ({
  secret: one(pppSecrets, {
    fields: [pppUsageLogs.pppSecretId],
    references: [pppSecrets.id],
  }),
  router: one(routers, {
    fields: [pppUsageLogs.routerId],
    references: [routers.id],
  }),
}));

// ============================================================================
// COMMAND LOGS (Audit trail)
// ============================================================================

export const commandLogs = pgTable('command_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  routerId: uuid('router_id').references(() => routers.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  command: text('command').notNull(),
  parameters: jsonb('parameters').default({}),
  commandType: varchar('command_type', { length: 50 }),
  status: commandStatusEnum('status').default('pending').notNull(),
  response: text('response'),
  errorMessage: text('error_message'),
  executionTime: integer('execution_time'),
  ipAddress: inet('ip_address'),
  correlationId: varchar('correlation_id', { length: 100 }),
  parentCommandId: uuid('parent_command_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
}, (table) => ({
  cmdLogRouterIdx: index('cmd_log_router_idx').on(table.routerId),
  cmdLogUserIdx: index('cmd_log_user_idx').on(table.userId),
  cmdLogStatusIdx: index('cmd_log_status_idx').on(table.status),
  cmdLogCreatedIdx: index('cmd_log_created_idx').on(table.createdAt),
}));

export const commandLogsRelations = relations(commandLogs, ({ one }) => ({
  router: one(routers, {
    fields: [commandLogs.routerId],
    references: [routers.id],
  }),
  user: one(users, {
    fields: [commandLogs.userId],
    references: [users.id],
  }),
}));

// ============================================================================
// AUDIT LOGS
// ============================================================================

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  action: varchar('action', { length: 100 }).notNull(),
  entityType: varchar('entity_type', { length: 100 }).notNull(),
  entityId: uuid('entity_id'),
  oldValue: jsonb('old_value'),
  newValue: jsonb('new_value'),
  ipAddress: inet('ip_address'),
  metadata: jsonb('metadata').default({}),
  severity: logSeverityEnum('severity').default('info').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  auditOrgIdx: index('audit_org_idx').on(table.organizationId),
  auditUserIdx: index('audit_user_idx').on(table.userId),
  auditActionIdx: index('audit_action_idx').on(table.action),
  auditCreatedIdx: index('audit_created_idx').on(table.createdAt),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  organization: one(organizations, {
    fields: [auditLogs.organizationId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

// ============================================================================
// BILLING
// ============================================================================

export const billingPlans = pgTable('billing_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  bandwidthUp: bigint('bandwidth_up', { mode: 'number' }),
  bandwidthDown: bigint('bandwidth_down', { mode: 'number' }),
  dataCap: bigint('data_cap', { mode: 'number' }),
  priceMonthly: numeric('price_monthly', { precision: 10, scale: 2 }),
  priceYearly: numeric('price_yearly', { precision: 10, scale: 2 }),
  // Flexible billing cycle support
  cycleDays: integer('cycle_days').default(30),  // 1=daily, 7=weekly, 30=monthly, etc.
  isRecurring: boolean('is_recurring').default(true).notNull(),  // true=auto-renew, false=one-time
  // Pricing for different cycle lengths
  pricePerDay: numeric('price_per_day', { precision: 10, scale: 2 }),  // For daily billing
  pricePerWeek: numeric('price_per_week', { precision: 10, scale: 2 }),  // For weekly billing
  gracePeriod: integer('grace_period').default(7),
  autoExtend: boolean('auto_extend').default(false),
  isActive: boolean('is_active').default(true).notNull(),
  features: jsonb('features').default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  billingPlanOrgIdx: index('billing_plan_org_idx').on(table.organizationId),
}));

// ============================================================================
// BILLING PROFILES (How user is billed - Unified Flexible Billing)
// ============================================================================

export const billingProfiles = pgTable('billing_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  // Billing mode: calendar, anniversary, fixed_days, prepaid, postpaid, on_demand
  billingMode: billingModeEnum('billing_mode').default('prepaid').notNull(),
  // Grace period in days after due date
  graceDays: integer('grace_days').default(3),
  // Late fee percentage
  lateFeePercent: numeric('late_fee_percent', { precision: 5, scale: 2 }).default('0'),
  // Auto suspend on non-payment
  autoSuspend: boolean('auto_suspend').default(true).notNull(),
  // Allow partial payments
  allowPartial: boolean('allow_partial').default(false).notNull(),
  // Credit limit for postpaid (in default currency)
  creditLimit: numeric('credit_limit', { precision: 10, scale: 2 }).default('0'),
  // Require wallet/prepayment
  walletRequired: boolean('wallet_required').default(false).notNull(),
  // Billing day of month (for calendar mode: 1-31)
  billingDay: integer('billing_day'),  // null = end of month, 1-31 = specific day
  // Is default profile for organization
  isDefault: boolean('is_default').default(false).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  billingProfileOrgIdx: index('billing_profile_org_idx').on(table.organizationId),
  billingProfileNameIdx: index('billing_profile_name_idx').on(table.name),
}));

export const invoices = pgTable('invoices', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  resellerId: uuid('reseller_id').references(() => resellers.id, { onDelete: 'set null' }),
  pppSecretId: uuid('ppp_secret_id').references(() => pppSecrets.id, { onDelete: 'set null' }),
  customerId: varchar('customer_id', { length: 100 }),
  customerName: varchar('customer_name', { length: 255 }),
  customerPhone: varchar('customer_phone', { length: 50 }),
  invoiceNumber: varchar('invoice_number', { length: 50 }).unique().notNull(),
  billingPlanId: uuid('billing_plan_id').references(() => billingPlans.id),
  billingPlanName: varchar('billing_plan_name', { length: 100 }),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  tax: numeric('tax', { precision: 10, scale: 2 }).default('0'),
  discount: numeric('discount', { precision: 10, scale: 2 }).default('0'),
  totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
  paidAmount: numeric('paid_amount', { precision: 10, scale: 2 }).default('0'),
  status: billingStatusEnum('status').default('pending').notNull(),
  periodStart: timestamp('period_start').notNull(),
  periodEnd: timestamp('period_end').notNull(),
  dueDate: timestamp('due_date').notNull(),
  paidAt: timestamp('paid_at'),
  paymentMethod: varchar('payment_method', { length: 50 }),
  paymentReference: varchar('payment_reference', { length: 200 }),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  invoiceOrgIdx: index('invoice_org_idx').on(table.organizationId),
  invoiceResellerIdx: index('invoice_reseller_idx').on(table.resellerId),
  invoicePppIdx: index('invoice_ppp_idx').on(table.pppSecretId),
  invoiceStatusIdx: index('invoice_status_idx').on(table.status),
  invoiceNumberIdx: index('invoice_number_idx').on(table.invoiceNumber),
  invoiceDueDateIdx: index('invoice_due_date_idx').on(table.dueDate),
}));

// ============================================================================
// BILLING EVENTS (Audit Trail)
// ============================================================================

export const billingEvents = pgTable('billing_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }),
  resellerId: uuid('reseller_id').references(() => resellers.id, { onDelete: 'set null' }),
  pppSecretId: uuid('ppp_secret_id').references(() => pppSecrets.id, { onDelete: 'cascade' }),
  eventType: billingEventTypeEnum('event_type').notNull(),
  referenceId: uuid('reference_id'),  // invoice_id, payment_id, etc.
  amount: numeric('amount', { precision: 10, scale: 2 }),
  previousValue: text('previous_value'),
  newValue: text('new_value'),
  description: text('description'),
  metadata: jsonb('metadata'),  // Extra data for the event
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  billingEventPppIdx: index('billing_event_ppp_idx').on(table.pppSecretId),
  billingEventTypeIdx: index('billing_event_type_idx').on(table.eventType),
  billingEventCreatedIdx: index('billing_event_created_idx').on(table.createdAt),
}));

// ============================================================================
// TRAFFIC METRICS (TimescaleDB Hypertable)
// ============================================================================

export const trafficMetrics = pgTable('traffic_metrics', {
  time: timestamp('time').notNull(),
  routerId: uuid('router_id').notNull(),
  interfaceName: varchar('interface_name', { length: 100 }).notNull(),
  bytesIn: bigint('bytes_in', { mode: 'number' }).notNull(),
  bytesOut: bigint('bytes_out', { mode: 'number' }).notNull(),
  packetsIn: bigint('packets_in', { mode: 'number' }).notNull(),
  packetsOut: bigint('packets_out', { mode: 'number' }).notNull(),
  errorsIn: bigint('errors_in', { mode: 'number' }).default(0),
  errorsOut: bigint('errors_out', { mode: 'number' }).default(0),
  dropsIn: bigint('drops_in', { mode: 'number' }).default(0),
  dropsOut: bigint('drops_out', { mode: 'number' }).default(0),
}, (table) => ({
  trafficTimeIdx: index('traffic_time_idx').on(table.time),
  trafficRouterIdx: index('traffic_router_idx').on(table.routerId),
}));

// ============================================================================
// USER DATA USAGE
// ============================================================================

export const userDataUsage = pgTable('user_data_usage', {
  id: uuid('id').primaryKey().defaultRandom(),
  pppSecretId: uuid('ppp_secret_id').references(() => pppSecrets.id, { onDelete: 'cascade' }).notNull(),
  routerId: uuid('router_id').references(() => routers.id, { onDelete: 'cascade' }).notNull(),
  period: varchar('period', { length: 20 }).notNull(),
  periodStart: timestamp('period_start').notNull(),
  periodEnd: timestamp('period_end').notNull(),
  bytesIn: bigint('bytes_in', { mode: 'number' }).notNull(),
  bytesOut: bigint('bytes_out', { mode: 'number' }).notNull(),
  totalBytes: bigint('total_bytes', { mode: 'number' }).notNull(),
  sessionCount: integer('session_count').default(0),
  totalDuration: bigint('total_duration', { mode: 'number' }).default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  usageSecretIdx: index('usage_secret_idx').on(table.pppSecretId),
  usagePeriodIdx: index('usage_period_idx').on(table.period),
}));

// ============================================================================
// RESELLER TYPES (for multi-level hierarchy)
// ============================================================================

export const resellerRoleEnum = pgEnum('reseller_role', [
  'admin',      // Top-level (main ISP admin)
  'macro',       // Macro reseller (first level)
  'reseller',    // Regular reseller
  'sub_reseller' // Sub-reseller (any level below)
]);

export const commissionTypeEnum = pgEnum('commission_type', [
  'percentage', // Percentage of sale
  'fixed',      // Fixed amount per sale
  'margin'      // Margin-based (difference between buy/sell)
]);

export const transactionTypeEnum = pgEnum('transaction_type', [
  'credit',           // Funds added to wallet
  'debit',            // Funds deducted
  'commission_earned', // Commission received
  'commission_paid',  // Commission paid to parent
  'package_sale',     // Package sale revenue
  'package_cost',     // Package cost to parent
  'refund',           // Refund issued
  'adjustment'        // Manual adjustment
]);

export const resellerStatusEnum = pgEnum('reseller_status', [
  'active',
  'suspended',
  'inactive',
  'pending'
]);

// ============================================================================
// RESELLERS (Hierarchical structure with unlimited depth)
// ============================================================================

export const resellers = pgTable('resellers', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  
  // Link to user account
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  
  // Hierarchy - self-referencing (parent_id = null means top-level macro)
  parentId: uuid('parent_id'),
  
  // Reseller details
  name: varchar('name', { length: 255 }).notNull(),
  companyName: varchar('company_name', { length: 255 }),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  address: text('address'),
  
  // Role in hierarchy
  role: resellerRoleEnum('role').default('reseller').notNull(),
  level: integer('level').default(1), // 1 = macro, 2 = sub, 3 = sub-sub, etc.
  
  // Commission settings
  commissionType: commissionTypeEnum('commission_type').default('percentage'),
  commissionValue: numeric('commission_value', { precision: 5, scale: 2 }).default('0'), // percentage or fixed amount
  marginPercent: numeric('margin_percent', { precision: 5, scale: 2 }).default('0'), // for margin-based commission
  
  // Fund dependency control
  fundDependencyEnabled: boolean('fund_dependency_enabled').default(true).notNull(),
  creditLimit: numeric('credit_limit', { precision: 10, scale: 2 }).default('0'), // Allow negative balance up to this limit
  
  // Wallet balance
  walletBalance: numeric('wallet_balance', { precision: 12, scale: 2 }).default('0').notNull(),
  
  // Status
  status: resellerStatusEnum('status').default('pending').notNull(),
  
  // Settings
  settings: jsonb('settings').default({}),
  
  // Metadata
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  resellerOrgIdx: index('reseller_org_idx').on(table.organizationId),
  resellerParentIdx: index('reseller_parent_idx').on(table.parentId),
  resellerUserIdx: index('reseller_user_idx').on(table.userId),
  resellerStatusIdx: index('reseller_status_idx').on(table.status),
}));

// ============================================================================
// RESELLER WALLET TRANSACTIONS (Ledger)
// ============================================================================

export const resellerTransactions = pgTable('reseller_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  resellerId: uuid('reseller_id').references(() => resellers.id, { onDelete: 'cascade' }).notNull(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  
  // Transaction details
  type: transactionTypeEnum('type').notNull(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  balanceBefore: numeric('balance_before', { precision: 12, scale: 2 }).notNull(),
  balanceAfter: numeric('balance_after', { precision: 12, scale: 2 }).notNull(),
  
  // Reference (for linking to related entities)
  referenceType: varchar('reference_type', { length: 50 }), // e.g., 'package_sale', 'commission', 'deposit'
  referenceId: uuid('reference_id'),
  
  // Related reseller (for commission transactions)
  relatedResellerId: uuid('related_reseller_id'),
  
  // Description
  description: text('description'),
  notes: text('notes'),
  
  // Metadata
  ipAddress: inet('ip_address'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  transactionResellerIdx: index('transaction_reseller_idx').on(table.resellerId),
  transactionOrgIdx: index('transaction_org_idx').on(table.organizationId),
  transactionTypeIdx: index('transaction_type_idx').on(table.type),
  transactionRefIdx: index('transaction_ref_idx').on(table.referenceType, table.referenceId),
}));

// ============================================================================
// RESELLER COMMISSION RULES (Per package/plan)
// ============================================================================

export const resellerCommissions = pgTable('reseller_commissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  resellerId: uuid('reseller_id').references(() => resellers.id, { onDelete: 'cascade' }).notNull(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  
  // Package/plan reference
  billingPlanId: uuid('billing_plan_id').references(() => billingPlans.id, { onDelete: 'cascade' }),
  
  // Commission settings for this specific plan
  commissionType: commissionTypeEnum('commission_type').default('percentage'),
  commissionValue: numeric('commission_value', { precision: 5, scale: 2 }).notNull(),
  
  // Optional cap
  maxCommission: numeric('max_commission', { precision: 10, scale: 2 }),
  minCommission: numeric('min_commission', { precision: 10, scale: 2 }).default('0'),
  
  // Active
  isActive: boolean('is_active').default(true).notNull(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  commissionResellerIdx: index('commission_reseller_idx').on(table.resellerId),
  commissionPlanIdx: index('commission_plan_idx').on(table.billingPlanId),
}));

// ============================================================================
// RESELLER HIERARCHY VIEW (For quick tree queries)
// ============================================================================

export const resellerHierarchy = pgTable('reseller_hierarchy', {
  id: uuid('id').primaryKey().defaultRandom(),
  ancestorId: uuid('ancestor_id').references(() => resellers.id, { onDelete: 'cascade' }).notNull(),
  descendantId: uuid('descendant_id').references(() => resellers.id, { onDelete: 'cascade' }).notNull(),
  depth: integer('depth').notNull(), // 0 = self, 1 = direct child, 2 = grandchild, etc.
}, (table) => ({
  hierarchyAncestorIdx: index('hierarchy_ancestor_idx').on(table.ancestorId),
  hierarchyDescendantIdx: index('hierarchy_descendant_idx').on(table.descendantId),
}));

// ============================================================================
// RELATIONS
// ============================================================================

export const resellersRelations = relations(resellers, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [resellers.organizationId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [resellers.userId],
    references: [users.id],
  }),
  parent: one(resellers, {
    fields: [resellers.parentId],
    references: [resellers.id],
    relationName: 'parent_reseller',
  }),
  children: many(resellers, {
    relationName: 'child_resellers',
  }),
  transactions: many(resellerTransactions),
  commissions: many(resellerCommissions),
}));

export const resellerTransactionsRelations = relations(resellerTransactions, ({ one }) => ({
  reseller: one(resellers, {
    fields: [resellerTransactions.resellerId],
    references: [resellers.id],
  }),
  relatedReseller: one(resellers, {
    fields: [resellerTransactions.relatedResellerId],
    references: [resellers.id],
  }),
}));

export const resellerCommissionsRelations = relations(resellerCommissions, ({ one }) => ({
  reseller: one(resellers, {
    fields: [resellerCommissions.resellerId],
    references: [resellers.id],
  }),
  billingPlan: one(billingPlans, {
    fields: [resellerCommissions.billingPlanId],
    references: [billingPlans.id],
  }),
}));

export const resellerHierarchyRelations = relations(resellerHierarchy, ({ one }) => ({
  ancestor: one(resellers, {
    fields: [resellerHierarchy.ancestorId],
    references: [resellers.id],
    relationName: 'ancestor_reseller',
  }),
  descendant: one(resellers, {
    fields: [resellerHierarchy.descendantId],
    references: [resellers.id],
    relationName: 'descendant_reseller',
  }),
}));

// ============================================================================
// OLT (Optical Line Terminal) - Network Equipment
// ============================================================================

export const olts = pgTable('olts', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }),
  resellerId: uuid('reseller_id').references(() => resellers.id, { onDelete: 'cascade' }),
  
  // OLT identification
  name: varchar('name', { length: 255 }).notNull(),
  brand: varchar('brand', { length: 100 }).notNull(), // e.g., 'Huawei', 'ZTE', 'VSOL', 'FiberHome'
  model: varchar('model', { length: 100 }),
  
  // Network access
  ipAddress: inet('ip_address').notNull(),
  snmpVersion: snmpVersionEnum('snmp_version').default('v2c'),
  snmpCommunity: varchar('snmp_community', { length: 255 }),
  snmpPort: integer('snmp_port').default(161),
  
  // SNMP v3 credentials (encrypted)
  snmpV3Username: varchar('snmp_v3_username', { length: 100 }),
  snmpV3AuthProtocol: varchar('snmp_v3_auth_protocol', { length: 20 }), // 'MD5' or 'SHA'
  snmpV3AuthPassword: text('snmp_v3_auth_password'),
  snmpV3PrivProtocol: varchar('snmp_v3_priv_protocol', { length: 20 }), // 'AES' or 'DES'
  snmpV3PrivPassword: text('snmp_v3_priv_password'),
  
  // Location
  location: varchar('location', { length: 255 }),
  latitude: numeric('latitude', { precision: 10, scale: 7 }),
  longitude: numeric('longitude', { precision: 10, scale: 7 }),
  
  // Status
  status: oltStatusEnum('status').default('pending'),
  
  // Last SNMP poll
  lastPollAt: timestamp('last_poll_at'),
  lastSuccessfulPollAt: timestamp('last_successful_poll_at'),
  
  // Metadata
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  oltOrgIdx: index('olt_org_idx').on(table.organizationId),
  oltResellerIdx: index('olt_reseller_idx').on(table.resellerId),
  oltIpIdx: index('olt_ip_idx').on(table.ipAddress),
  oltStatusIdx: index('olt_status_idx').on(table.status),
}));

// ============================================================================
// OLT PON Ports
// ============================================================================

export const oltPonPorts = pgTable('olt_pon_ports', {
  id: uuid('id').primaryKey().defaultRandom(),
  oltId: uuid('olt_id').references(() => olts.id, { onDelete: 'cascade' }).notNull(),
  
  // Port identification
  slotNo: integer('slot_no').notNull(),
  ponNo: integer('pon_no').notNull(),
  portNo: integer('port_no'), // For some OLTs that have multiple ports per PON
  
  // Port capabilities
  totalOnu: integer('total_onu').default(64), // Max ONUs for this PON
  
  // Current stats
  activeOnu: integer('active_onu').default(0),
  
  // Status
  status: ponPortStatusEnum('status').default('online'),
  
  // Optical parameters
  opticalTxPower: numeric('optical_tx_power', { precision: 6, scale: 2 }), // dBm
  opticalRxPower: numeric('optical_rx_power', { precision: 6, scale: 2 }), // dBm
  
  // Last update
  lastPollAt: timestamp('last_poll_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  ponOltIdx: index('pon_olt_idx').on(table.oltId),
  ponPortIdx: index('pon_port_idx').on(table.oltId, table.slotNo, table.ponNo),
}));

// ============================================================================
// ONUs (Optical Network Units)
// ============================================================================

export const onus = pgTable('onus', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }),
  oltId: uuid('olt_id').references(() => olts.id, { onDelete: 'cascade' }).notNull(),
  ponPortId: uuid('pon_port_id').references(() => oltPonPorts.id, { onDelete: 'cascade' }),
  resellerId: uuid('reseller_id').references(() => resellers.id, { onDelete: 'set null' }),
  
  // ONU identification
  serialNumber: varchar('serial_number', { length: 100 }).notNull(),
  macAddress: varchar('mac_address', { length: 17 }),
  name: varchar('name', { length: 255 }),
  model: varchar('model', { length: 100 }),
  vendor: varchar('vendor', { length: 100 }), // Manufacturer
  
  // Customer link
  customerId: uuid('customer_id'), // Link to customer (if managed by system)
  customerName: varchar('customer_name', { length: 255 }),
  
  // ONU configuration from OLT
  onuId: integer('onu_id'), // Internal OLT ID
  onuType: varchar('onu_type', { length: 50 }), // e.g., 'HG8245', 'G-2425'
  
  // Status
  status: onuStatusEnum('status').default('pending'),
  
  // Optical signal levels
  rxPower: numeric('rx_power', { precision: 6, scale: 2 }), // dBm
  txPower: numeric('tx_power', { precision: 6, scale: 2 }), // dBm
  rxOnuPower: numeric('rx_onu_power', { precision: 6, scale: 2 }), // ONU RX (OLT TX)
  txOnuPower: numeric('tx_onu_power', { precision: 6, scale: 2 }), // ONU TX (OLT RX)
  
  // Signal quality
  signalStrength: integer('signal_strength'), // -dBm as positive int
  signalQuality: varchar('signal_quality', { length: 20 }), // 'excellent', 'good', 'fair', 'poor'
  
  // Distance from OLT (in meters)
  distance: integer('distance'),
  
  // Traffic stats
  rxBytes: bigint('rx_bytes', { mode: 'number' }),
  txBytes: bigint('tx_bytes', { mode: 'number' }),
  rxPackets: bigint('rx_packets', { mode: 'number' }),
  txPackets: bigint('tx_packets', { mode: 'number' }),
  
  // Last seen
  lastSeenAt: timestamp('last_seen_at'),
  firstSeenAt: timestamp('first_seen_at'),
  
  // Last update
  lastPollAt: timestamp('last_poll_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  onuOltIdx: index('onu_olt_idx').on(table.oltId),
  onuPonIdx: index('onu_pon_idx').on(table.ponPortId),
  onuSerialIdx: index('onu_serial_idx').on(table.serialNumber),
  onuMacIdx: index('onu_mac_idx').on(table.macAddress),
  onuStatusIdx: index('onu_status_idx').on(table.status),
  onuResellerIdx: index('onu_reseller_idx').on(table.resellerId),
}));

// ============================================================================
// OLT Alarms
// ============================================================================

export const oltAlarms = pgTable('olt_alarms', {
  id: uuid('id').primaryKey().defaultRandom(),
  oltId: uuid('olt_id').references(() => olts.id, { onDelete: 'cascade' }).notNull(),
  onuId: uuid('onu_id').references(() => onus.id, { onDelete: 'cascade' }),
  
  // Alarm details
  severity: alarmSeverityEnum('severity').notNull(),
  alarmType: varchar('alarm_type', { length: 100 }).notNull(), // e.g., 'LOS', 'LOKI', 'LOAI', 'HIGH_TEMP'
  message: text('message').notNull(),
  
  // Additional data
  oid: varchar('oid', { length: 255 }), // SNMP OID that triggered alarm
  value: text('value'), // Value that triggered alarm
  
  // Resolution
  resolved: boolean('resolved').default(false).notNull(),
  resolvedAt: timestamp('resolved_at'),
  resolvedBy: uuid('resolved_by').references(() => users.id),
  resolutionNote: text('resolution_note'),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  alarmOltIdx: index('alarm_olt_idx').on(table.oltId),
  alarmOnuIdx: index('alarm_onu_idx').on(table.onuId),
  alarmSeverityIdx: index('alarm_severity_idx').on(table.severity),
  alarmResolvedIdx: index('alarm_resolved_idx').on(table.resolved),
  alarmCreatedIdx: index('alarm_created_idx').on(table.createdAt),
}));

// ============================================================================
// OLT Metrics (Time-series for monitoring)
// ============================================================================

export const oltMetrics = pgTable('olt_metrics', {
  id: uuid('id').primaryKey().defaultRandom(),
  oltId: uuid('olt_id').references(() => olts.id, { onDelete: 'cascade' }).notNull(),
  
  // CPU, Memory, Temperature
  cpuUsage: numeric('cpu_usage', { precision: 5, scale: 2 }),
  memoryUsage: numeric('memory_usage', { precision: 5, scale: 2 }),
  temperature: numeric('temperature', { precision: 5, scale: 2 }),
  
  // Uptime
  uptime: bigint('uptime', { mode: 'number' }), // seconds
  
  // PON status
  ponOnline: integer('pon_online'),
  ponOffline: integer('pon_offline'),
  
  // Traffic (bytes per second)
  rxBps: bigint('rx_bps', { mode: 'number' }),
  txBps: bigint('tx_bps', { mode: 'number' }),
  
  // Total traffic
  totalRxBytes: bigint('total_rx_bytes', { mode: 'number' }),
  totalTxBytes: bigint('total_tx_bytes', { mode: 'number' }),
  
  // Timestamps
  recordedAt: timestamp('recorded_at').defaultNow().notNull(),
}, (table) => ({
  metricsOltIdx: index('metrics_olt_idx').on(table.oltId),
  metricsRecordedIdx: index('metrics_recorded_idx').on(table.recordedAt),
}));

// ============================================================================
// OLT Relations
// ============================================================================

export const oltsRelations = relations(olts, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [olts.organizationId],
    references: [organizations.id],
  }),
  reseller: one(resellers, {
    fields: [olts.resellerId],
    references: [resellers.id],
  }),
  ponPorts: many(oltPonPorts),
  metrics: many(oltMetrics),
  alarms: many(oltAlarms),
}));

export const oltPonPortsRelations = relations(oltPonPorts, ({ one, many }) => ({
  olt: one(olts, {
    fields: [oltPonPorts.oltId],
    references: [olts.id],
  }),
  onus: many(onus),
}));

export const onusRelations = relations(onus, ({ one }) => ({
  olt: one(olts, {
    fields: [onus.oltId],
    references: [olts.id],
  }),
  ponPort: one(oltPonPorts, {
    fields: [onus.ponPortId],
    references: [oltPonPorts.id],
  }),
  reseller: one(resellers, {
    fields: [onus.resellerId],
    references: [resellers.id],
  }),
  organization: one(organizations, {
    fields: [onus.organizationId],
    references: [organizations.id],
  }),
}));

export const oltAlarmsRelations = relations(oltAlarms, ({ one }) => ({
  olt: one(olts, {
    fields: [oltAlarms.oltId],
    references: [olts.id],
  }),
  onu: one(onus, {
    fields: [oltAlarms.onuId],
    references: [onus.id],
  }),
  resolver: one(users, {
    fields: [oltAlarms.resolvedBy],
    references: [users.id],
  }),
}));

export const oltMetricsRelations = relations(oltMetrics, ({ one }) => ({
  olt: one(olts, {
    fields: [oltMetrics.oltId],
    references: [olts.id],
  }),
}));

export type Organization = InferSelectModel<typeof organizations>;
export type NewOrganization = InferInsertModel<typeof organizations>;
export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;
export type Router = InferSelectModel<typeof routers>;
export type NewRouter = InferInsertModel<typeof routers>;
export type PppSecret = InferSelectModel<typeof pppSecrets>;
export type NewPppSecret = InferInsertModel<typeof pppSecrets>;
export type PppActiveConnection = InferSelectModel<typeof pppActive>;
export type HotspotActiveUser = InferSelectModel<typeof hotspotActive>;
export type InterfaceStat = InferSelectModel<typeof interfaceStats>;
export type SystemResource = InferSelectModel<typeof systemResources>;
export type CommandLog = InferSelectModel<typeof commandLogs>;
export type AuditLog = InferSelectModel<typeof auditLogs>;
export type TrafficMetric = InferSelectModel<typeof trafficMetrics>;
export type PppUsageLog = InferSelectModel<typeof pppUsageLogs>;
export type UserDataUsage = InferSelectModel<typeof userDataUsage>;
export type BillingPlan = InferSelectModel<typeof billingPlans>;
export type BillingProfile = InferSelectModel<typeof billingProfiles>;
export type Invoice = InferSelectModel<typeof invoices>;

// Reseller types
export type Reseller = InferSelectModel<typeof resellers>;
export type NewReseller = InferInsertModel<typeof resellers>;
export type ResellerTransaction = InferSelectModel<typeof resellerTransactions>;
export type NewResellerTransaction = InferInsertModel<typeof resellerTransactions>;
export type ResellerCommission = InferSelectModel<typeof resellerCommissions>;
export type NewResellerCommission = InferInsertModel<typeof resellerCommissions>;

// OLT types
export type Olt = InferSelectModel<typeof olts>;
export type NewOlt = InferInsertModel<typeof olts>;
export type OltPonPort = InferSelectModel<typeof oltPonPorts>;
export type NewOltPonPort = InferInsertModel<typeof oltPonPorts>;
export type Onu = InferSelectModel<typeof onus>;
export type NewOnu = InferInsertModel<typeof onus>;
export type OltAlarm = InferSelectModel<typeof oltAlarms>;
export type NewOltAlarm = InferInsertModel<typeof oltAlarms>;
export type OltMetric = InferSelectModel<typeof oltMetrics>;
export type NewOltMetric = InferInsertModel<typeof oltMetrics>;

// Staff users
export type StaffUser = InferSelectModel<typeof staffUsers>;
export type NewStaffUser = InferInsertModel<typeof staffUsers>;

// Notifications
export type Notification = InferSelectModel<typeof notifications>;
export type NewNotification = InferInsertModel<typeof notifications>;

// Fund requests
export type FundRequest = InferSelectModel<typeof fundRequests>;
export type NewFundRequest = InferInsertModel<typeof fundRequests>;

// Bulk imports
export type BulkImport = InferSelectModel<typeof bulkImports>;
export type NewBulkImport = InferInsertModel<typeof bulkImports>;
export type BulkImportRow = InferSelectModel<typeof bulkImportRows>;
export type NewBulkImportRow = InferInsertModel<typeof bulkImportRows>;

// Scheduled jobs
export type ScheduledJob = InferSelectModel<typeof scheduledJobs>;
export type NewScheduledJob = InferInsertModel<typeof scheduledJobs>;
export type JobExecutionLog = InferSelectModel<typeof jobExecutionLogs>;
export type NewJobExecutionLog = InferInsertModel<typeof jobExecutionLogs>;

// ============================================================================
// STAFF USERS (For reseller sub-accounts)
// ============================================================================

export const staffRoleEnum = pgEnum('staff_role', [
  'billing',
  'technical',
  'manager',
  'support'
]);

export const staffUsers = pgTable('staff_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  resellerId: uuid('reseller_id').references(() => resellers.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  
  // Staff details
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  
  // Role and permissions
  role: staffRoleEnum('role').notNull(),
  permissions: jsonb('permissions').default([]),
  
  // Status
  isActive: boolean('is_active').default(true).notNull(),
  
  // Metadata
  lastLoginAt: timestamp('last_login_at'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  staffResellerIdx: index('staff_reseller_idx').on(table.resellerId),
  staffUserIdx: index('staff_user_idx').on(table.userId),
  staffRoleIdx: index('staff_role_idx').on(table.role),
}));

// ============================================================================
// NOTIFICATIONS (SMS/Email alerts)
// ============================================================================

export const notificationTypeEnum = pgEnum('notification_type', [
  'sms',
  'email',
  'push'
]);

export const notificationStatusEnum = pgEnum('notification_status', [
  'pending',
  'sent',
  'failed',
  'cancelled'
]);

export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }),
  resellerId: uuid('reseller_id').references(() => resellers.id, { onDelete: 'set null' }),
  pppSecretId: uuid('ppp_secret_id').references(() => pppSecrets.id, { onDelete: 'set null' }),
  
  // Notification type
  type: notificationTypeEnum('type').notNull(),
  
  // Recipient
  recipient: varchar('recipient', { length: 255 }).notNull(), // phone or email
  recipientName: varchar('recipient_name', { length: 255 }),
  
  // Content
  subject: varchar('subject', { length: 500 }),
  message: text('message').notNull(),
  
  // Template
  templateId: varchar('template_id', { length: 100 }),
  templateData: jsonb('template_data').default({}),
  
  // Status
  status: notificationStatusEnum('status').default('pending').notNull(),
  
  // Response
  gatewayResponse: text('gateway_response'),
  
  // Scheduled
  scheduledAt: timestamp('scheduled_at'),
  sentAt: timestamp('sent_at'),
  
  // Metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  notifOrgIdx: index('notif_org_idx').on(table.organizationId),
  notifResellerIdx: index('notif_reseller_idx').on(table.resellerId),
  notifPppIdx: index('notif_ppp_idx').on(table.pppSecretId),
  notifStatusIdx: index('notif_status_idx').on(table.status),
  notifRecipientIdx: index('notif_recipient_idx').on(table.recipient),
}));

// ============================================================================
// FUND REQUESTS
// ============================================================================

export const fundRequestStatusEnum = pgEnum('fund_request_status', [
  'pending',
  'approved',
  'rejected',
  'cancelled'
]);

export const fundRequests = pgTable('fund_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  resellerId: uuid('reseller_id').references(() => resellers.id, { onDelete: 'cascade' }).notNull(),
  
  // Request details
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  paymentMethod: varchar('payment_method', { length: 50 }),
  transactionRef: varchar('transaction_ref', { length: 200 }),
  
  // Status
  status: fundRequestStatusEnum('status').default('pending').notNull(),
  
  // Approval
  approvedBy: uuid('approved_by').references(() => users.id),
  approvedAt: timestamp('approved_at'),
  rejectionReason: text('rejection_reason'),
  
  // Notes
  notes: text('notes'),
  adminNotes: text('admin_notes'),
  
  // Metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  fundReqOrgIdx: index('fund_req_org_idx').on(table.organizationId),
  fundReqResellerIdx: index('fund_req_reseller_idx').on(table.resellerId),
  fundReqStatusIdx: index('fund_req_status_idx').on(table.status),
}));

// ============================================================================
// BULK IMPORT (Excel Upload)
// ============================================================================

export const bulkImportStatusEnum = pgEnum('bulk_import_status', [
  'pending',
  'processing',
  'completed',
  'failed',
  'partial'
]);

export const bulkImports = pgTable('bulk_imports', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  resellerId: uuid('reseller_id').references(() => resellers.id, { onDelete: 'set null' }),
  uploadedBy: uuid('uploaded_by').references(() => users.id, { onDelete: 'set null' }),
  
  // Import details
  type: varchar('type', { length: 50 }).notNull(), // 'users', 'invoices', 'packages'
  fileName: varchar('file_name', { length: 255 }).notNull(),
  fileSize: integer('file_size'),
  recordCount: integer('record_count').default(0),
  successCount: integer('success_count').default(0),
  failureCount: integer('failure_count').default(0),
  
  // Status
  status: bulkImportStatusEnum('status').default('pending').notNull(),
  
  // Error log
  errorLog: text('error_log'),
  
  // Preview data
  previewData: jsonb('preview_data').default([]),
  
  // Processing completed
  completedAt: timestamp('completed_at'),
  
  // Metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  bulkImportOrgIdx: index('bulk_import_org_idx').on(table.organizationId),
  bulkImportResellerIdx: index('bulk_import_reseller_idx').on(table.resellerId),
  bulkImportStatusIdx: index('bulk_import_status_idx').on(table.status),
}));

// ============================================================================
// BULK IMPORT ROWS (Individual rows from import)
// ============================================================================

export const bulkImportRows = pgTable('bulk_import_rows', {
  id: uuid('id').primaryKey().defaultRandom(),
  bulkImportId: uuid('bulk_import_id').references(() => bulkImports.id, { onDelete: 'cascade' }).notNull(),
  
  // Row data
  rowNumber: integer('row_number').notNull(),
  data: jsonb('data').notNull(),
  
  // Status
  status: varchar('status', { length: 20 }).default('pending'), // pending, success, failed
  
  // Error
  errorMessage: text('error_message'),
  
  // Created entity
  entityType: varchar('entity_type', { length: 50 }),
  entityId: uuid('entity_id'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  bulkImportRowIdx: index('bulk_import_row_idx').on(table.bulkImportId),
  bulkImportRowStatusIdx: index('bulk_import_row_status_idx').on(table.status),
}));

// ============================================================================
// JOB SCHEDULER (For cron jobs)
// ============================================================================

export const scheduledJobs = pgTable('scheduled_jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }),
  
  // Job details
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description'),
  cronExpression: varchar('cron_expression', { length: 50 }),
  
  // Job type
  type: varchar('type', { length: 50 }).notNull(), // 'billing', 'suspend', 'expiry_check', etc.
  
  // Configuration
  config: jsonb('config').default({}),
  
  // Status
  isActive: boolean('is_active').default(true).notNull(),
  
  // Execution tracking
  lastRunAt: timestamp('last_run_at'),
  nextRunAt: timestamp('next_run_at'),
  lastStatus: varchar('last_status', { length: 20 }),
  lastError: text('last_error'),
  
  // Metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================================================
// JOB EXECUTION LOGS
// ============================================================================

export const jobExecutionLogs = pgTable('job_execution_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobId: uuid('job_id').references(() => scheduledJobs.id, { onDelete: 'cascade' }).notNull(),
  
  // Execution details
  status: varchar('status', { length: 20 }).notNull(), // running, success, failed
  startedAt: timestamp('started_at').notNull(),
  completedAt: timestamp('completed_at'),
  
  // Results
  recordsProcessed: integer('records_processed').default(0),
  recordsSuccess: integer('records_success').default(0),
  recordsFailed: integer('records_failed').default(0),
  
  // Error
  errorMessage: text('error_message'),
  stackTrace: text('stack_trace'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  jobExecJobIdx: index('job_exec_job_idx').on(table.jobId),
  jobExecStatusIdx: index('job_exec_status_idx').on(table.status),
}));

// ============================================================================
// RELATIONS FOR NEW TABLES
// ============================================================================

export const staffUsersRelations = relations(staffUsers, ({ one }) => ({
  reseller: one(resellers, {
    fields: [staffUsers.resellerId],
    references: [resellers.id],
  }),
  user: one(users, {
    fields: [staffUsers.userId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  organization: one(organizations, {
    fields: [notifications.organizationId],
    references: [organizations.id],
  }),
  reseller: one(resellers, {
    fields: [notifications.resellerId],
    references: [resellers.id],
  }),
  pppSecret: one(pppSecrets, {
    fields: [notifications.pppSecretId],
    references: [pppSecrets.id],
  }),
}));

export const fundRequestsRelations = relations(fundRequests, ({ one }) => ({
  organization: one(organizations, {
    fields: [fundRequests.organizationId],
    references: [organizations.id],
  }),
  reseller: one(resellers, {
    fields: [fundRequests.resellerId],
    references: [resellers.id],
  }),
  approver: one(users, {
    fields: [fundRequests.approvedBy],
    references: [users.id],
  }),
}));

export const bulkImportsRelations = relations(bulkImports, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [bulkImports.organizationId],
    references: [organizations.id],
  }),
  reseller: one(resellers, {
    fields: [bulkImports.resellerId],
    references: [resellers.id],
  }),
  uploader: one(users, {
    fields: [bulkImports.uploadedBy],
    references: [users.id],
  }),
  rows: many(bulkImportRows),
}));

export const bulkImportRowsRelations = relations(bulkImportRows, ({ one }) => ({
  bulkImport: one(bulkImports, {
    fields: [bulkImportRows.bulkImportId],
    references: [bulkImports.id],
  }),
}));

export const scheduledJobsRelations = relations(scheduledJobs, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [scheduledJobs.organizationId],
    references: [organizations.id],
  }),
  executions: many(jobExecutionLogs),
}));

export const jobExecutionLogsRelations = relations(jobExecutionLogs, ({ one }) => ({
  job: one(scheduledJobs, {
    fields: [jobExecutionLogs.jobId],
    references: [scheduledJobs.id],
  }),
}));
