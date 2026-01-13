-- Add sector_id column to pdv_tables
ALTER TABLE public.pdv_tables 
ADD COLUMN sector_id uuid REFERENCES public.pdv_sectors(id) ON DELETE SET NULL;

-- Create index for better performance on sector queries
CREATE INDEX idx_pdv_tables_sector_id ON public.pdv_tables(sector_id);