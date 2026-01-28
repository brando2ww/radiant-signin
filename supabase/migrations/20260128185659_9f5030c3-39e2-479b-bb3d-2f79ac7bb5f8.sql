-- Criar tabela para armazenar fornecedores selecionados por item da cotação
CREATE TABLE pdv_quotation_item_suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_item_id UUID NOT NULL REFERENCES pdv_quotation_items(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES pdv_suppliers(id) ON DELETE CASCADE,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(quotation_item_id, supplier_id)
);

-- Habilitar RLS
ALTER TABLE pdv_quotation_item_suppliers ENABLE ROW LEVEL SECURITY;

-- Criar política para que usuários possam gerenciar apenas seus próprios dados
-- (através do vínculo com quotation_items -> quotation_requests)
CREATE POLICY "Usuários podem gerenciar fornecedores de suas cotações"
ON pdv_quotation_item_suppliers
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM pdv_quotation_items qi
    JOIN pdv_quotation_requests qr ON qr.id = qi.quotation_request_id
    WHERE qi.id = pdv_quotation_item_suppliers.quotation_item_id
    AND qr.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM pdv_quotation_items qi
    JOIN pdv_quotation_requests qr ON qr.id = qi.quotation_request_id
    WHERE qi.id = pdv_quotation_item_suppliers.quotation_item_id
    AND qr.user_id = auth.uid()
  )
);