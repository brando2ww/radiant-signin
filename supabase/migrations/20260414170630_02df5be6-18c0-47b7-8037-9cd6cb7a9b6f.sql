ALTER TABLE checklist_operators ADD COLUMN IF NOT EXISTS avatar_color text DEFAULT '#6366f1';
ALTER TABLE checklist_operators ADD COLUMN IF NOT EXISTS default_shift text DEFAULT 'variavel';
ALTER TABLE checklist_operators ADD COLUMN IF NOT EXISTS hired_at date DEFAULT NULL;
ALTER TABLE checklist_operators ADD COLUMN IF NOT EXISTS notes text DEFAULT NULL;
ALTER TABLE checklist_operators ADD COLUMN IF NOT EXISTS last_access_at timestamptz DEFAULT NULL;