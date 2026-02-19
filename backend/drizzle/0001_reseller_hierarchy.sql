-- Reseller Hierarchy System Migration
-- Multi-level reseller with commission and fund dependency control

-- Create enums
CREATE TYPE reseller_role AS ENUM ('admin', 'macro', 'reseller', 'sub_reseller');
CREATE TYPE commission_type AS ENUM ('percentage', 'fixed', 'margin');
CREATE TYPE transaction_type AS ENUM ('credit', 'debit', 'commission_earned', 'commission_paid', 'package_sale', 'package_cost', 'refund', 'adjustment');
CREATE TYPE reseller_status AS ENUM ('active', 'suspended', 'inactive', 'pending');

-- Create resellers table (hierarchical)
CREATE TABLE resellers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES resellers(id) ON DELETE SET NULL,
  
  name VARCHAR(255) NOT NULL,
  company_name VARCHAR(255),
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  
  role reseller_role DEFAULT 'reseller' NOT NULL,
  level INTEGER DEFAULT 1,
  
  commission_type commission_type DEFAULT 'percentage',
  commission_value NUMERIC(5, 2) DEFAULT '0',
  margin_percent NUMERIC(5, 2) DEFAULT '0',
  
  fund_dependency_enabled BOOLEAN DEFAULT true NOT NULL,
  credit_limit NUMERIC(10, 2) DEFAULT '0',
  
  wallet_balance NUMERIC(12, 2) DEFAULT '0' NOT NULL,
  
  status reseller_status DEFAULT 'pending' NOT NULL,
  settings JSONB DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes
CREATE INDEX reseller_org_idx ON resellers(organization_id);
CREATE INDEX reseller_parent_idx ON resellers(parent_id);
CREATE INDEX reseller_user_idx ON resellers(user_id);
CREATE INDEX reseller_status_idx ON resellers(status);

