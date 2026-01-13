-- Add is_active column to pdv_tables for soft delete
ALTER TABLE pdv_tables ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Ensure all existing tables are active
UPDATE pdv_tables SET is_active = true WHERE is_active IS NULL;