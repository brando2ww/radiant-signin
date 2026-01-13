-- Add anti-fraud audit columns to pdv_cashier_sessions
ALTER TABLE pdv_cashier_sessions
ADD COLUMN IF NOT EXISTS expected_balance numeric,
ADD COLUMN IF NOT EXISTS balance_difference numeric,
ADD COLUMN IF NOT EXISTS difference_justified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS fraud_risk_level text CHECK (fraud_risk_level IN ('ok', 'low', 'medium', 'high', 'critical'));