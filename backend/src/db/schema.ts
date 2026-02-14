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
  billingPlan: varchar('billing_plan', { length: 100 }),
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
  pppSecretStatusIdx: index('ppp_secret_status_idx').on(table.status),
  pppSecretCustomerIdx: index('ppp_secret_customer_idx').on(table.customerId),
  pppSecretExpiryIdx: index('ppp_secret_expiry_idx').on(table.expiryDate),
}));

export const pppSecretsRelations = relations(pppSecrets, ({ one, many }) => ({
  router: one(routers, {
    fields: [pppSecrets.routerId],
    references: [routers.id],
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
  gracePeriod: integer('grace_period').default(7),
  autoExtend: boolean('auto_extend').default(false),
  isActive: boolean('is_active').default(true).notNull(),
  features: jsonb('features').default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  billingPlanOrgIdx: index('billing_plan_org_idx').on(table.organizationId),
}));

export const invoices = pgTable('invoices', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  customerId: varchar('customer_id', { length: 100 }),
  invoiceNumber: varchar('invoice_number', { length: 50 }).unique().notNull(),
  billingPlanId: uuid('billing_plan_id').references(() => billingPlans.id),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  tax: numeric('tax', { precision: 10, scale: 2 }).default('0'),
  discount: numeric('discount', { precision: 10, scale: 2 }).default('0'),
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
  invoiceStatusIdx: index('invoice_status_idx').on(table.status),
  invoiceNumberIdx: index('invoice_number_idx').on(table.invoiceNumber),
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
// TYPE EXPORTS
// ============================================================================

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
export type Invoice = InferSelectModel<typeof invoices>;
