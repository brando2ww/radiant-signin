ALTER TABLE public.delivery_products 
ADD COLUMN source_pdv_product_id uuid REFERENCES public.pdv_products(id) ON DELETE SET NULL;