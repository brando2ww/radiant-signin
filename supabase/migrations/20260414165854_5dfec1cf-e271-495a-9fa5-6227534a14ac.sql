ALTER TABLE checklist_schedules ADD COLUMN IF NOT EXISTS notify_on_overdue boolean DEFAULT true;
ALTER TABLE checklist_schedules ADD COLUMN IF NOT EXISTS allow_late_completion boolean DEFAULT true;
ALTER TABLE checklist_schedules ADD COLUMN IF NOT EXISTS require_photo boolean DEFAULT false;
ALTER TABLE checklist_schedules ADD COLUMN IF NOT EXISTS notes text DEFAULT NULL;
ALTER TABLE checklist_schedules ADD COLUMN IF NOT EXISTS recurrence_type text DEFAULT 'weekly';
ALTER TABLE checklist_schedules ADD COLUMN IF NOT EXISTS recurrence_date date DEFAULT NULL;
ALTER TABLE checklist_schedules ADD COLUMN IF NOT EXISTS recurrence_day_of_month integer DEFAULT NULL;