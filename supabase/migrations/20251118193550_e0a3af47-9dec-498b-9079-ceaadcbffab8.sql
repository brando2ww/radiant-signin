-- Add missing fields to bills table
ALTER TABLE public.bills
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS installments INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS current_installment INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS parent_bill_id UUID REFERENCES public.bills(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS attachment_url TEXT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bills_due_date ON public.bills(due_date);
CREATE INDEX IF NOT EXISTS idx_bills_status ON public.bills(status);
CREATE INDEX IF NOT EXISTS idx_bills_type ON public.bills(type);
CREATE INDEX IF NOT EXISTS idx_bills_user_type_status ON public.bills(user_id, type, status);
CREATE INDEX IF NOT EXISTS idx_bills_parent_id ON public.bills(parent_bill_id);