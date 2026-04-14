-- Add color column to checklists
ALTER TABLE checklists ADD COLUMN IF NOT EXISTS color text DEFAULT '#6366f1';

-- Add default_shift column to checklists
ALTER TABLE checklists ADD COLUMN IF NOT EXISTS default_shift text DEFAULT 'todos';

-- Add multiple_choice to checklist_item_type enum
ALTER TYPE checklist_item_type ADD VALUE IF NOT EXISTS 'multiple_choice';

-- Add options column to checklist_items for multiple choice
ALTER TABLE checklist_items ADD COLUMN IF NOT EXISTS options jsonb DEFAULT NULL;