-- Add marketing tracking fields to delivery_settings
ALTER TABLE delivery_settings
ADD COLUMN meta_pixel_id TEXT,
ADD COLUMN google_tag_id TEXT;