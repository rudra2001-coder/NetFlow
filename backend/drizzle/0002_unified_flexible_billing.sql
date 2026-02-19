-- Migration: Unified Flexible Billing Architecture
-- Created: 2026-02-19
-- Description: Add billing_profiles table and extend billing_plans and pppSecrets for flexible billing

-- ============================================================================
-- STEP 1: Add billing_mode enum (if not exists)
-- ============================================================================

DO $ BEGIN
    CREATE TYPE billing_mode AS ENUM (
        'calendar',
        'anniversary', 
        'fixed_days',
        'prepaid',
        'postpaid',
        'on_demand'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $;

-- ============================================================================
-- STEP 1b: Add billing_event_type enum (for audit trail)
-- ============================================================================

DO $ BEGIN
    CREATE TYPE billing_event_type AS ENUM (
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
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $;

-- ============================================================================
-- STEP 2: Add new columns to billing_plans table
-- ============================================================================

-- Add cycle_days column (1=daily, 7=weekly, 30=monthly, etc.)
ALTER TABLE billing_plans ADD COLUMN IF NOT EXISTS cycle_days INTEGER DEFAULT 30;
COMMENT ON COLUMN billing_plans.cycle_days IS 'Billing cycle in days: 1=daily, 7=weekly, 30=monthly, etc.';

-- Add is_recurring column
ALTER TABLE billing_plans ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT true NOT NULL;
COMMENT ON COLUMN billing_plans.is_recurring IS 'Whether the plan auto-renews: true=recurring, false=one-time';

-- Add price_per_day column
ALTER TABLE billing_plans ADD COLUMN IF NOT EXISTS price_per_day NUMERIC(10, 2);
COMMENT ON COLUMN billing_plans.price_per_day IS 'Price per day for daily billing';

-- Add price_per_week column  
ALTER TABLE billing_plans ADD COLUMN IF NOT EXISTS price_per_week NUMERIC(10, 2);
COMMENT ON COLUMN billing_plans.price_per_week IS 'Price per week for weekly billing';

-- Create index on cycle_days for billing queries
CREATE INDEX IF NOT EXISTS billing_plan_cycle_idx ON billing_plans(cycle_days);

-- ============================================================================
-- STEP 3: Create billing_profiles table
-- ============================================================================

CREATE TABLE IF NOT EXISTS billing_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    billing_mode billing_mode DEFAULT 'prepaid' NOT NULL,
    grace_days INTEGER DEFAULT 3,
    late_fee_percent NUMERIC(5, 2) DEFAULT '0',
    auto_suspend BOOLEAN DEFAULT true NOT NULL,
    allow_partial BOOLEAN DEFAULT false NOT NULL,
    credit_limit NUMERIC(10, 2) DEFAULT '0',
    wallet_required BOOLEAN DEFAULT false NOT NULL,
    billing_day INTEGER,  -- null = end of month, 1-31 = specific day
    is_default BOOLEAN DEFAULT false NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for billing_profiles
CREATE INDEX IF NOT EXISTS billing_profile_org_idx ON billing_profiles(organization_id);
CREATE INDEX IF NOT EXISTS billing_profile_name_idx ON billing_profiles(name);
CREATE INDEX IF NOT EXISTS billing_profile_mode_idx ON billing_profiles(billing_mode);

-- ============================================================================
-- STEP 4: Add new columns to ppp_secrets table
-- ============================================================================

-- Add billing_plan_id reference
ALTER TABLE ppp_secrets ADD COLUMN IF NOT EXISTS billing_plan_id UUID REFERENCES billing_plans(id) ON DELETE SET NULL;

-- Add billing_profile_id reference
ALTER TABLE ppp_secrets ADD COLUMN IF NOT EXISTS billing_profile_id UUID REFERENCES billing_profiles(id) ON DELETE SET NULL;

-- Add billing period tracking columns
ALTER TABLE ppp_secrets ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMP WITH TIME ZONE;
COMMENT ON COLUMN ppp_secrets.current_period_start IS 'Start of current billing period';

ALTER TABLE ppp_secrets ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMP WITH TIME ZONE;
COMMENT ON COLUMN ppp_secrets.current_period_end IS 'End of current billing period';

ALTER TABLE ppp_secrets ADD COLUMN IF NOT EXISTS next_billing_date TIMESTAMP WITH TIME ZONE;
COMMENT ON COLUMN ppp_secrets.next_billing_date IS 'Next billing date for anniversary/fixed billing';

ALTER TABLE ppp_secrets ADD COLUMN IF NOT EXISTS credit_used NUMERIC(10, 2) DEFAULT '0';
COMMENT ON COLUMN ppp_secrets.credit_used IS 'Credit used for postpaid billing';

ALTER TABLE ppp_secrets ADD COLUMN IF NOT EXISTS wallet_balance NUMERIC(10, 2) DEFAULT '0';
COMMENT ON COLUMN ppp_secrets.wallet_balance IS 'Wallet balance for prepaid/on-demand';

-- Create indexes for new ppp_secrets columns
CREATE INDEX IF NOT EXISTS ppp_secret_billing_profile_idx ON ppp_secrets(billing_profile_id);
CREATE INDEX IF NOT EXISTS ppp_secret_next_billing_idx ON ppp_secrets(next_billing_date);
CREATE INDEX IF NOT EXISTS ppp_secret_billing_plan_idx ON ppp_secrets(billing_plan_id);

-- ============================================================================
-- STEP 5: Create billing_events table (Audit Trail)
-- ============================================================================

CREATE TABLE IF NOT EXISTS billing_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    reseller_id UUID REFERENCES resellers(id) ON DELETE SET NULL,
    ppp_secret_id UUID REFERENCES ppp_secrets(id) ON DELETE CASCADE NOT NULL,
    event_type billing_event_type NOT NULL,
    reference_id UUID,  -- invoice_id, payment_id, etc.
    amount NUMERIC(10, 2),
    previous_value TEXT,
    new_value TEXT,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for billing_events
CREATE INDEX IF NOT EXISTS billing_event_ppp_idx ON billing_events(ppp_secret_id);
CREATE INDEX IF NOT EXISTS billing_event_type_idx ON billing_events(event_type);
CREATE INDEX IF NOT EXISTS billing_event_created_idx ON billing_events(created_at);

-- ============================================================================
-- STEP 6: Create default billing profiles for existing organizations
-- ============================================================================

-- Insert default prepaid profile for each organization (if not exists)
INSERT INTO billing_profiles (organization_id, name, description, billing_mode, is_default, is_active)
SELECT o.id, 'Standard Prepaid', 'Default prepaid billing profile', 'prepaid', true, true
FROM organizations o
WHERE NOT EXISTS (
    SELECT 1 FROM billing_profiles bp 
    WHERE bp.organization_id = o.id AND bp.is_default = true
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 7: Add foreign key to invoices table for billing_profile
-- ============================================================================

ALTER TABLE invoices ADD COLUMN IF NOT EXISTS billing_profile_id UUID REFERENCES billing_profiles(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS invoice_billing_profile_idx ON invoices(billing_profile_id);

-- ============================================================================
-- SUMMARY
-- ============================================================================

-- This migration adds:
-- 1. billing_mode enum type for different billing modes
-- 2. billing_event_type enum for audit trail
-- 3. New columns to billing_plans: cycle_days, is_recurring, price_per_day, price_per_week
-- 4. New billing_profiles table for per-user billing configuration
-- 5. New columns to ppp_secrets: billing_plan_id, billing_profile_id, current_period_start, current_period_end, next_billing_date, credit_used, wallet_balance
-- 6. billing_events table for audit trail
-- 7. Default billing profiles for existing organizations
-- 8. New column to invoices: billing_profile_id
