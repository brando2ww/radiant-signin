-- Create pdv_suppliers table
CREATE TABLE public.pdv_suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  cnpj TEXT,
  contact_name TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pdv_suppliers ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Gestão de fornecedores"
  ON public.pdv_suppliers FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER handle_pdv_suppliers_updated_at
  BEFORE UPDATE ON public.pdv_suppliers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Modify pdv_ingredients to use supplier_id FK
ALTER TABLE public.pdv_ingredients 
  DROP COLUMN IF EXISTS supplier,
  ADD COLUMN supplier_id UUID REFERENCES public.pdv_suppliers(id) ON DELETE SET NULL;