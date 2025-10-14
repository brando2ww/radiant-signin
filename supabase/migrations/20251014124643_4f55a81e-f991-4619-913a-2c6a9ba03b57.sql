-- Adicionar coluna credit_card_id na tabela transactions para vincular transações aos cartões
ALTER TABLE transactions
ADD COLUMN credit_card_id uuid REFERENCES credit_cards(id) ON DELETE SET NULL;

-- Index para melhorar performance nas queries
CREATE INDEX idx_transactions_credit_card_id ON transactions(credit_card_id);

-- Comentário explicativo
COMMENT ON COLUMN transactions.credit_card_id IS 'Vincula a transação a um cartão de crédito específico';