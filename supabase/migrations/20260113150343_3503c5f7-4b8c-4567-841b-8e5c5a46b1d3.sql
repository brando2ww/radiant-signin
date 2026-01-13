-- Add color and position/dimension columns to pdv_sectors for visual sector areas
ALTER TABLE pdv_sectors 
ADD COLUMN IF NOT EXISTS color text DEFAULT '#6366f1',
ADD COLUMN IF NOT EXISTS position_x integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS position_y integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS width integer DEFAULT 300,
ADD COLUMN IF NOT EXISTS height integer DEFAULT 200;