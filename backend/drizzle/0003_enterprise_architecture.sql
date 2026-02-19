-- ============================================================================
-- NetFlow Enterprise Architecture Migration
-- Multi-tenant ISP Operating System
-- Created: 2026-02-19
-- Description: Complete enterprise upgrade with hierarchical reseller engine,
-- fund engine, commission engine, financial ledger, OLT management,
-- user subscriptions, proration, notifications, analytics, fraud detection
-- ============================================================================

-- ============================================================================
-- STEP 1: NEW ENUMS
-- ============================================================================

-- Commission Types
DO $ BEGIN
    CREATE TYPE commission_type AS ENUM ('percentage', 'fixed', 'share', 'margin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $;

-- Transaction Types for Financial Ledger
DO $ BEGIN
    CREATE TYPE ledger_entry_type AS ENUM (
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
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $;

-- User Billing Type
DO $ BEGIN
    CREATE TYPE user_billing_type AS ENUM ('prepaid', 'postpaid', 'on_demand', 'fixed_cycle');
EXCEPTION
    WHEN duplicate_object THEN null;
END $;

-- Subscription Status
DO $ BEGIN
    CREATE TYPE subscription_status AS ENUM (
        'active',
        'expired',
        'suspended',
        'cancelled',
        'pending',
        'throttled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $;

-- Overdue Policy
DO $ BEGIN
    CREATE TYPE overdue_policy AS ENUM ('suspend', 'throttle', 'restrict', 'notify');
EXCEPTION
    WHEN duplicate_object THEN null;
END $;

-- Notification Channel
DO $ BEGIN
    CREATE TYPE notification_channel AS ENUM ('email', 'sms', 'whatsapp', 'telegram', 'push');
EXCEPTION
    WHEN duplicate_object THEN null;
END $;

-- Notification Status
DO $ BEGIN
    CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'failed', 'delivered');
EXCEPTION
    WHEN duplicate_object THEN null;
END $;

-- Fraud Alert Type
DO $ BEGIN
    CREATE TYPE fraud_alert_type AS ENUM (
        'ip_mismatch',
        'mac_swap',
        'onu_swap',
        'traffic_spike',
        'multiple_logins',
        'unusual_location'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $;

-- ============================================================================
-- STEP 2: RESELLER TREE STRUCTURE (Enhanced Hierarchical Engine)
-- ============================================================================

-- Add enhanced columns to existing resellers table (if not exists)
ALTER TABLE resellers ADD COLUMN IF NOT EXISTS root_id UUID REFERENCES resellers(id) ON DELETE SET NULL;
ALTER TABLE resellers ADD COLUMN IF NOT EXISTS path TEXT;
ALTER TABLE resellers ADD COLUMN IF NOT EXISTS ltree_path LTREE;
ALTER TABLE resellers ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
ALTER TABLE resellers ADD COLUMN IF NOT EXISTS tree_left INTEGER;
ALTER TABLE resellers ADD COLUMN IF NOT EXISTS tree_right INTEGER;

-- Create indexes for tree queries
CREATE INDEX IF NOT EXISTS reseller_root_idx ON resellers(root_id);
CREATE INDEX IF NOT EXISTS reseller_path_idx ON resellers(path);
CREATE INDEX IF NOT EXISTS reseller_level_idx ON resellers(level);
CREATE INDEX IF NOT EXISTS reseller_tree_lt_idx ON resellers(ltree_path);

-- ============================================================================
-- STEP 3: FUND ENGINE TABLES
-- ============================================================================

-- Reseller Wallets (enhanced from existing wallet)
CREATE TABLE IF NOT EXISTS reseller_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reseller_id UUID REFERENCES resellers(id) ON DELETE CASCADE NOT NULL UNIQUE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    
    balance NUMERIC(12, 2) DEFAULT '0' NOT NULL,
    credit_limit NUMERIC(10, 2) DEFAULT '0' NOT NULL,
    available_balance NUMERIC(12, 2) GENERATED ALWAYS AS (balance + credit_limit) STORED,
    
    is_fund_dependency_enabled BOOLEAN DEFAULT true NOT NULL,
    auto_recharge_enabled BOOLEAN DEFAULT false NOT NULL,
    auto_recharge_threshold NUMERIC(10, 2),
    auto_recharge_amount NUMERIC(10, 2),
    
    warn_low_balance BOOLEAN DEFAULT true NOT NULL,
    low_balance_threshold NUMERIC(10, 2) DEFAULT '0',
    
    currency VARCHAR(3) DEFAULT 'BDT' NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS wallet_reseller_idx ON reseller_wallets(reseller_id);
CREATE INDEX IF NOT EXISTS wallet_org_idx ON reseller_wallets(organization_id);
CREATE INDEX IF NOT EXISTS wallet_balance_idx ON reseller_wallets(balance);

-- Fund Transactions (detailed fund movement tracking)
CREATE TABLE IF NOT EXISTS fund_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID REFERENCES reseller_wallets(id) ON DELETE CASCADE NOT NULL,
    reseller_id UUID REFERENCES resellers(id) ON DELETE CASCADE NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    
    type VARCHAR(50) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    balance_before NUMERIC(12, 2) NOT NULL,
    balance_after NUMERIC(12, 2) NOT NULL,
    
    reference_type VARCHAR(50),
    reference_id UUID,
    
    description TEXT,
    notes TEXT,
    ip_address INET,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS fund_tx_wallet_idx ON fund_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS fund_tx_reseller_idx ON fund_transactions(reseller_id);
CREATE INDEX IF NOT EXISTS fund_tx_type_idx ON fund_transactions(type);
CREATE INDEX IF NOT EXISTS fund_tx_ref_idx ON fund_transactions(reference_type, reference_id);

-- ============================================================================
-- STEP 4: COMMISSION ENGINE TABLES
-- ============================================================================

-- Commission Rules (detailed per plan, per level)
CREATE TABLE IF NOT EXISTS commission_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    reseller_id UUID REFERENCES resellers(id) ON DELETE CASCADE NOT NULL,
    
    billing_plan_id UUID REFERENCES billing_plans(id) ON DELETE CASCADE,
    
    commission_type commission_type DEFAULT 'percentage' NOT NULL,
    value NUMERIC(5, 2) NOT NULL,
    max_value NUMERIC(10, 2),
    min_value NUMERIC(10, 2) DEFAULT '0',
    
    applies_to_level INTEGER,  -- null = all levels
    applies_to_user_type VARCHAR(20),  -- prepaid, postpaid, all
    
    effective_from DATE,
    effective_to DATE,
    
    is_active BOOLEAN DEFAULT true NOT NULL,
    is_global BOOLEAN DEFAULT false NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS commission_rule_reseller_idx ON commission_rules(reseller_id);
CREATE INDEX IF NOT EXISTS commission_rule_plan_idx ON commission_rules(billing_plan_id);
CREATE INDEX IF NOT EXISTS commission_rule_org_idx ON commission_rules(organization_id);
CREATE INDEX IF NOT EXISTS commission_rule_active_idx ON commission_rules(is_active);

-- Commission Transactions (detailed commission logging)
CREATE TABLE IF NOT EXISTS commission_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    
    from_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    from_reseller_id UUID REFERENCES resellers(id) ON DELETE SET NULL,
    to_reseller_id UUID REFERENCES resellers(id) ON DELETE SET NULL,
    
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,  -- end customer
    billing_plan_id UUID REFERENCES billing_plans(id) ON DELETE SET NULL,
    invoice_id UUID,
    
    sale_amount NUMERIC(10, 2) NOT NULL,
    commission_amount NUMERIC(10, 2) NOT NULL,
    commission_rate NUMERIC(5, 2),
    level INTEGER NOT NULL,  -- 1 = direct, 2 = parent of direct, etc.
    
    status VARCHAR(20) DEFAULT 'pending' NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE,
    
    reference_type VARCHAR(50),
    reference_id UUID,
    
    description TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS commission_tx_reseller_idx ON commission_transactions(to_reseller_id);
CREATE INDEX IF NOT EXISTS commission_tx_user_idx ON commission_transactions(user_id);
CREATE INDEX IF NOT EXISTS commission_tx_plan_idx ON commission_transactions(billing_plan_id);
CREATE INDEX IF NOT commission_tx_org_idx ON commission_transactions(organization_id);

-- ============================================================================
-- STEP 5: FINANCIAL LEDGER (Double-Entry System)
-- ============================================================================

CREATE TABLE IF NOT EXISTS financial_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    
    entity_type VARCHAR(50) NOT NULL,  -- user, reseller, organization, system
    entity_id UUID NOT NULL,
    
    entry_type ledger_entry_type NOT NULL,
    
    debit NUMERIC(12, 2) DEFAULT '0' NOT NULL,
    credit NUMERIC(12, 2) DEFAULT '0' NOT NULL,
    amount NUMERIC(12, 2) GENERATED ALWAYS AS (debit + credit) STORED,
    
    balance_before NUMERIC(12, 2) NOT NULL,
    balance_after NUMERIC(12, 2) NOT NULL,
    
    currency VARCHAR(3) DEFAULT 'BDT' NOT NULL,
    
    reference_type VARCHAR(50),
    reference_id UUID,
    
    description TEXT,
    notes TEXT,
    
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS ledger_entity_idx ON financial_ledger(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS ledger_org_idx ON financial_ledger(organization_id);
CREATE INDEX IF NOT EXISTS ledger_entry_idx ON financial_ledger(entry_type);
CREATE INDEX IF NOT EXISTS ledger_ref_idx ON financial_ledger(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS ledger_date_idx ON financial_ledger(created_at);

-- ============================================================================
-- STEP 6: USER SUBSCRIPTIONS (Multiple Active Plans)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    ppp_secret_id UUID REFERENCES ppp_secrets(id) ON DELETE CASCADE,
    
    billing_plan_id UUID REFERENCES billing_plans(id) ON DELETE CASCADE NOT NULL,
    billing_profile_id UUID REFERENCES billing_profiles(id) ON DELETE SET NULL,
    
    status subscription_status DEFAULT 'pending' NOT NULL,
    billing_type user_billing_type DEFAULT 'prepaid' NOT NULL,
    
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    expiry TIMESTAMP WITH TIME ZONE NOT NULL,
    next_billing_date TIMESTAMP WITH TIME ZONE,
    
    price NUMERIC(10, 2) NOT NULL,
    paid_amount NUMERIC(10, 2) DEFAULT '0' NOT NULL,
    
    priority INTEGER DEFAULT 1 NOT NULL,  -- 1 = primary, 2+ = add-ons
    
    proration_enabled BOOLEAN DEFAULT true NOT NULL,
    proration_credit NUMERIC(10, 2) DEFAULT '0',
    proration_charge NUMERIC(10, 2) DEFAULT '0',
    
    overdue_policy overdue_policy DEFAULT 'suspend' NOT NULL,
    throttle_profile_id UUID,  -- profile to apply when throttled
    
    auto_renew BOOLEAN DEFAULT true NOT NULL,
    cancellation_requested BOOLEAN DEFAULT false NOT NULL,
    cancellation_date TIMESTAMP WITH TIME ZONE,
    
    settings JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS sub_user_idx ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS sub_secret_idx ON user_subscriptions(ppp_secret_id);
CREATE INDEX IF NOT EXISTS sub_plan_idx ON user_subscriptions(billing_plan_id);
CREATE INDEX IF NOT EXISTS sub_status_idx ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS sub_expiry_idx ON user_subscriptions(expiry);
CREATE INDEX IF NOT EXISTS sub_org_idx ON user_subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS sub_priority_idx ON user_subscriptions(priority);

-- ============================================================================
-- STEP 7: PRORATION LOGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS proration_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE CASCADE,
    
    old_plan_id UUID REFERENCES billing_plans(id) ON DELETE SET NULL,
    new_plan_id UUID REFERENCES billing_plans(id) ON DELETE SET NULL,
    
    action VARCHAR(50) NOT NULL,  -- upgrade, downgrade, add, remove
    days_remaining INTEGER NOT NULL,
    
    old_price_per_day NUMERIC(10, 2) NOT NULL,
    new_price_per_day NUMERIC(10, 2) NOT NULL,
    
    credit_amount NUMERIC(10, 2) NOT NULL,
    charge_amount NUMERIC(10, 2) NOT NULL,
    net_amount NUMERIC(10, 2) NOT NULL,
    
    effective_date TIMESTAMP WITH TIME ZONE NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS proration_user_idx ON proration_logs(user_id);
CREATE INDEX IF NOT EXISTS proration_sub_idx ON proration_logs(subscription_id);
CREATE INDEX IF NOT EXISTS proration_date_idx ON proration_logs(effective_date);

-- ============================================================================
-- STEP 8: OLT MANAGEMENT TABLES (Enhanced)
-- ============================================================================

-- OLTs (Enhanced)
ALTER TABLE olts ADD COLUMN IF NOT EXISTS snmp_version VARCHAR(10) DEFAULT 'v2c';
ALTER TABLE olts ADD COLUMN IF NOT EXISTS snmp_community VARCHAR(100);
ALTER TABLE olts ADD COLUMN IF NOT EXISTS snmp_port INTEGER DEFAULT 161;
ALTER TABLE olts ADD COLUMN IF NOT EXISTS snmp_timeout INTEGER DEFAULT 3000;
ALTER TABLE olts ADD COLUMN IF NOT EXISTS snmp_retries INTEGER DEFAULT 3;
ALTER TABLE olts ADD COLUMN IF NOT EXISTS vendor VARCHAR(50);
ALTER TABLE olts ADD COLUMN IF NOT EXISTS model VARCHAR(50);
ALTER TABLE olts ADD COLUMN IF NOT EXISTS firmware_version VARCHAR(50);
ALTER TABLE olts ADD COLUMN IF NOT EXISTS total_ports INTEGER;
ALTER TABLE olts ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE olts ADD COLUMN IF NOT EXISTS contact_person VARCHAR(100);
ALTER TABLE olts ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50);
ALTER TABLE olts ADD COLUMN IF NOT EXISTS auto_discover_onus BOOLEAN DEFAULT true;
ALTER TABLE olts ADD COLUMN IF NOT EXISTS polling_interval INTEGER DEFAULT 300;  -- seconds
ALTER TABLE olts ADD COLUMN IF NOT EXISTS last_polled_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS olt_vendor_idx ON olts(vendor);
CREATE INDEX IF NOT EXISTS olt_location_idx ON olts(location);

-- OLT Ports
CREATE TABLE IF NOT EXISTS olt_ports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    olt_id UUID REFERENCES olts(id) ON DELETE CASCADE NOT NULL,
    
    slot INTEGER NOT NULL,
    pon_port INTEGER NOT NULL,
    
    description VARCHAR(100),
    total_onu_capacity INTEGER DEFAULT 32 NOT NULL,
    
    admin_status VARCHAR(20) DEFAULT 'up' NOT NULL,
    oper_status VARCHAR(20) DEFAULT 'up' NOT NULL,
    
    total_onu INTEGER DEFAULT 0 NOT NULL,
    active_onu INTEGER DEFAULT 0 NOT NULL,
    offline_onu INTEGER DEFAULT 0 NOT NULL,
    
    rx_power_avg NUMERIC(6, 2),
    tx_power_avg NUMERIC(6, 2),
    
    temperature NUMERIC(5, 2),
    voltage NUMERIC(6, 2),
    
    alarm_count INTEGER DEFAULT 0,
    last_alarm_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    UNIQUE(olt_id, slot, pon_port)
);

CREATE INDEX IF NOT EXISTS olt_port_olt_idx ON olt_ports(olt_id);
CREATE INDEX IF NOT EXISTS olt_port_status_idx ON olt_ports(oper_status);

-- ONUs (Enhanced)
ALTER TABLE onus ADD COLUMN IF NOT EXISTS onu_vendor VARCHAR(50);
ALTER TABLE olts ADD COLUMN IF NOT EXISTS onu_model VARCHAR(50);
ALTER TABLE onus ADD COLUMN IF NOT EXISTS firmware_version VARCHAR(50);
ALTER TABLE onus ADD COLUMN IF NOT EXISTS rx_power NUMERIC(6, 2);
ALTER TABLE onus ADD COLUMN IF NOT EXISTS tx_power NUMERIC(6, 2);
ALTER TABLE onus ADD COLUMN IF NOT EXISTS optical_status VARCHAR(20);
ALTER TABLE onus ADD COLUMN IF NOT EXISTS temperature NUMERIC(5, 2);
ALTER TABLE onus ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE;
ALTER TABLE onus ADD COLUMN IF NOT EXISTS auto_disable_enabled BOOLEAN DEFAULT true;

CREATE INDEX IF NOT EXISTS onu_olt_idx ONonus(olt_id);
CREATE INDEX IF NOT EXISTS onu_port_idx ONonus(pon_port);
CREATE INDEX IF NOT EXISTS onu_serial_idx ONonus(serial_number);
CREATE INDEX IF NOT EXISTS onu_status_idx ONonus(status);
CREATE INDEX IF NOT EXISTS onu_ppp_idx ONonus(linked_ppp_secret_id);

-- OLT Alarms
CREATE TABLE IF NOT EXISTS olt_alarms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    olt_id UUID REFERENCES olts(id) ON DELETE CASCADE NOT NULL,
    olt_port_id UUID REFERENCES olt_ports(id) ON DELETE CASCADE,
    onu_id UUID REFERENCES onus(id) ON DELETE CASCADE,
    
    alarm_type VARCHAR(50) NOT NULL,
    severity alarm_severity NOT NULL,
    message TEXT NOT NULL,
    
    is_acknowledged BOOLEAN DEFAULT false NOT NULL,
    acknowledged_by UUID REFERENCES users(id) ON DELETE SET NULL,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    
    is_resolved BOOLEAN DEFAULT false NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS alarm_olt_idx ON olt_alarms(olt_id);
CREATE INDEX IF NOT EXISTS alarm_severity_idx ON olt_alarms(severity);
CREATE INDEX IF NOT EXISTS alarm_unack_idx ON olt_alarms(is_acknowledged, is_resolved);

-- OLT Metrics History (Time-series)
CREATE TABLE IF NOT EXISTS olt_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    olt_id UUID REFERENCES olts(id) ON DELETE CASCADE NOT NULL,
    
    cpu_usage NUMERIC(5, 2),
    memory_usage NUMERIC(5, 2),
    temperature NUMERIC(5, 2),
    
    pon_ports_total INTEGER,
    pon_ports_online INTEGER,
    pon_ports_offline INTEGER,
    
    onus_total INTEGER,
    onus_online INTEGER,
    onus_offline INTEGER,
    
    rx_power_avg NUMERIC(6, 2),
    tx_power_avg NUMERIC(6, 2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS metrics_olt_idx ON olt_metrics(olt_id);
CREATE INDEX IF NOT EXISTS metrics_date_idx ON olt_metrics(created_at);

-- ============================================================================
-- STEP 9: NOTIFICATION ENGINE TABLES
-- ============================================================================

-- Notification Templates
CREATE TABLE IF NOT EXISTS notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    
    name VARCHAR(100) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    channel notification_channel NOT NULL,
    
    subject VARCHAR(200),
    body TEXT NOT NULL,
    body_html TEXT,
    
    variables JSONB DEFAULT '[]',
    
    is_active BOOLEAN DEFAULT true NOT NULL,
    is_default BOOLEAN DEFAULT false NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS notif_template_org_idx ON notification_templates(organization_id);
CREATE INDEX IF NOT EXISTS notif_template_event_idx ON notification_templates(event_type, channel);

-- Notifications Log
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    
    template_id UUID REFERENCES notification_templates(id) ON DELETE SET NULL,
    channel notification_channel NOT NULL,
    
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(200),
    body TEXT NOT NULL,
    
    status notification_status DEFAULT 'pending' NOT NULL,
    
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    error_message TEXT,
    external_id VARCHAR(100),
    
    reference_type VARCHAR(50),
    reference_id UUID,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS notif_user_idx ON notifications(user_id);
CREATE INDEX IF NOT EXISTS notif_status_idx ON notifications(status);
CREATE INDEX IF NOT EXISTS notif_channel_idx ON notifications(channel);
CREATE INDEX IF NOT EXISTS notif_date_idx ON notifications(created_at);

-- ============================================================================
-- STEP 10: ANALYTICS TABLES
-- ============================================================================

-- Daily User Statistics
CREATE TABLE IF NOT EXISTS daily_user_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    billing_plan_id UUID REFERENCES billing_plans(id) ON DELETE SET NULL,
    reseller_id UUID REFERENCES resellers(id) ON DELETE SET NULL,
    
    date DATE NOT NULL,
    
    total_users INTEGER DEFAULT 0,
    new_users INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    expired_users INTEGER DEFAULT 0,
    suspended_users INTEGER DEFAULT 0,
    
    revenue NUMERIC(12, 2) DEFAULT '0',
    collected_amount NUMERIC(12, 2) DEFAULT '0',
    
    data_uploaded BIGINT DEFAULT 0,
    data_downloaded BIGINT DEFAULT 0,
    total_data BIGINT DEFAULT 0,
    
    UNIQUE(organization_id, date, billing_plan_id, reseller_id)
);

CREATE INDEX IF NOT EXISTS daily_stats_org_idx ON daily_user_stats(organization_id);
CREATE INDEX IF NOT EXISTS daily_stats_date_idx ON daily_user_stats(date);
CREATE INDEX IF NOT EXISTS daily_stats_plan_idx ON daily_user_stats(billing_plan_id);

-- Reseller Analytics
CREATE TABLE IF NOT EXISTS reseller_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    reseller_id UUID REFERENCES resellers(id) ON DELETE CASCADE NOT NULL,
    
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    total_sales NUMERIC(12, 2) DEFAULT '0',
    total_commission NUMERIC(12, 2) DEFAULT '0',
    total_users INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    
    new_sub_resellers INTEGER DEFAULT 0,
    churned_sub_resellers INTEGER DEFAULT '0',
    
    arpu NUMERIC(10, 2),
    collection_rate NUMERIC(5, 2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS reseller_analytics_reseller_idx ON reseller_analytics(reseller_id);
CREATE INDEX IF NOT EXISTS reseller_analytics_period_idx ON reseller_analytics(period_start, period_end);

-- ============================================================================
-- STEP 11: FRAUD DETECTION TABLES
-- ============================================================================

-- Fraud Rules
CREATE TABLE IF NOT EXISTS fraud_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    
    name VARCHAR(100) NOT NULL,
    alert_type fraud_alert_type NOT NULL,
    description TEXT,
    
    conditions JSONB NOT NULL,
    severity alarm_severity DEFAULT 'warning' NOT NULL,
    
    is_enabled BOOLEAN DEFAULT true NOT NULL,
    auto_action BOOLEAN DEFAULT false NOT NULL,
    auto_action_type VARCHAR(50),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS fraud_rules_org_idx ON fraud_rules(organization_id);
CREATE INDEX IF NOT EXISTS fraud_rules_type_idx ON fraud_rules(alert_type);

-- Fraud Alerts
CREATE TABLE IF NOT EXISTS fraud_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    rule_id UUID REFERENCES fraud_rules(id) ON DELETE SET NULL,
    
    alert_type fraud_alert_type NOT NULL,
    severity alarm_severity NOT NULL,
    message TEXT NOT NULL,
    
    evidence JSONB DEFAULT '{}',
    
    status VARCHAR(20) DEFAULT 'open' NOT NULL,  -- open, investigating, resolved, false_positive
    
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS fraud_alerts_user_idx ON fraud_alerts(user_id);
CREATE INDEX IF NOT EXISTS fraud_alerts_status_idx ON fraud_alerts(status);
CREATE INDEX IF NOT EXISTS fraud_alerts_type_idx ON fraud_alerts(alert_type);
CREATE INDEX IF NOT EXISTS fraud_alerts_date_idx ON fraud_alerts(created_at);

-- ============================================================================
-- STEP 12: AUTO PACKAGE SUGGESTION
-- ============================================================================

-- User Usage Analytics (for AI suggestions)
CREATE TABLE IF NOT EXISTS user_usage_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    avg_upload_mb NUMERIC(12, 2) DEFAULT 0,
    avg_download_mb NUMERIC(12, 2) DEFAULT 0,
    avg_total_mb NUMERIC(12, 2) DEFAULT 0,
    peak_upload_mb NUMERIC(12, 2) DEFAULT 0,
    peak_download_mb NUMERIC(12, 2) DEFAULT 0,
    
    days_active INTEGER DEFAULT 0,
    avg_session_hours NUMERIC(6, 2) DEFAULT 0,
    
    suggested_plan_id UUID REFERENCES billing_plans(id) ON DELETE SET NULL,
    suggestion_confidence NUMERIC(5, 2),
    suggestion_reason TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    UNIQUE(user_id, period_start, period_end)
);

CREATE INDEX IF NOT EXISTS usage_analytics_user_idx ON user_usage_analytics(user_id);
CREATE INDEX IF NOT EXISTS usage_analytics_period_idx ON user_usage_analytics(period_start, period_end);

-- ============================================================================
-- STEP 13: ADDITIONAL USER FIELDS FOR FLEXIBLE BILLING
-- ============================================================================

ALTER TABLE ppp_secrets ADD COLUMN IF NOT EXISTS billing_type user_billing_type DEFAULT 'prepaid';
ALTER TABLE ppp_secrets ADD COLUMN IF NOT EXISTS billing_profile_id UUID REFERENCES billing_profiles(id) ON DELETE SET NULL;
ALTER TABLE ppp_secrets ADD COLUMN IF NOT EXISTS primary_subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE SET NULL;
ALTER TABLE ppp_secrets ADD COLUMN IF NOT EXISTS credit_limit NUMERIC(10, 2) DEFAULT '0';
ALTER TABLE ppp_secrets ADD COLUMN IF NOT EXISTS current_balance NUMERIC(10, 2) DEFAULT '0';
ALTER TABLE ppp_secrets ADD COLUMN IF NOT EXISTS overdue_policy overdue_policy DEFAULT 'suspend';
ALTER TABLE ppp_secrets ADD COLUMN IF NOT EXISTS throttle_profile_id UUID;
ALTER TABLE ppp_secrets ADD COLUMN IF NOT EXISTS last_billed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE ppp_secrets ADD COLUMN IF NOT EXISTS next_billing_date TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS ppp_billing_type_idx ON ppp_secrets(billing_type);
CREATE INDEX IF NOT EXISTS ppp_billing_profile_idx ON ppp_secrets(billing_profile_id);
CREATE INDEX IF NOT EXISTS ppp_next_billing_idx ON ppp_secrets(next_billing_date);

-- ============================================================================
-- STEP 14: ADDITIONAL BILLING PROFILE FIELDS
-- ============================================================================

ALTER TABLE billing_profiles ADD COLUMN IF NOT EXISTS overdue_policy overdue_policy DEFAULT 'suspend';
ALTER TABLE billing_profiles ADD COLUMN IF NOT EXISTS throttle_profile_id UUID;
ALTER TABLE billing_profiles ADD COLUMN IF NOT EXISTS restrict_profile_id UUID;
ALTER TABLE billing_profiles ADD COLUMN IF NOT EXISTS throttle_speed_down INTEGER;  -- kbps
ALTER TABLE billing_profiles ADD COLUMN IF NOT EXISTS notify_before_days INTEGER DEFAULT 3;
ALTER TABLE billing_profiles ADD COLUMN IF NOT EXISTS auto_extension_days INTEGER DEFAULT 0;

-- ============================================================================
-- STEP 15: PL/PGSQL FUNCTIONS
-- ============================================================================

-- Function: Calculate user proration on upgrade/downgrade
CREATE OR REPLACE FUNCTION calculate_proration(
    p_user_id UUID,
    p_old_plan_id UUID,
    p_new_plan_id UUID,
    p_action VARCHAR
)
RETURNS TABLE (
    credit_amount NUMERIC,
    charge_amount NUMERIC,
    net_amount NUMERIC,
    days_remaining INTEGER
) AS $$
DECLARE
    v_old_plan RECORD;
    v_new_plan RECORD;
    v_subscription RECORD;
    v_days_remaining INTEGER;
    v_old_price_per_day NUMERIC;
    v_new_price_per_day NUMERIC;
    v_credit NUMERIC;
    v_charge NUMERIC;
BEGIN
    -- Get old plan
    SELECT * INTO v_old_plan FROM billing_plans WHERE id = p_old_plan_id;
    
    -- Get new plan
    SELECT * INTO v_new_plan FROM billing_plans WHERE id = p_new_plan_id;
    
    -- Get active subscription
    SELECT * INTO v_subscription 
    FROM user_subscriptions 
    WHERE user_id = p_user_id 
    AND billing_plan_id = p_old_plan_id
    AND status IN ('active', 'throttled')
    ORDER BY priority ASC
    LIMIT 1;
    
    -- Calculate days remaining
    v_days_remaining := GREATEST(0, DATE_PART('day', v_subscription.expiry - NOW())::INTEGER);
    
    -- Calculate price per day
    v_old_price_per_day := COALESCE(v_old_plan.price_per_day, v_old_plan.price / NULLIF(v_old_plan.cycle_days, 0));
    v_new_price_per_day := COALESCE(v_new_plan.price_per_day, v_new_plan.price / NULLIF(v_new_plan.cycle_days, 0));
    
    -- Calculate credit and charge
    IF p_action = 'upgrade' THEN
        v_credit := v_old_price_per_day * v_days_remaining;
        v_charge := v_new_price_per_day * v_days_remaining;
    ELSIF p_action = 'downgrade' THEN
        v_credit := v_new_price_per_day * v_days_remaining;
        v_charge := v_old_price_per_day * v_days_remaining;
    ELSE
        v_credit := 0;
        v_charge := 0;
    END IF;
    
    RETURN QUERY SELECT 
        v_credit,
        v_charge,
        v_charge - v_credit,
        v_days_remaining;
END;
$$ LANGUAGE plpgsql;

-- Function: Distribute commission up the reseller chain
CREATE OR REPLACE FUNCTION distribute_commission(
    p_sale_amount NUMERIC,
    p_plan_id UUID,
    p_user_id UUID,
    p_invoice_id UUID,
    p_organization_id UUID
)
RETURNS void AS $$
DECLARE
    v_reseller RECORD;
    v_parent RECORD;
    v_commission NUMERIC;
    v_commission_rate NUMERIC;
    v_level INTEGER;
    v_wallet RECORD;
    v_balance_before NUMERIC;
    v_balance_after NUMERIC;
BEGIN
    v_level := 1;
    
    -- Get the reseller for this user (if any)
    SELECT r.* INTO v_reseller
    FROM resellers r
    INNER JOIN users u ON u.reseller_id = r.id
    WHERE u.id = p_user_id;
    
    IF v_reseller IS NULL THEN
        RETURN;
    END IF;
    
    -- Traverse up the chain
    WHILE v_reseller IS NOT NULL LOOP
        -- Get parent
        SELECT * INTO v_parent FROM resellers WHERE id = v_reseller.parent_id;
        
        -- Get commission rule
        SELECT cr.value INTO v_commission_rate
        FROM commission_rules cr
        WHERE cr.reseller_id = v_parent.id
        AND (cr.billing_plan_id = p_plan_id OR cr.billing_plan_id IS NULL)
        AND cr.is_active = true
        ORDER BY cr.billing_plan_id DESC NULLS LAST
        LIMIT 1;
        
        v_commission_rate := COALESCE(v_commission_rate, v_parent.commission_value, 0);
        
        IF v_commission_rate > 0 AND v_parent IS NOT NULL THEN
            v_commission := p_sale_amount * (v_commission_rate / 100);
            
            -- Get wallet
            SELECT * INTO v_wallet FROM reseller_wallets WHERE reseller_id = v_parent.id;
            
            IF v_wallet IS NOT NULL THEN
                v_balance_before := v_wallet.balance;
                
                -- Credit to wallet
                UPDATE reseller_wallets
                SET balance = balance + v_commission,
                    updated_at = NOW()
                WHERE id = v_wallet.id
                RETURNING balance INTO v_balance_after;
                
                -- Record transaction
                INSERT INTO fund_transactions (
                    wallet_id, reseller_id, organization_id,
                    type, amount, balance_before, balance_after,
                    reference_type, reference_id, description
                ) VALUES (
                    v_wallet.id, v_parent.id, p_organization_id,
                    'commission_earned', v_commission, v_balance_before, v_balance_after,
                    'invoice', p_invoice_id,
                    'Commission from user subscription'
                );
                
                -- Record commission transaction
                INSERT INTO commission_transactions (
                    organization_id, from_user_id, to_reseller_id,
                    user_id, billing_plan_id, invoice_id,
                    sale_amount, commission_amount, commission_rate, level,
                    description
                ) VALUES (
                    p_organization_id, p_user_id, v_parent.id,
                    p_user_id, p_plan_id, p_invoice_id,
                    p_sale_amount, v_commission, v_commission_rate, v_level,
                    'Commission from subscription'
                );
            END IF;
        END IF;
        
        v_level := v_level + 1;
        v_reseller := v_parent;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function: Check and process fund dependency
CREATE OR REPLACE FUNCTION check_fund_dependency(
    p_reseller_id UUID,
    p_amount NUMERIC,
    p_create_transaction BOOLEAN DEFAULT true
)
RETURNS BOOLEAN AS $$
DECLARE
    v_wallet RECORD;
    v_reseller RECORD;
    v_has_sufficient_funds BOOLEAN;
BEGIN
    -- Get reseller
    SELECT * INTO v_reseller FROM resellers WHERE id = p_reseller_id;
    
    IF NOT v_reseller.fund_dependency_enabled THEN
        RETURN true;
    END IF;
    
    -- Get wallet
    SELECT * INTO v_wallet FROM reseller_wallets WHERE reseller_id = p_reseller_id;
    
    IF v_wallet IS NULL THEN
        RETURN false;
    END IF;
    
    -- Check available balance
    v_has_sufficient_funds := (v_wallet.balance + v_wallet.credit_limit) >= p_amount;
    
    IF NOT v_has_sufficient_funds THEN
        -- Log insufficient funds
        IF p_create_transaction THEN
            INSERT INTO fund_transactions (
                wallet_id, reseller_id, organization_id,
                type, amount, balance_before, balance_after,
                description
            ) VALUES (
                v_wallet.id, v_reseller.id, v_reseller.organization_id,
                'insufficient_funds', p_amount, v_wallet.balance, v_wallet.balance,
                'Insufficient funds for operation'
            );
        END IF;
    END IF;
    
    RETURN v_has_sufficient_funds;
END;
$$ LANGUAGE plpgsql;

-- Function: Record financial ledger entry (double-entry)
CREATE OR REPLACE FUNCTION record_ledger_entry(
    p_organization_id UUID,
    p_entity_type VARCHAR,
    p_entity_id UUID,
    p_entry_type ledger_entry_type,
    p_debit NUMERIC,
    p_credit NUMERIC,
    p_balance_before NUMERIC,
    p_balance_after NUMERIC,
    p_reference_type VARCHAR,
    p_reference_id UUID,
    p_description TEXT,
    p_created_by UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_entry_id UUID;
BEGIN
    INSERT INTO financial_ledger (
        organization_id,
        entity_type,
        entity_id,
        entry_type,
        debit,
        credit,
        balance_before,
        balance_after,
        reference_type,
        reference_id,
        description,
        created_by
    ) VALUES (
        p_organization_id,
        p_entity_type,
        p_entity_id,
        p_entry_type,
        p_debit,
        p_credit,
        p_balance_before,
        p_balance_after,
        p_reference_type,
        p_reference_id,
        p_description,
        p_created_by
    )
    RETURNING id INTO v_entry_id;
    
    RETURN v_entry_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Process user billing with proration
CREATE OR REPLACE FUNCTION process_user_billing(
    p_user_id UUID,
    p_plan_id UUID,
    p_billing_type user_billing_type,
    p_is_upgrade BOOLEAN DEFAULT false,
    p_old_plan_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_subscription_id UUID;
    v_proration_result RECORD;
    v_invoice_id UUID;
BEGIN
    -- If upgrade/downgrade, calculate proration
    IF p_is_upgrade AND p_old_plan_id IS NOT NULL THEN
        SELECT * INTO v_proration_result
        FROM calculate_proration(p_user_id, p_old_plan_id, p_plan_id, 'upgrade');
        
        -- Log proration
        INSERT INTO proration_logs (
            user_id, organization_id, old_plan_id, new_plan_id,
            action, days_remaining, credit_amount, charge_amount, net_amount, effective_date
        ) VALUES (
            p_user_id, 
            (SELECT organization_id FROM users WHERE id = p_user_id),
            p_old_plan_id, p_plan_id,
            'upgrade', v_proration_result.days_remaining,
            v_proration_result.credit_amount, v_proration_result.charge_amount,
            v_proration_result.net_amount, NOW()
        );
    END IF;
    
    -- Create/update subscription
    INSERT (
        user_id INTO user_subscriptions,
        organization_id,
        billing_plan_id,
        billing_type,
        status,
        started_at,
        expiry,
        price
    ) VALUES (
        p_user_id,
        (SELECT organization_id FROM users WHERE id = p_user_id),
        p_plan_id,
        p_billing_type,
        'active',
        NOW(),
        NOW() + INTERVAL '30 days',
        (SELECT price FROM billing_plans WHERE id = p_plan_id)
    )
    RETURNING id INTO v_subscription_id;
    
    RETURN v_subscription_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Get reseller tree path
CREATE OR REPLACE FUNCTION get_reseller_path(p_reseller_id UUID)
RETURNS TEXT AS $$
DECLARE
    v_path TEXT := '';
    v_reseller RECORD;
BEGIN
    SELECT * INTO v_reseller FROM resellers WHERE id = p_reseller_id;
    
    WHILE v_reseller IS NOT NULL LOOP
        v_path := v_reseller.name || '/' || v_path;
        
        IF v_reseller.parent_id IS NULL THEN
            v_reseller := NULL;
        ELSE
            SELECT * INTO v_reseller FROM resellers WHERE id = v_reseller.parent_id;
        END IF;
    END LOOP;
    
    RETURN RTRIM(v_path, '/');
END;
$$ LANGUAGE plpgsql;

-- Function: Update reseller tree path
CREATE OR REPLACE FUNCTION update_reseller_tree_path()
RETURNS TRIGGER AS $$
BEGIN
    NEW.path := get_reseller_path(NEW.id);
    NEW.root_id := COALESCE(
        (SELECT ancestor_id FROM reseller_hierarchy 
         WHERE descendant_id = NEW.id AND depth = 0 LIMIT 1),
        NEW.id
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update tree path on reseller change
CREATE TRIGGER trigger_update_reseller_path
BEFORE UPDATE ON resellers
FOR EACH ROW
EXECUTE FUNCTION update_reseller_tree_path();

-- ============================================================================
-- STEP 16: SEED DATA
-- ============================================================================

-- Insert default notification templates
INSERT INTO notification_templates (organization_id, name, event_type, channel, subject, body, is_active, is_default)
SELECT 
    id,
    'Invoice Generated - Email',
    'invoice_generated',
    'email',
    'Invoice #{invoice_no} Generated',
    'Dear {customer_name}, your invoice #{invoice_no} has been generated. Amount: {amount} {currency}. Due date: {due_date}.',
    true,
    true
FROM organizations
ON CONFLICT DO NOTHING;

INSERT INTO notification_templates (organization_id, name, event_type, channel, subject, body, is_active, is_default)
SELECT 
    id,
    'Expiry Warning - SMS',
    'expiry_warning',
    'sms',
    'Expiry Warning',
    'Dear {customer_name}, your service expires on {expiry_date}. Please renew to avoid interruption.',
    true,
    true
FROM organizations
ON CONFLICT DO NOTHING;

INSERT INTO notification_templates (organization_id, name, event_type, channel, subject, body, is_active, is_default)
SELECT 
    id,
    'Payment Received - Email',
    'payment_received',
    'email',
    'Payment Received',
    'Dear {customer_name}, we have received your payment of {amount} {currency}. Thank you!',
    true,
    true
FROM organizations
ON CONFLICT DO NOTHING;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

DO $ BODY $
BEGIN
    RAISE NOTICE 'NetFlow Enterprise Architecture Migration completed successfully!';
    RAISE NOTICE 'New tables created:';
    RAISE NOTICE '  - reseller_wallets';
    RAISE NOTICE '  - fund_transactions';
    RAISE NOTICE '  - commission_rules';
    RAISE NOTICE '  - commission_transactions';
    RAISE NOTICE '  - financial_ledger';
    RAISE NOTICE '  - user_subscriptions';
    RAISE NOTICE '  - proration_logs';
    RAISE NOTICE '  - olt_ports';
    RAISE NOTICE '  - olt_alarms';
    RAISE NOTICE '  - olt_metrics';
    RAISE NOTICE '  - notification_templates';
    RAISE NOTICE '  - notifications';
    RAISE NOTICE '  - daily_user_stats';
    RAISE NOTICE '  - reseller_analytics';
    RAISE NOTICE '  - fraud_rules';
    RAISE NOTICE '  - fraud_alerts';
    RAISE NOTICE '  - user_usage_analytics';
END;
$ BODY $;
