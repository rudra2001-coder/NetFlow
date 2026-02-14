/**
 * Configuration Center Schema Extensions
 * Adds comprehensive configuration management for the NetFlow ISP Platform
 * Scope-based architecture: Global > Organization > Router
 */

import {
  pgEnum,
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  numeric,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { type InferSelectModel } from 'drizzle-orm';

// ============================================================================
// ENUMS
// ============================================================================

export const configScopeEnum = pgEnum('config_scope', [
  'global',
  'organization',
  'router',
]);

export const moduleStatusEnum = pgEnum('module_status', [
  'enabled',
  'disabled',
  'beta',
  'deprecated',
]);

export const automationTriggerEnum = pgEnum('automation_trigger', [
  'ppp_expiration',
  'bandwidth_threshold',
  'router_offline',
  'cpu_usage',
  'memory_usage',
  'disk_usage',
  'user_created',
  'invoice_overdue',
  'custom',
]);

export const automationActionEnum = pgEnum('automation_action', [
  'suspend_user',
  'notify_email',
  'notify_sms',
  'notify_telegram',
  'restart_router',
  'apply_template',
  'adjust_bandwidth',
  'create_ticket',
  'webhook',
]);

export const templateTypeEnum = pgEnum('template_type', [
  'firewall',
  'nat',
  'queue',
  'ppp_profile',
  'address_list',
  'dns',
  'mixed',
]);

export const pluginStatusEnum = pgEnum('plugin_status', [
  'active',
  'inactive',
  'error',
  'update_available',
]);

export const collectionMethodEnum = pgEnum('collection_method', [
  'rest',
  'snmp',
  'netflow',
  'ssh',
]);

export const regionStatusEnum = pgEnum('region_status', [
  'active',
  'inactive',
  'maintenance',
]);

export const commandStatusEnum = pgEnum('command_status', [
  'pending',
  'executing',
  'success',
  'failed',
  'timeout',
]);

export const healthStatusEnum = pgEnum('health_status', [
  'online',
  'offline',
  'degraded',
]);

export const alertSeverityEnum = pgEnum('alert_severity', [
  'info',
  'warning',
  'critical',
]);

export const alertStatusEnum = pgEnum('alert_status', [
  'triggered',
  'acknowledged',
  'resolved',
]);

// ============================================================================
// SYSTEM CONFIGURATION (Scope-Based)
// ============================================================================

export const systemConfig = pgTable('system_config', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: varchar('key', { length: 255 }).notNull(),
  value: jsonb('value').notNull(),
  scope: configScopeEnum('scope').default('global').notNull(),
  organizationId: uuid('organization_id'),
  routerId: uuid('router_id'),
  description: text('description'),
  schema: jsonb('schema').default({}),
  isEncrypted: boolean('is_encrypted').default(false),
  isSecret: boolean('is_secret').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================================================
// BACKEND INFRASTRUCTURE CONFIG
// ============================================================================

export const backendConfig = pgTable('backend_config', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id'),

  // API Rate Limiting
  rateLimitRequests: integer('rate_limit_requests').default(1000),
  rateLimitWindow: integer('rate_limit_window').default(60),
  tierMultiplier: integer('tier_multiplier').default(1),

  // Router Polling
  pollIntervalDefault: integer('poll_interval_default').default(30),
  pollIntervalCritical: integer('poll_interval_critical').default(10),
  maxConcurrentPolls: integer('max_concurrent_polls').default(50),

  // WebSocket
  wsHeartbeatInterval: integer('ws_heartbeat_interval').default(30),
  wsMaxConnections: integer('ws_max_connections').default(1000),
  wsReconnectDelay: integer('ws_reconnect_delay').default(5000),

  // Caching
  cacheType: varchar('cache_type', { length: 20 }).default('memory'),
  cacheTtlDefault: integer('cache_ttl_default').default(300),
  cacheTtlMetrics: integer('cache_ttl_metrics').default(60),
  redisUrl: varchar('redis_url', { length: 500 }),

  // Logging
  logLevel: varchar('log_level', { length: 20 }).default('info'),
  logFormat: varchar('log_format', { length: 20 }).default('json'),
  retentionDays: integer('retention_days').default(90),

  // Maintenance
  maintenanceMode: boolean('maintenance_mode').default(false),
  maintenanceMessage: text('maintenance_message'),
  allowedIpRanges: jsonb('allowed_ip_ranges').default([]),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================================================
// ROUTER DEFAULT CONFIGURATIONS
// ============================================================================

export const routerDefaults = pgTable('router_defaults', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id'),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),

  // PPP Profile Defaults
  defaultPppProfile: jsonb('default_ppp_profile').default({
    localAddress: '10.0.0.1',
    remoteAddress: '10.0.0.0/24',
    dnsPrimary: '8.8.8.8',
    dnsSecondary: '8.8.4.4',
    sessionTimeout: 0,
    idleTimeout: 3600,
    keepaliveTimeout: 60,
    defaultEncryption: true,
    authentication: ['pap', 'chap', 'mschap2'],
  }),

  // Bandwidth Plan Templates
  bandwidthPlanTemplates: jsonb('bandwidth_plan_templates').default([]),

  // DNS Defaults
  defaultDnsServers: jsonb('default_dns_servers').default({
    primary: '8.8.8.8',
    secondary: '8.8.4.4',
    forwardQueries: true,
    cacheSize: 2048,
  }),

  // Firewall Templates
  defaultFirewallTemplate: uuid('default_firewall_template'),

  // Auto-Backup
  autoBackupEnabled: boolean('auto_backup_enabled').default(true),
  backupRetentionDays: integer('backup_retention_days').default(30),
  backupSchedule: varchar('backup_schedule', { length: 100 }).default('0 2 * * *'),
  backupGeographies: jsonb('backup_geographies').default([
    { name: 'Primary', region: 'us-east-1' },
    { name: 'Secondary', region: 'eu-west-1' },
  ]),

  // Auto-Suspend Rules
  autoSuspendEnabled: boolean('auto_suspend_enabled').default(true),
  suspendGracePeriodDays: integer('suspend_grace_period_days').default(7),
  suspendGracePeriodHours: integer('suspend_grace_period_hours').default(0),
  suspendNotificationDays: integer('suspend_notification_days').default(3),

  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================================================
// SYSTEM MODULE TOGGLES
// ============================================================================

export const systemModules = pgTable('system_modules', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id'),

  // Core Modules
  pppEnabled: boolean('ppp_enabled').default(true).notNull(),
  hotspotEnabled: boolean('hotspot_enabled').default(false).notNull(),
  bandwidthMonitoringEnabled: boolean('bandwidth_monitoring_enabled').default(true).notNull(),
  netflowEnabled: boolean('netflow_enabled').default(false).notNull(),
  netflowSamplingRate: integer('netflow_sampling_rate').default(1),

  // Billing
  billingEnabled: boolean('billing_enabled').default(false).notNull(),
  billingProvider: varchar('billing_provider', { length: 50 }),

  // Reseller
  resellerModeEnabled: boolean('reseller_mode_enabled').default(false).notNull(),

  // Notifications
  smsGatewayEnabled: boolean('sms_gateway_enabled').default(false).notNull(),
  smsProvider: varchar('sms_provider', { length: 50 }),
  emailEnabled: boolean('email_enabled').default(true).notNull(),
  smtpConfig: jsonb('smtp_config').default({
    host: '',
    port: 587,
    secure: false,
    auth: { user: '', pass: '' },
    from: '',
  }),

  moduleStatus: moduleStatusEnum('module_status').default('enabled').notNull(),
  moduleVersion: varchar('module_version', { length: 20 }),
  lastUpdatedAt: timestamp('last_updated_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================================================
// ROLE-BASED ACCESS CONTROL (Configurable)
// ============================================================================

export const roles = pgTable('roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id'),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 50 }).notNull(),
  description: text('description'),
  isSystem: boolean('is_system').default(false),
  isDefault: boolean('is_default').default(false),
  permissions: jsonb('permissions').notNull(),
  permissionTemplate: varchar('permission_template', { length: 50 }),
  priority: integer('priority').default(0),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const rolePermissions = pgTable('role_permissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  roleId: uuid('role_id').notNull(),
  resource: varchar('resource', { length: 100 }).notNull(),
  action: varchar('action', { length: 50 }).notNull(),
  conditions: jsonb('conditions').default({}),
  grantedAt: timestamp('granted_at').defaultNow().notNull(),
  grantedBy: uuid('granted_by'),
});

// ============================================================================
// COMMAND AUDIT LOGGING
// ============================================================================

export const commandLogs = pgTable('command_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull(),
  userId: varchar('user_id', { length: 100 }).notNull(),
  routerId: uuid('router_id').notNull(),
  command: text('command').notNull(),
  targetResource: varchar('target_resource', { length: 100 }).notNull(),
  targetId: varchar('target_id', { length: 255 }),
  status: commandStatusEnum('status').default('pending').notNull(),
  result: text('result'),
  error: text('error'),
  ipAddress: varchar('ip_address', { length: 50 }),
  userAgent: text('user_agent'),
  metadata: jsonb('metadata').default({}),
  executionTimeMs: integer('execution_time_ms'),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  parentCommandId: uuid('parent_command_id'),
});

// ============================================================================
// ROUTER HEALTH MONITORING
// ============================================================================

export const routerHealth = pgTable('router_health', {
  id: uuid('id').primaryKey().defaultRandom(),
  routerId: uuid('router_id').notNull(),
  organizationId: uuid('organization_id').notNull(),
  status: healthStatusEnum('status').default('online').notNull(),
  responseTime: integer('response_time').default(0),
  lastSuccess: timestamp('last_success'),
  lastFailure: timestamp('last_failure'),
  failureCount: integer('failure_count').default(0),
  checkType: varchar('check_type', { length: 20 }).default('ping').notNull(),
  checkedAt: timestamp('checked_at').defaultNow().notNull(),
  metadata: jsonb('metadata').default({}),
});

// ============================================================================
// ALERT RULES AND EVENTS
// ============================================================================

export const alertRules = pgTable('alert_rules', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  metricType: varchar('metric_type', { length: 50 }).notNull(),
  thresholdType: varchar('threshold_type', { length: 20 }).default('static').notNull(),
  thresholdValue: integer('threshold_value').notNull(),
  thresholdPercentile: integer('threshold_percentile'),
  evaluationWindow: integer('evaluation_window').default(300),
  severity: alertSeverityEnum('severity').default('warning').notNull(),
  alertChannels: jsonb('alert_channels').default([]),
  isActive: boolean('is_active').default(true).notNull(),
  cooldownMinutes: integer('cooldown_minutes').default(60),
  lastTriggeredAt: timestamp('last_triggered_at'),
  triggerCount: integer('trigger_count').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const alertEvents = pgTable('alert_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  ruleId: uuid('rule_id').notNull(),
  routerId: uuid('router_id'),
  organizationId: uuid('organization_id').notNull(),
  thresholdValue: integer('threshold_value').notNull(),
  currentValue: integer('current_value').notNull(),
  status: alertStatusEnum('status').default('triggered').notNull(),
  acknowledgedBy: varchar('acknowledged_by', { length: 100 }),
  acknowledgedAt: timestamp('acknowledged_at'),
  resolvedAt: timestamp('resolved_at'),
  triggeredAt: timestamp('triggered_at').defaultNow().notNull(),
});

// ============================================================================
// ROUTER TEMPLATE ENGINE
// ============================================================================

export const routerTemplates = pgTable('router_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id'),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  type: templateTypeEnum('type').notNull(),
  version: varchar('version', { length: 20 }).default('1.0.0'),

  // Template Content
  mikrotikConfig: text('mikrotik_config').notNull(),
  variables: jsonb('variables').default([]),
  variableSchema: jsonb('variable_schema').default({}),

  // Validation
  validationRules: jsonb('validation_rules').default({
    syntaxCheck: true,
    dryRun: true,
    preFlightChecks: [],
  }),

  // Metadata
  tags: jsonb('tags').default([]),
  category: varchar('category', { length: 50 }),
  isSystem: boolean('is_system').default(false),
  usageCount: integer('usage_count').default(0),
  lastUsedAt: timestamp('last_used_at'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const templateExecutions = pgTable('template_executions', {
  id: uuid('id').primaryKey().defaultRandom(),
  templateId: uuid('template_id').notNull(),
  routerId: uuid('router_id').notNull(),
  executedBy: varchar('executed_by', { length: 100 }),

  // Execution Details
  variables: jsonb('variables').default({}),
  status: varchar('status', { length: 20 }).default('pending').notNull(),
  commandsExecuted: integer('commands_executed').default(0),
  commandsTotal: integer('commands_total').default(0),

  // Results
  output: text('output'),
  errorLog: text('error_log'),
  executionTimeMs: integer('execution_time_ms'),

  // Rollback
  rollbackEnabled: boolean('rollback_enabled').default(true),
  rollbackCommands: text('rollback_commands'),
  rolledBackAt: timestamp('rolled_back_at'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});

// ============================================================================
// AUTOMATION ENGINE
// ============================================================================

export const automationRules = pgTable('automation_rules', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),

  // Triggers
  triggerType: automationTriggerEnum('trigger_type').notNull(),
  triggerConditions: jsonb('trigger_conditions').notNull(),

  // Scheduling
  scheduleCron: varchar('schedule_cron', { length: 100 }),
  timezone: varchar('timezone', { length: 50 }).default('UTC'),
  isActive: boolean('is_active').default(true).notNull(),
  priority: integer('priority').default(0),

  // Actions
  actions: jsonb('actions').notNull(),

  // Execution History
  lastExecutedAt: timestamp('last_executed_at'),
  executionCount: integer('execution_count').default(0),
  lastError: text('last_error'),

  // Throttling
  cooldownMinutes: integer('cooldown_minutes').default(0),
  lastTriggeredAt: timestamp('last_triggered_at'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const automationExecutions = pgTable('automation_executions', {
  id: uuid('id').primaryKey().defaultRandom(),
  ruleId: uuid('rule_id').notNull(),
  triggerEvent: jsonb('trigger_event').notNull(),

  // Execution Status
  status: varchar('status', { length: 20 }).default('pending').notNull(),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),

  // Results
  actionResults: jsonb('action_results').default([]),
  totalDurationMs: integer('total_duration_ms'),
  errorMessage: text('error_message'),

  actionsExecuted: integer('actions_executed').default(0),
  actionsFailed: integer('actions_failed').default(0),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================================================
// PLUGIN SYSTEM
// ============================================================================

export const plugins = pgTable('plugins', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id'),

  // Plugin Identity
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 50 }).notNull(),
  version: varchar('version', { length: 20 }).notNull(),
  author: varchar('author', { length: 100 }),
  description: text('description'),

  // Plugin Type
  type: varchar('type', { length: 50 }).notNull(),
  capabilities: jsonb('capabilities').default([]),

  // Plugin Manifest
  manifest: jsonb('manifest').notNull(),

  // Configuration
  configSchema: jsonb('config_schema').default({}),
  config: jsonb('config').default({}),

  // Status
  status: pluginStatusEnum('status').default('inactive').notNull(),
  isRequired: boolean('is_required').default(false),

  // Metrics
  lastHeartbeat: timestamp('last_heartbeat'),
  errorCount: integer('error_count').default(0),
  lastError: text('last_error'),

  // Installation
  source: varchar('source', { length: 500 }),
  checksum: varchar('checksum', { length: 128 }),
  installedAt: timestamp('installed_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const pluginEvents = pgTable('plugin_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  pluginId: uuid('plugin_id').notNull(),

  eventType: varchar('event_type', { length: 100 }).notNull(),
  payload: jsonb('payload').notNull(),
  status: varchar('status', { length: 20 }).default('pending').notNull(),

  processedAt: timestamp('processed_at'),
  errorMessage: text('error_message'),
  retryCount: integer('retry_count').default(0),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================================================
// MULTI-REGION ARCHITECTURE
// ============================================================================

export const regions = pgTable('regions', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id'),

  // Region Identity
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 50 }).notNull(),
  description: text('description'),

  // Location
  country: varchar('country', { length: 100 }),
  city: varchar('city', { length: 100 }),
  timezone: varchar('timezone', { length: 50 }).default('UTC'),

  // Configuration
  status: regionStatusEnum('status').default('active').notNull(),
  isPrimary: boolean('is_primary').default(false),

  // Data Center Settings
  dcName: varchar('dc_name', { length: 100 }),
  dcProvider: varchar('dc_provider', { length: 50 }),
  dcRegion: varchar('dc_region', { length: 100 }),

  // Monitoring
  heartbeatInterval: integer('heartbeat_interval').default(60),
  offlineThreshold: integer('offline_threshold').default(300),

  // Metrics Collection
  defaultCollectionMethod: collectionMethodEnum('default_collection_method').default('snmp'),
  collectionInterval: integer('collection_interval').default(60),

  // Routing
  bgpConfig: jsonb('bgp_config').default({
    asn: null,
    neighbors: [],
    routeMaps: [],
  }),

  // Failover
  failoverEnabled: boolean('failover_enabled').default(false),
  failoverPartnerId: uuid('failover_partner_id'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const routerClusters = pgTable('router_clusters', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id'),
  regionId: uuid('region_id'),

  // Cluster Identity
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),

  // High Availability
  haMode: varchar('ha_mode', { length: 20 }).default('none'),
  leaderRouterId: uuid('leader_router_id'),
  electionMethod: varchar('election_method', { length: 30 }).default('priority'),

  // Configuration Sync
  configSyncEnabled: boolean('config_sync_enabled').default(true),
  syncInterval: integer('sync_interval').default(300),
  lastSyncAt: timestamp('last_sync_at'),

  // Failover
  autoFailoverEnabled: boolean('auto_failover_enabled').default(true),
  failoverThreshold: integer('failover_threshold').default(3),
  failoverDelay: integer('failover_delay').default(30),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================================================
// DATA COLLECTION CONFIGURATION
// ============================================================================

export const collectionConfigs = pgTable('collection_configs', {
  id: uuid('id').primaryKey().defaultRandom(),
  routerId: uuid('router_id').notNull(),

  // Interface Selection
  monitoredInterfaces: jsonb('monitored_interfaces').default(['ether1', 'ether2', 'wlan1']),
  interfaceAggregation: boolean('interface_aggregation').default(false),
  aggregateGroups: jsonb('aggregate_groups').default([]),

  // Collection Method
  method: collectionMethodEnum('method').default('snmp'),
  restConfig: jsonb('rest_config').default({
    endpoint: '/interface/print',
    pollingInterval: 30,
  }),
  snmpConfig: jsonb('snmp_config').default({
    version: 'v2c',
    community: 'public',
    oids: ['1.3.6.1.2.1.2.2.1.10', '1.3.6.1.2.1.2.2.1.16'],
  }),
  netflowConfig: jsonb('netflow_config').default({
    version: 9,
    samplingRate: 1,
    sources: ['/ip/flow'],
    destinations: [],
  }),

  // Intervals
  collectionInterval: integer('collection_interval').default(60),
  highFrequencyInterval: integer('high_frequency_interval').default(10),

  // Retention
  rawDataRetentionDays: integer('raw_data_retention_days').default(7),
  aggregatedDataRetentionDays: integer('aggregated_data_retention_days').default(365),

  // Resolution
  defaultResolution: varchar('default_resolution', { length: 20 }).default('5m'),
  highResolutionEnabled: boolean('high_resolution_enabled').default(false),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================================================
// INTELLIGENT TRAFFIC ANALYZER
// ============================================================================

export const trafficAnalysis = pgTable('traffic_analysis', {
  id: uuid('id').primaryKey().defaultRandom(),
  routerId: uuid('router_id').notNull(),

  // Analysis Type
  analysisType: varchar('analysis_type', { length: 50 }).notNull(),

  // Configuration
  config: jsonb('config').notNull(),

  // Results
  result: jsonb('result').default({}),
  confidence: integer('confidence'),

  // Timestamps
  periodStart: timestamp('period_start').notNull(),
  periodEnd: timestamp('period_end').notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const anomalyRules = pgTable('anomaly_rules', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id'),

  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),

  // Detection Config
  metricType: varchar('metric_type', { length: 50 }).notNull(),
  thresholdType: varchar('threshold_type', { length: 20 }).default('static'),
  thresholdValue: integer('threshold_value').notNull(),
  thresholdPercentile: integer('threshold_percentile'),

  // Time Windows
  evaluationWindow: integer('evaluation_window').default(300),
  cooldownMinutes: integer('cooldown_minutes').default(60),

  // Severity
  severity: alertSeverityEnum('severity').default('warning').notNull(),
  alertChannels: jsonb('alert_channels').default(['email']),

  isActive: boolean('is_active').default(true).notNull(),
  lastTriggeredAt: timestamp('last_triggered_at'),
  triggerCount: integer('trigger_count').default(0),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================================================
// BILLING CONFIGURATION (Phase 2 Ready)
// ============================================================================

export const billingConfig = pgTable('billing_config', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id'),

  // Billing Period
  periodType: varchar('period_type', { length: 20 }).default('monthly'),
  periodDay: integer('period_day').default(1),
  prorationEnabled: boolean('proration_enabled').default(true),

  // Grace Period
  gracePeriodDays: integer('grace_period_days').default(7),
  gracePeriodHours: integer('grace_period_hours').default(0),

  // Suspension Behavior
  suspensionType: varchar('suspension_type', { length: 30 }).default('hard'),
  limitedAccessProfile: uuid('limited_access_profile'),

  // Tax Configuration
  taxEnabled: boolean('tax_enabled').default(false),
  taxMode: varchar('tax_mode', { length: 30 }).default('inclusive'),
  taxRules: jsonb('tax_rules').default([]),
  vatNumber: varchar('vat_number', { length: 50 }),

  // Invoice Settings
  invoicePrefix: varchar('invoice_prefix', { length: 20 }),
  invoiceTerms: text('invoice_terms'),
  invoiceFooter: text('invoice_footer'),

  // Payment Gateways
  stripeConfig: jsonb('stripe_config').default({
    enabled: false,
    apiKey: '',
    webhookSecret: '',
  }),
  paypalConfig: jsonb('paypal_config').default({
    enabled: false,
    clientId: '',
    clientSecret: '',
    mode: 'sandbox',
  }),
  localGatewayConfig: jsonb('local_gateway_config').default({
    enabled: false,
    name: '',
    apiUrl: '',
    apiKey: '',
  }),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================================================
// CAPACITY FORECASTING
// ============================================================================

export const capacityForecasts = pgTable('capacity_forecasts', {
  id: uuid('id').primaryKey().defaultRandom(),
  routerId: uuid('router_id').notNull(),
  organizationId: uuid('organization_id').notNull(),

  // Forecast Type
  metricType: varchar('metric_type', { length: 50 }).notNull(),

  // Analysis Results
  currentCapacity: integer('current_capacity').notNull(),
  peakUsage: integer('peak_usage').notNull(),
  averageGrowthRate: numeric('average_growth_rate', { precision: 10, scale: 4 }),
  predictedExhaustionDate: timestamp('predicted_exhaustion_date'),

  // Confidence
  confidenceLevel: integer('confidence_level'), // percentage
  modelVersion: varchar('model_version', { length: 20 }).default('1.0'),

  // Metadata
  lookbackDays: integer('lookback_days').default(30),
  forecastDays: integer('forecast_days').default(90),

  generatedAt: timestamp('generated_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type SystemConfig = InferSelectModel<typeof systemConfig>;
export type BackendConfig = InferSelectModel<typeof backendConfig>;
export type RouterDefaults = InferSelectModel<typeof routerDefaults>;
export type SystemModules = InferSelectModel<typeof systemModules>;
export type Role = InferSelectModel<typeof roles>;
export type RolePermission = InferSelectModel<typeof rolePermissions>;
export type CommandLog = InferSelectModel<typeof commandLogs>;
export type RouterHealth = InferSelectModel<typeof routerHealth>;
export type AlertRule = InferSelectModel<typeof alertRules>;
export type AlertEvent = InferSelectModel<typeof alertEvents>;
export type RouterTemplate = InferSelectModel<typeof routerTemplates>;
export type TemplateExecution = InferSelectModel<typeof templateExecutions>;
export type AutomationRule = InferSelectModel<typeof automationRules>;
export type AutomationExecution = InferSelectModel<typeof automationExecutions>;
export type Plugin = InferSelectModel<typeof plugins>;
export type PluginEvent = InferSelectModel<typeof pluginEvents>;
export type Region = InferSelectModel<typeof regions>;
export type RouterCluster = InferSelectModel<typeof routerClusters>;
export type CollectionConfig = InferSelectModel<typeof collectionConfigs>;
export type TrafficAnalysis = InferSelectModel<typeof trafficAnalysis>;
export type AnomalyRule = InferSelectModel<typeof anomalyRules>;
export type BillingConfig = InferSelectModel<typeof billingConfig>;
export type CapacityForecast = InferSelectModel<typeof capacityForecasts>;
