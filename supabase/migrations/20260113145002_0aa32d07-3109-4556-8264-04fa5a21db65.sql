-- Add merged_with column to track merged tables
ALTER TABLE pdv_tables ADD COLUMN merged_with uuid REFERENCES pdv_tables(id) ON DELETE SET NULL;

-- Add index for better performance on merge lookups
CREATE INDEX idx_pdv_tables_merged_with ON pdv_tables(merged_with) WHERE merged_with IS NOT NULL;