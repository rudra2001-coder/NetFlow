/**
 * Enterprise Extensions for NetFlow ISP Management Platform
 * Includes: Financial Ledger, User Subscriptions, Notifications, 
 * Analytics, Fraud Detection, OLT Enhancements
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
  date
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { organizations, users, resellers, billingPlans, billingProfiles, pppSecrets, olts } from './schema';

// ============================================================================
// ENUMS
// ============================================================================

// User Billing Type
export const userBillingTypeEnum = pgEnum('user_billing_type', [
  'prepaid', 
  'postpaid', 
  'on_demand', 
  'fixed_cycle'
]);

// Subscription Status
export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'active',
  'expired',
  'suspended',
  'cancelled',
  'pending',
  'throttled'
]);

// Overdue Policy
export const overduePolicyEnum = pgEnum('overdue_policy', [
  'suspend', 
  'throttle', 
  'restrict', 
  'notify'
]);

// Ledger Entry Type
export const ledgerEntryTypeEnum = pgEnum('ledger_entry_type', [
  'invoice_generated',
  'invoice_paid',
  'invoice_overdue',
  'subscription_created',
  'subscription_renewed',
  'subscription_upgraded',
  'subscription_downgraded',
  'subscription_cancelled',
  'proration_credit',
  'proration_charge',
  'wallet_deposit',
  'wallet_withdrawal',
  'commission_earned',
  'commission_paid',
  'refund',
  'adjustment',
  'late_fee',
  'credit_limit_exceeded',
  'speed_throttled',
  'service_suspended',
  'service_reactivated',
  'onu_disabled',
  'onu_enabled'
]);

// Commission Type Extended
export const commissionTypeExtendedEnum = pgEnum('commission_type_extended', [
  'percentage', 
  'fixed', 
  'share', 
  'margin'
]);

// Notification Channel
export const notificationChannelEnum = pgEnum('notification_channel', [
  'email', 
  'sms', 
  'whatsapp', 
  'telegram', 
  'push'
]);

// Notification Status
export const notificationStatusEnum = pgEnum('notification_status', [
  'pending', 
  'sent', 
  'failed', 
  'delivered'
]);

// Fraud Alert Type
export const fraudAlertTypeEnum = pgEnum('fraud_alert_type', [
  'ip_mismatch',
  'mac_swap',
  'onu_swap',
  'traffic_spike',
  'multiple_logins',
  'unusual_location'
]);

// ============================================================================
// ENTERPRISE RESELLER TABLES
// ============================================================================

// Reseller Wallets (Enhanced Fund Engine)
export const resellerWallets = pgTable('reseller_wallets', {
  id: uuid('id').primaryKey().defaultRandom(),
  resellerId: uuid('reseller_id').references(() => resellers.id, { onDelete: 'cascade' }).notNull().unique(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  
  balance: numeric('balance', { precision: 12, scale: 2 }).default('0').notNull(),
  creditLimit: numeric('credit_limit', { precision: 10, scale: 2 }).default('0').notNull(),
  
  isFundDependencyEnabled: boolean('is_fund_dependency_enabled').default(true).notNull(),
  autoRechargeEnabled: boolean('auto_recharge_enabled').default(false).notNull(),
  autoRechargeThreshold: numeric('auto_recharge_threshold', { precision: 10, scale: 2 }),
  autoRechargeAmount: numeric('auto_recharge_amount', { precision: 10, scale: 2 }),
  
  warnLowBalance: boolean('warn_low_balance').default(true).notNull(),
  lowBalanceThreshold: numeric('low_balance_threshold', { precision: 10, scale: 2 }).default('0'),
  
  currency: varchar('currency', { length: 3 }).default('BDT').notNull(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  walletResellerIdx: index('wallet_reseller_idx').on(table.resellerId),
  walletOrgIdx: index('wallet_org_idx').on(table.organizationId),
  walletBalanceIdx: index('wallet_balance_idx').on(table.balance),
}));

// Fund Transactions
export const fundTransactions = pgTable('fund_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  walletId: uuid('wallet_id').references(() => resellerWallets.id, { onDelete: 'cascade' }).notNull(),
  resellerId: uuid('reseller_id').references(() => resellers.id, { onDelete: 'cascade' }).notNull(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  
  type: varchar('type', { length: 50 }).notNull(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  balanceBefore: numeric('balance_before', { precision: 12, scale: 2 }).notNull(),
  balanceAfter: numeric('balance_after', { precision: 12, scale: 2 }).notNull(),
  
  referenceType: varchar('reference_type', { length: 50 }),
  referenceId: uuid('reference_id'),
  
  description: text('description'),
  notes: text('notes'),
  ipAddress: inet('ip_address'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  fundTxWalletIdx: index('fund_tx_wallet_idx').on(table.walletId),
  fundTxResellerIdx: index('fund_tx_reseller_idx').on(table.resellerId),
  fundTxTypeIdx: index('fund_tx_type_idx').on(table.type),
  fundTxRefIdx: index('fund_tx_ref_idx').on(table.referenceType, table.referenceId),
}));

// Commission Rules (Extended)
export const commissionRules = pgTable('commission_rules', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  resellerId: uuid('reseller_id').references(() => resellers.id, { onDelete: 'cascade' }).notNull(),
  
  billingPlanId: uuid('billing_plan_id').references(() => billingPlans.id, { onDelete: 'cascade' }),
  
  commissionType: commissionTypeExtendedEnum('commission_type').default('percentage').notNull(),
  value: numeric('value', { precision: 5, scale: 2 }).notNull(),
  maxValue: numeric('max_value', { precision: 10, scale: 2 }),
  minValue: numeric('min_value', { precision: 10, scale: 2 }).default('0'),
  
  appliesToLevel: integer('applies_to_level'),
  appliesToUserType: varchar('applies_to_user_type', { length: 20 }),
  
  effectiveFrom: date('effective_from'),
  effectiveTo: date('effective_to'),
  
  isActive: boolean('is_active').default(true).notNull(),
  isGlobal: boolean('is_global').default(false).notNull(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  commissionRuleResellerIdx: index('commission_rule_reseller_idx').on(table.resellerId),
  commissionRulePlanIdx: index('commission_rule_plan_idx').on(table.billingPlanId),
  commissionRuleOrgIdx: index('commission_rule_org_idx').on(table.organizationId),
  commissionRuleActiveIdx: index('commission_rule_active_idx').on(table.isActive),
}));

// Commission Transactions
export const commissionTransactions = pgTable('commission_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  
  fromUserId: uuid('from_user_id').references(() => users.id, { onDelete: 'set null' }),
  fromResellerId: uuid('from_reseller_id').references(() => resellers.id, { onDelete: 'set null' }),
  toResellerId: uuid('to_reseller_id').references(() => resellers.id, { onDelete: 'set null' }),
  
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  billingPlanId: uuid('billing_plan_id').references(() => billingPlans.id, { onDelete: 'set null' }),
  invoiceId: uuid('invoice_id'),
  
  saleAmount: numeric('sale_amount', { precision: 10, scale: 2 }).notNull(),
  commissionAmount: numeric('commission_amount', { precision: 10, scale: 2 }).notNull(),
  commissionRate: numeric('commission_rate', { precision: 5, scale: 2 }),
  level: integer('level').notNull(),
  
  status: varchar('status', { length: 20 }).default('pending').notNull(),
  paidAt: timestamp('paid_at'),
  
  referenceType: varchar('reference_type', { length: 50 }),
  referenceId: uuid('reference_id'),
  
  description: text('description'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  commissionTxResellerIdx: index('commission_tx_reseller_idx').on(table.toResellerId),
  commissionTxUserIdx: index('commission_tx_user_idx').on(table.userId),
  commissionTxPlanIdx: index('commission_tx_plan_idx').on(table.billingPlanId),
  commissionTxOrgIdx: index('commission_tx_org_idx').on(table.organizationId),
}));

// ============================================================================
// FINANCIAL LEDGER (Double-Entry System)
// ============================================================================

export const financialLedger = pgTable('financial_ledger', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  
  entityType: varchar('entity_type', { length: 50 }).notNull(),
  entityId: uuid('entity_id').notNull(),
  
  entryType: ledgerEntryTypeEnum('entry_type').notNull(),
  
  debit: numeric('debit', { precision: 12, scale: 2 }).default('0').notNull(),
  credit: numeric('credit', { precision: 12, scale: 2 }).default('0').notNull(),
  
  balanceBefore: numeric('balance_before', { precision: 12, scale: 2 }).notNull(),
  balanceAfter: numeric('balance_after', { precision: 12, scale: 2 }).notNull(),
  
  currency: varchar('currency', { length: 3 }).default('BDT').notNull(),
  
  referenceType: varchar('reference_type', { length: 50 }),
  referenceId: uuid('reference_id'),
  
  description: text('description'),
  notes: text('notes'),
  
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  ledgerEntityIdx: index('ledger_entity_idx').on(table.entityType, table.entityId),
  ledgerOrgIdx: index('ledger_org_idx').on(table.organizationId),
  ledgerEntryIdx: index('ledger_entry_idx').on(table.entryType),
  ledgerRefIdx: index('ledger_ref_idx').on(table.referenceType, table.referenceId),
  ledgerDateIdx: index('ledger_date_idx').on(table.createdAt),
}));

// ============================================================================
// USER SUBSCRIPTIONS (Multiple Active Plans)
// ============================================================================

export const userSubscriptions = pgTable('user_subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  pppSecretId: uuid('ppp_secret_id').references(() => pppSecrets.id, { onDelete: 'cascade' }),
  
  billingPlanId: uuid('billing_plan_id').references(() => billingPlans.id, { onDelete: 'cascade' }).notNull(),
  billingProfileId: uuid('billing_profile_id').references(() => billingProfiles.id, { onDelete: 'set null' }),
  
  status: subscriptionStatusEnum('status').default('pending').notNull(),
  billingType: userBillingTypeEnum('billing_type').default('prepaid').notNull(),
  
  startedAt: timestamp('started_at').notNull(),
  expiry: timestamp('expiry').notNull(),
  nextBillingDate: timestamp('next_billing_date'),
  
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  paidAmount: numeric('paid_amount', { precision: 10, scale: 2 }).default('0').notNull(),
  
  priority: integer('priority').default(1).notNull(),
  
  prorationEnabled: boolean('proration_enabled').default(true).notNull(),
  prorationCredit: numeric('proration_credit', { precision: 10, scale: 2 }).default('0'),
  prorationCharge: numeric('proration_charge', { precision: 10, scale: 2 }).default('0'),
  
  overduePolicy: overduePolicyEnum('overdue_policy').default('suspend').notNull(),
  throttleProfileId: uuid('throttle_profile_id'),
  
  autoRenew: boolean('auto_renew').default(true).notNull(),
  cancellationRequested: boolean('cancellation_requested').default(false).notNull(),
  cancellationDate: timestamp('cancellation_date'),
  
  settings: jsonb('settings').default({}),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  subUserIdx: index('sub_user_idx').on(table.userId),
  subSecretIdx: index('sub_secret_idx').on(table.pppSecretId),
  subPlanIdx: index('sub_plan_idx').on(table.billingPlanId),
  subStatusIdx: index('sub_status_idx').on(table.status),
  subExpiryIdx: index('sub_expiry_idx').on(table.expiry),
  subOrgIdx: index('sub_org_idx').on(table.organizationId),
  subPriorityIdx: index('sub_priority_idx').on(table.priority),
}));

// Proration Logs
export const prorationLogs = pgTable('proration_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  subscriptionId: uuid('subscription_id').references(() => userSubscriptions.id, { onDelete: 'cascade' }),
  
  oldPlanId: uuid('old_plan_id').references(() => billingPlans.id, { onDelete: 'set null' }),
  newPlanId: uuid('new_plan_id').references(() => billingPlans.id, { onDelete: 'set null' }),
  
  action: varchar('action', { length: 50 }).notNull(),
  daysRemaining: integer('days_remaining').notNull(),
  
  oldPricePerDay: numeric('old_price_per_day', { precision: 10, scale: 2 }).notNull(),
  newPricePerDay: numeric('new_price_per_day', { precision: 10, scale: 2 }).notNull(),
  
  creditAmount: numeric('credit_amount', { precision: 10, scale: 2 }).notNull(),
  chargeAmount: numeric('charge_amount', { precision: 10, scale: 2 }).notNull(),
  netAmount: numeric('net_amount', { precision: 10, scale: 2 }).notNull(),
  
  effectiveDate: timestamp('effective_date').notNull(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  prorationUserIdx: index('proration_user_idx').on(table.userId),
  prorationSubIdx: index('proration_sub_idx').on(table.subscriptionId),
  prorationDateIdx: index('proration_date_idx').on(table.effectiveDate),
}));

// ============================================================================
// NOTIFICATION ENGINE
// ============================================================================

// Notification Templates
export const notificationTemplates = pgTable('notification_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  
  name: varchar('name', { length: 100 }).notNull(),
  eventType: varchar('event_type', { length: 50 }).notNull(),
  channel: notificationChannelEnum('channel').notNull(),
  
  subject: varchar('subject', { length: 200 }),
  body: text('body').notNull(),
  bodyHtml: text('body_html'),
  
  variables: jsonb('variables').default([]),
  
  isActive: boolean('is_active').default(true).notNull(),
  isDefault: boolean('is_default').default(false).notNull(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  notifTemplateOrgIdx: index('notif_template_org_idx').on(table.organizationId),
  notifTemplateEventIdx: index('notif_template_event_idx').on(table.eventType, table.channel),
}));

// Notifications Log
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  templateId: uuid('template_id').references(() => notificationTemplates.id, { onDelete: 'set null' }),
  channel: notificationChannelEnum('channel').notNull(),
  
  recipient: varchar('recipient', { length: 255 }).notNull(),
  subject: varchar('subject', { length: 200 }),
  body: text('body').notNull(),
  
  status: notificationStatusEnum('status').default('pending').notNull(),
  
  sentAt: timestamp('sent_at'),
  deliveredAt: timestamp('delivered_at'),
  readAt: timestamp('read_at'),
  
  errorMessage: text('error_message'),
  externalId: varchar('external_id', { length: 100 }),
  
  referenceType: varchar('reference_type', { length: 50 }),
  referenceId: uuid('reference_id'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  notifUserIdx: index('notif_user_idx').on(table.userId),
  notifStatusIdx: index('notif_status_idx').on(table.status),
  notifChannelIdx: index('notif_channel_idx').on(table.channel),
  notifDateIdx: index('notif_date_idx').on(table.createdAt),
}));

// ============================================================================
// ANALYTICS TABLES
// ============================================================================

// Daily User Statistics
export const dailyUserStats = pgTable('daily_user_stats', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  billingPlanId: uuid('billing_plan_id').references(() => billingPlans.id, { onDelete: 'set null' }),
  resellerId: uuid('reseller_id').references(() => resellers.id, { onDelete: 'set null' }),
  
  date: date('date').notNull(),
  
  totalUsers: integer('total_users').default(0),
  newUsers: integer('new_users').default(0),
  activeUsers: integer('active_users').default(0),
  expiredUsers: integer('expired_users').default(0),
  suspendedUsers: integer('suspended_users').default(0),
  
  revenue: numeric('revenue', { precision: 12, scale: 2 }).default('0'),
  collectedAmount: numeric('collected_amount', { precision: 12, scale: 2 }).default('0'),
  
  dataUploaded: bigint('data_uploaded', { mode: 'number' }).default(0),
  dataDownloaded: bigint('data_downloaded', { mode: 'number' }).default(0),
  totalData: bigint('total_data', { mode: 'number' }).default(0),
}, (table) => ({
  dailyStatsOrgIdx: index('daily_stats_org_idx').on(table.organizationId),
  dailyStatsDateIdx: index('daily_stats_date_idx').on(table.date),
  dailyStatsPlanIdx: index('daily_stats_plan_idx').on(table.billingPlanId),
}));

// Reseller Analytics
export const resellerAnalytics = pgTable('reseller_analytics', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  resellerId: uuid('reseller_id').references(() => resellers.id, { onDelete: 'cascade' }).notNull(),
  
  periodStart: date('period_start').notNull(),
  periodEnd: date('period_end').notNull(),
  
  totalSales: numeric('total_sales', { precision: 12, scale: 2 }).default('0'),
  totalCommission: numeric('total_commission', { precision: 12, scale: 2 }).default('0'),
  totalUsers: integer('total_users').default(0),
  activeUsers: integer('active_users').default(0),
  
  newSubResellers: integer('new_sub_resellers').default(0),
  churnedSubResellers: integer('churned_sub_resellers').default(0),
  
  arpu: numeric('arpu', { precision: 10, scale: 2 }),
  collectionRate: numeric('collection_rate', { precision: 5, scale: 2 }),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  resellerAnalyticsResellerIdx: index('reseller_analytics_reseller_idx').on(table.resellerId),
  resellerAnalyticsPeriodIdx: index('reseller_analytics_period_idx').on(table.periodStart, table.periodEnd),
}));

// User Usage Analytics (for AI suggestions)
export const userUsageAnalytics = pgTable('user_usage_analytics', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  
  periodStart: date('period_start').notNull(),
  periodEnd: date('period_end').notNull(),
  
  avgUploadMb: numeric('avg_upload_mb', { precision: 12, scale: 2 }).default('0'),
  avgDownloadMb: numeric('avg_download_mb', { precision: 12, scale: 2 }).default('0'),
  avgTotalMb: numeric('avg_total_mb', { precision: 12, scale: 2 }).default('0'),
  peakUploadMb: numeric('peak_upload_mb', { precision: 12, scale: 2 }).default('0'),
  peakDownloadMb: numeric('peak_download_mb', { precision: 12, scale: 2 }).default('0'),
  
  daysActive: integer('days_active').default(0),
  avgSessionHours: numeric('avg_session_hours', { precision: 6, scale: 2 }).default('0'),
  
  suggestedPlanId: uuid('suggested_plan_id').references(() => billingPlans.id, { onDelete: 'set null' }),
  suggestionConfidence: numeric('suggestion_confidence', { precision: 5, scale: 2 }),
  suggestionReason: text('suggestion_reason'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  usageAnalyticsUserIdx: index('usage_analytics_user_idx').on(table.userId),
  usageAnalyticsPeriodIdx: index('usage_analytics_period_idx').on(table.periodStart, table.periodEnd),
}));

// ============================================================================
// FRAUD DETECTION
// ============================================================================

// Fraud Rules
export const fraudRules = pgTable('fraud_rules', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  
  name: varchar('name', { length: 100 }).notNull(),
  alertType: fraudAlertTypeEnum('alert_type').notNull(),
  description: text('description'),
  
  conditions: jsonb('conditions').notNull(),
  severity: varchar('severity', { length: 20 }).default('warning').notNull(),
  
  isEnabled: boolean('is_enabled').default(true).notNull(),
  autoAction: boolean('auto_action').default(false).notNull(),
  autoActionType: varchar('auto_action_type', { length: 50 }),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  fraudRulesOrgIdx: index('fraud_rules_org_idx').on(table.organizationId),
  fraudRulesTypeIdx: index('fraud_rules_type_idx').on(table.alertType),
}));

// Fraud Alerts
export const fraudAlerts = pgTable('fraud_alerts', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  ruleId: uuid('rule_id').references(() => fraudRules.id, { onDelete: 'set null' }),
  
  alertType: fraudAlertTypeEnum('alert_type').notNull(),
  severity: varchar('severity', { length: 20 }).notNull(),
  message: text('notNull'),
  
  evidence: jsonb('evidence').default({}),
  
  status: varchar('status', { length: 20 }).default('open').notNull(),
  
  assignedTo: uuid('assigned_to').references(() => users.id, { onDelete: 'set null' }),
  resolvedBy: uuid('resolved_by').references(() => users.id, { onDelete: 'set null' }),
  resolvedAt: timestamp('resolved_at'),
  resolutionNotes: text('resolution_notes'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  fraudAlertsUserIdx: index('fraud_alerts_user_idx').on(table.userId),
  fraudAlertsStatusIdx: index('fraud_alerts_status_idx').on(table.status),
  fraudAlertsTypeIdx: index('fraud_alerts_type_idx').on(table.alertType),
  fraudAlertsDateIdx: index('fraud_alerts_date_idx').on(table.createdAt),
}));

// ============================================================================
// OLT ENHANCEMENTS
// ============================================================================

// OLT Ports
export const oltPorts = pgTable('olt_ports', {
  id: uuid('id').primaryKey().defaultRandom(),
  oltId: uuid('olt_id').references(() => olts.id, { onDelete: 'cascade' }).notNull(),
  
  slot: integer('slot').notNull(),
  ponPort: integer('pon_port').notNull(),
  
  description: varchar('description', { length: 100 }),
  totalOnuCapacity: integer('total_onu_capacity').default(32).notNull(),
  
  adminStatus: varchar('admin_status', { length: 20 }).default('up').notNull(),
  operStatus: varchar('oper_status', { length: 20 }).default('up').notNull(),
  
  totalOnu: integer('total_onu').default(0).notNull(),
  activeOnu: integer('active_onu').default(0).notNull(),
  offlineOnu: integer('offline_onu').default(0).notNull(),
  
  rxPowerAvg: numeric('rx_power_avg', { precision: 6, scale: 2 }),
  txPowerAvg: numeric('tx_power_avg', { precision: 6, scale: 2 }),
  
  temperature: numeric('temperature', { precision: 5, scale: 2 }),
  voltage: numeric('voltage', { precision: 6, scale: 2 }),
  
  alarmCount: integer('alarm_count').default(0),
  lastAlarmAt: timestamp('last_alarm_at'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  oltPortOltIdx: index('olt_port_olt_idx').on(table.oltId),
  oltPortStatusIdx: index('olt_port_status_idx').on(table.operStatus),
}));

// OLT Alarms
export const oltAlarms = pgTable('olt_alarms', {
  id: uuid('id').primaryKey().defaultRandom(),
  oltId: uuid('olt_id').references(() => olts.id, { onDelete: 'cascade' }).notNull(),
  oltPortId: uuid('olt_port_id').references(() => oltPorts.id, { onDelete: 'cascade' }),
  onuId: uuid('onu_id'), // Will reference onus table
  
  alarmType: varchar('alarm_type', { length: 50 }).notNull(),
  severity: varchar('severity', { length: 20 }).notNull(),
  message: text('message').notNull(),
  
  isAcknowledged: boolean('is_acknowledged').default(false).notNull(),
  acknowledgedBy: uuid('acknowledged_by').references(() => users.id, { onDelete: 'set null' }),
  acknowledgedAt: timestamp('acknowledged_at'),
  
  isResolved: boolean('is_resolved').default(false).notNull(),
  resolvedAt: timestamp('resolved_at'),
  resolutionNotes: text('resolution_notes'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  alarmOltIdx: index('alarm_olt_idx').on(table.oltId),
  alarmSeverityIdx: index('alarm_severity_idx').on(table.severity),
  alarmUnackIdx: index('alarm_unack_idx').on(table.isAcknowledged, table.isResolved),
}));

// OLT Metrics History
export const oltMetrics = pgTable('olt_metrics', {
  id: uuid('id').primaryKey().defaultRandom(),
  oltId: uuid('olt_id').references(() => olts.id, { onDelete: 'cascade' }).notNull(),
  
  cpuUsage: numeric('cpu_usage', { precision: 5, scale: 2 }),
  memoryUsage: numeric('memory_usage', { precision: 5, scale: 2 }),
  temperature: numeric('temperature', { precision: 5, scale: 2 }),
  
  ponPortsTotal: integer('pon_ports_total'),
  ponPortsOnline: integer('pon_ports_online'),
  ponPortsOffline: integer('pon_ports_offline'),
  
  onusTotal: integer('onus_total'),
  onusOnline: integer('onus_online'),
  onusOffline: integer('onus_offline'),
  
  rxPowerAvg: numeric('rx_power_avg', { precision: 6, scale: 2 }),
  txPowerAvg: numeric('tx_power_avg', { precision: 6, scale: 2 }),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  metricsOltIdx: index('metrics_olt_idx').on(table.oltId),
  metricsDateIdx: index('metrics_date_idx').on(table.createdAt),
}));

// ============================================================================
// RELATIONS
// ============================================================================

export const resellerWalletsRelations = relations(resellerWallets, ({ one, many }) => ({
  reseller: one(resellers, {
    fields: [resellerWallets.resellerId],
    references: [resellers.id],
  }),
  organization: one(organizations, {
    fields: [resellerWallets.organizationId],
    references: [organizations.id],
  }),
  transactions: many(fundTransactions),
}));

export const fundTransactionsRelations = relations(fundTransactions, ({ one }) => ({
  wallet: one(resellerWallets, {
    fields: [fundTransactions.walletId],
    references: [resellerWallets.id],
  }),
  reseller: one(resellers, {
    fields: [fundTransactions.resellerId],
    references: [resellers.id],
  }),
}));

export const commissionRulesRelations = relations(commissionRules, ({ one }) => ({
  reseller: one(resellers, {
    fields: [commissionRules.resellerId],
    references: [resellers.id],
  }),
  billingPlan: one(billingPlans, {
    fields: [commissionRules.billingPlanId],
    references: [billingPlans.id],
  }),
}));

export const commissionTransactionsRelations = relations(commissionTransactions, ({ one }) => ({
  toReseller: one(resellers, {
    fields: [commissionTransactions.toResellerId],
    references: [resellers.id],
  }),
  user: one(users, {
    fields: [commissionTransactions.userId],
    references: [users.id],
  }),
  billingPlan: one(billingPlans, {
    fields: [commissionTransactions.billingPlanId],
    references: [billingPlans.id],
  }),
}));

export const financialLedgerRelations = relations(financialLedger, ({ one }) => ({
  organization: one(organizations, {
    fields: [financialLedger.organizationId],
    references: [organizations.id],
  }),
  creator: one(users, {
    fields: [financialLedger.createdBy],
    references: [users.id],
  }),
}));

export const userSubscriptionsRelations = relations(userSubscriptions, ({ one, many }) => ({
  user: one(users, {
    fields: [userSubscriptions.userId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [userSubscriptions.organizationId],
    references: [organizations.id],
  }),
  pppSecret: one(pppSecrets, {
    fields: [userSubscriptions.pppSecretId],
    references: [pppSecrets.id],
  }),
  billingPlan: one(billingPlans, {
    fields: [userSubscriptions.billingPlanId],
    references: [billingPlans.id],
  }),
  billingProfile: one(billingProfiles, {
    fields: [userSubscriptions.billingProfileId],
    references: [billingProfiles.id],
  }),
  prorationLogs: many(prorationLogs),
}));

export const prorationLogsRelations = relations(prorationLogs, ({ one }) => ({
  user: one(users, {
    fields: [prorationLogs.userId],
    references: [users.id],
  }),
  subscription: one(userSubscriptions, {
    fields: [prorationLogs.subscriptionId],
    references: [userSubscriptions.id],
  }),
  oldPlan: one(billingPlans, {
    fields: [prorationLogs.oldPlanId],
    references: [billingPlans.id],
  }),
  newPlan: one(billingPlans, {
    fields: [prorationLogs.newPlanId],
    references: [billingPlans.id],
  }),
}));

export const notificationTemplatesRelations = relations(notificationTemplates, ({ one }) => ({
  organization: one(organizations, {
    fields: [notificationTemplates.organizationId],
    references: [organizations.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [notifications.organizationId],
    references: [organizations.id],
  }),
  template: one(notificationTemplates, {
    fields: [notifications.templateId],
    references: [notificationTemplates.id],
  }),
}));

export const dailyUserStatsRelations = relations(dailyUserStats, ({ one }) => ({
  organization: one(organizations, {
    fields: [dailyUserStats.organizationId],
    references: [organizations.id],
  }),
  billingPlan: one(billingPlans, {
    fields: [dailyUserStats.billingPlanId],
    references: [billingPlans.id],
  }),
  reseller: one(resellers, {
    fields: [dailyUserStats.resellerId],
    references: [resellers.id],
  }),
}));

export const resellerAnalyticsRelations = relations(resellerAnalytics, ({ one }) => ({
  organization: one(organizations, {
    fields: [resellerAnalytics.organizationId],
    references: [organizations.id],
  }),
  reseller: one(resellers, {
    fields: [resellerAnalytics.resellerId],
    references: [resellers.id],
  }),
}));

export const userUsageAnalyticsRelations = relations(userUsageAnalytics, ({ one }) => ({
  user: one(users, {
    fields: [userUsageAnalytics.userId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [userUsageAnalytics.organizationId],
    references: [organizations.id],
  }),
  suggestedPlan: one(billingPlans, {
    fields: [userUsageAnalytics.suggestedPlanId],
    references: [billingPlans.id],
  }),
}));

export const fraudRulesRelations = relations(fraudRules, ({ one }) => ({
  organization: one(organizations, {
    fields: [fraudRules.organizationId],
    references: [organizations.id],
  }),
}));

export const fraudAlertsRelations = relations(fraudAlerts, ({ one }) => ({
  organization: one(organizations, {
    fields: [fraudAlerts.organizationId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [fraudAlerts.userId],
    references: [users.id],
  }),
  rule: one(fraudRules, {
    fields: [fraudAlerts.ruleId],
    references: [fraudRules.id],
  }),
  assignedToUser: one(users, {
    fields: [fraudAlerts.assignedTo],
    references: [users.id],
    relationName: 'fraud_alert_assignee',
  }),
  resolvedByUser: one(users, {
    fields: [fraudAlerts.resolvedBy],
    references: [users.id],
    relationName: 'fraud_alert_resolver',
  }),
}));

export const oltPortsRelations = relations(oltPorts, ({ one }) => ({
  olt: one(olts, {
    fields: [oltPorts.oltId],
    references: [olts.id],
  }),
}));

export const oltAlarmsRelations = relations(oltAlarms, ({ one }) => ({
  olt: one(olts, {
    fields: [oltAlarms.oltId],
    references: [olts.id],
  }),
  oltPort: one(oltPorts, {
    fields: [oltAlarms.oltPortId],
    references: [oltPorts.id],
  }),
  acknowledgedByUser: one(users, {
    fields: [oltAlarms.acknowledgedBy],
    references: [users.id],
  }),
}));

export const oltMetricsRelations = relations(oltMetrics, ({ one }) => ({
  olt: one(olts, {
    fields: [oltMetrics.oltId],
    references: [olts.id],
  }),
}));

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type ResellerWallet = typeof resellerWallets.$inferSelect;
export type NewResellerWallet = typeof resellerWallets.$inferInsert;

export type FundTransaction = typeof fundTransactions.$inferSelect;
export type NewFundTransaction = typeof fundTransactions.$inferInsert;

export type CommissionRule = typeof commissionRules.$inferSelect;
export type NewCommissionRule = typeof commissionRules.$inferInsert;

export type CommissionTransaction = typeof commissionTransactions.$inferSelect;
export type NewCommissionTransaction = typeof commissionTransactions.$inferInsert;

export type FinancialLedgerEntry = typeof financialLedger.$inferSelect;
export type NewFinancialLedgerEntry = typeof financialLedger.$inferInsert;

export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type NewUserSubscription = typeof userSubscriptions.$inferInsert;

export type ProrationLog = typeof prorationLogs.$inferSelect;
export type NewProrationLog = typeof prorationLogs.$inferInsert;

export type NotificationTemplate = typeof notificationTemplates.$inferSelect;
export type NewNotificationTemplate = typeof notificationTemplates.$inferInsert;

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;

export type DailyUserStat = typeof dailyUserStats.$inferSelect;
export type NewDailyUserStat = typeof dailyUserStats.$inferInsert;

export type ResellerAnalytic = typeof resellerAnalytics.$inferSelect;
export type NewResellerAnalytic = typeof resellerAnalytics.$inferInsert;

export type UserUsageAnalytic = typeof userUsageAnalytics.$inferSelect;
export type NewUserUsageAnalytic = typeof userUsageAnalytics.$inferInsert;

export type FraudRule = typeof fraudRules.$inferSelect;
export type NewFraudRule = typeof fraudRules.$inferInsert;

export type FraudAlert = typeof fraudAlerts.$inferSelect;
export type NewFraudAlert = typeof fraudAlerts.$inferInsert;

export type OltPort = typeof oltPorts.$inferSelect;
export type NewOltPort = typeof oltPorts.$inferInsert;

export type OltAlarm = typeof oltAlarms.$inferSelect;
export type NewOltAlarm = typeof oltAlarms.$inferInsert;

export type OltMetric = typeof oltMetrics.$inferSelect;
export type NewOltMetric = typeof oltMetrics.$inferInsert;
