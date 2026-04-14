ALTER TABLE public.pdv_product_option_items
  ADD COLUMN IF NOT EXISTS linked_product_id uuid REFERENCES public.pdv_products(id) ON DELETE SET NULL;