-- Create reseller transactions (ledger)
CREATE TABLE reseller_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reseller_id UUID REFERENCES resellers(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  
  type transaction_type NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  balance_before NUMERIC(12, 2) NOT NULL,
  balance_after NUMERIC(12, 2) NOT NULL,
  
  reference_type VARCHAR(50),
  reference_id UUID,
  related_reseller_id UUID REFERENCES resellers(id) ON DELETE SET NULL,
  
  description TEXT,
  notes TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes
CREATE INDEX transaction_reseller_idx ON reseller_transactions(reseller_id);
CREATE INDEX transaction_org_idx ON reseller_transactions(organization_id);
CREATE INDEX transaction_type_idx ON reseller_transactions(type);
CREATE INDEX transaction_ref_idx ON reseller_transactions(reference_type, reference_id);

-- Create reseller commissions (per package)
CREATE TABLE reseller_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reseller_id UUID REFERENCES resellers(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  billing_plan_id UUID REFERENCES billing_plans(id) ON DELETE CASCADE,
  
  commission_type commission_type DEFAULT 'percentage',
  commission_value NUMERIC(5, 2) NOT NULL,
  max_commission NUMERIC(10, 2),
  min_commission NUMERIC(10, 2) DEFAULT '0',
  is_active BOOLEAN DEFAULT true NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes
CREATE INDEX commission_reseller_idx ON reseller_commissions(reseller_id);
CREATE INDEX commission_plan_idx ON reseller_commissions(billing_plan_id);

-- Create reseller hierarchy table (for quick tree queries)
CREATE TABLE reseller_hierarchy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ancestor_id UUID REFERENCES resellers(id) ON DELETE CASCADE NOT NULL,
  descendant_id UUID REFERENCES resellers(id) ON DELETE CASCADE NOT NULL,
  depth INTEGER NOT NULL
);

-- Create indexes
CREATE INDEX hierarchy_ancestor_idx ON reseller_hierarchy(ancestor_id);
CREATE INDEX hierarchy_descendant_idx ON reseller_hierarchy(descendant_id);

-- Function to get full reseller tree (recursive CTE)
CREATE OR REPLACE FUNCTION get_reseller_tree(root_id UUID)
RETURNS TABLE (
  id UUID,
  parent_id UUID,
  name VARCHAR(255),
  role reseller_role,
  level INTEGER,
  wallet_balance NUMERIC(12, 2)
) AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE reseller_tree AS (
    SELECT r.id, r.parent_id, r.name, r.role, r.level, r.wallet_balance
    FROM resellers r
    WHERE r.id = root_id
    
    UNION ALL
    
    SELECT r.id, r.parent_id, r.name, r.role, r.level, r.wallet_balance
    FROM resellers r
    INNER JOIN reseller_tree rt ON r.parent_id = rt.id
  )
  SELECT * FROM reseller_tree;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate commission for a sale
CREATE OR REPLACE FUNCTION calculate_commission(
  p_reseller_id UUID,
  p_plan_id UUID,
  p_sale_amount NUMERIC
)
RETURNS NUMERIC AS $$
DECLARE
  v_commission_value NUMERIC;
  v_commission_type commission_type;
  v_commission NUMERIC;
BEGIN
  -- First try to get plan-specific commission
  SELECT rc.commission_value, rc.commission_type
  INTO v_commission_value, v_commission_type
  FROM reseller_commissions rc
  WHERE rc.reseller_id = p_reseller_id
    AND rc.billing_plan_id = p_plan_id
    AND rc.is_active = true
  LIMIT 1;
  
  -- If no plan-specific commission, use reseller default
  IF v_commission_value IS NULL THEN
    SELECT r.commission_value, r.commission_type
    INTO v_commission_value, v_commission_type
    FROM resellers r
    WHERE r.id = p_reseller_id;
  END IF;
  
  -- Calculate commission based on type
  IF v_commission_type = 'percentage' THEN
    v_commission := p_sale_amount * (v_commission_value / 100);
  ELSIF v_commission_type = 'fixed' THEN
    v_commission := v_commission_value;
  ELSE
    v_commission := 0;
  END IF;
  
  RETURN COALESCE(v_commission, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to process package sale with commission distribution
CREATE OR REPLACE FUNCTION process_package_sale(
  p_seller_reseller_id UUID,
  p_buyer_reseller_id UUID,
  p_amount NUMERIC,
  p_plan_id UUID,
  p_reference_id UUID
)
RETURNS void AS $$
DECLARE
  v_seller RESELLER%ROWTYPE;
  v_buyer RESELLER%ROWTYPE;
  v_parent RESELLER%ROWTYPE;
  v_commission NUMERIC;
  v_margin NUMERIC;
  v_current_reseller_id UUID;
  v_balance_before NUMERIC;
  v_balance_after NUMERIC;
BEGIN
  -- Get seller details
  SELECT * INTO v_seller FROM resellers WHERE id = p_seller_reseller_id;
  
  -- Get buyer details  
  SELECT * INTO v_buyer FROM resellers WHERE id = p_buyer_reseller_id;
  
  -- Check fund dependency for seller
  IF v_seller.fund_dependency_enabled THEN
    IF v_seller.wallet_balance + v_seller.credit_limit < p_amount THEN
      RAISE EXCEPTION 'Insufficient funds. Required: %, Available: %', p_amount, v_seller.wallet_balance;
    END IF;
  END IF;
  
  -- Deduct from seller wallet
  UPDATE resellers 
  SET wallet_balance = wallet_balance - p_amount,
      updated_at = NOW()
  WHERE id = p_seller_reseller_id
  RETURNING wallet_balance INTO v_balance_after;
  
  -- Record transaction
  INSERT INTO reseller_transactions (
    reseller_id, organization_id, type, amount, balance_before, balance_after,
    reference_type, reference_id, description
  ) VALUES (
    p_seller_reseller_id, v_seller.organization_id, 'package_sale',
    p_amount, v_balance_after + p_amount, v_balance_after,
    'billing_plan', p_plan_id, 
    'Package sale to reseller ' || v_buyer.name
  );
  
  -- Calculate and distribute commission up the chain
  v_current_reseller_id := p_seller_reseller_id;
  
  WHILE v_current_reseller_id IS NOT NULL LOOP
    -- Get parent
    SELECT * INTO v_parent FROM resellers WHERE id = (
      SELECT parent_id FROM resellers WHERE id = v_current_reseller_id
    );
    
    IF v_parent IS NULL THEN
      EXIT;
    END IF;
    
    -- Calculate commission for parent
    v_commission := calculate_commission(v_parent.id, p_plan_id, p_amount);
    
    IF v_commission > 0 THEN
      -- Credit parent wallet
      UPDATE resellers
      SET wallet_balance = wallet_balance + v_commission,
          updated_at = NOW()
      WHERE id = v_parent.id
      RETURNING wallet_balance INTO v_balance_after;
      
      -- Record commission transaction
      INSERT INTO reseller_transactions (
        reseller_id, organization_id, type, amount, balance_before, balance_after,
        reference_type, reference_id, related_reseller_id, description
      ) VALUES (
        v_parent.id, v_parent.organization_id, 'commission_earned',
        v_commission, v_balance_after - v_commission, v_balance_after,
        'billing_plan', p_plan_id, v_current_reseller_id,
        'Commission from reseller ' || v_seller.name
      );
      
      -- Record commission paid by child
      INSERT INTO reseller_transactions (
        reseller_id, organization_id, type, amount, balance_before, balance_after,
        reference_type, reference_id, related_reseller_id, description
      ) VALUES (
        v_current_reseller_id, v_seller.organization_id, 'commission_paid',
        v_commission, v_balance_after + v_commission, v_balance_after,
        'billing_plan', p_plan_id, v_parent.id,
        'Commission paid to parent ' || v_parent.name
      );
    END IF;
    
    v_current_reseller_id := v_parent.id;
    v_parent := NULL;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Add comments
COMMENT ON TABLE resellers IS 'Multi-level reseller hierarchy with commission and wallet management';
COMMENT ON TABLE reseller_transactions IS 'Transaction ledger for all wallet operations';
COMMENT ON TABLE reseller_commissions IS 'Commission rules per billing plan';
COMMENT ON TABLE reseller_hierarchy IS 'Pre-computed hierarchy for fast tree queries';
