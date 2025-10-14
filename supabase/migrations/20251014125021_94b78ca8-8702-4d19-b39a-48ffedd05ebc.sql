-- Inserir cartões de crédito de exemplo
-- Nota: Substitua o user_id pelo ID real do usuário autenticado
DO $$
DECLARE
  v_user_id uuid;
  v_card_nubank uuid;
  v_card_inter uuid;
BEGIN
  -- Pegar o primeiro usuário da tabela profiles (ou você pode usar um ID específico)
  SELECT id INTO v_user_id FROM profiles LIMIT 1;
  
  IF v_user_id IS NOT NULL THEN
    -- Inserir cartão Nubank
    INSERT INTO credit_cards (
      id,
      user_id,
      name,
      brand,
      last_four_digits,
      credit_limit,
      current_balance,
      due_day,
      closing_day,
      color,
      is_active
    ) VALUES (
      gen_random_uuid(),
      v_user_id,
      'Nubank',
      'mastercard',
      '1234',
      5000,
      1200,
      15,
      10,
      'from-purple-600 to-purple-400',
      true
    ) RETURNING id INTO v_card_nubank;

    -- Inserir cartão Inter
    INSERT INTO credit_cards (
      id,
      user_id,
      name,
      brand,
      last_four_digits,
      credit_limit,
      current_balance,
      due_day,
      closing_day,
      color,
      is_active
    ) VALUES (
      gen_random_uuid(),
      v_user_id,
      'Inter',
      'visa',
      '5678',
      3000,
      850,
      20,
      15,
      'from-orange-600 to-orange-400',
      true
    ) RETURNING id INTO v_card_inter;

    -- Inserir cartão C6 Bank
    INSERT INTO credit_cards (
      id,
      user_id,
      name,
      brand,
      last_four_digits,
      credit_limit,
      current_balance,
      due_day,
      closing_day,
      color,
      is_active
    ) VALUES (
      gen_random_uuid(),
      v_user_id,
      'C6 Bank',
      'mastercard',
      '9012',
      8000,
      2300,
      25,
      20,
      'from-gray-600 to-gray-400',
      true
    );

    -- Inserir transações de exemplo vinculadas ao Nubank
    INSERT INTO transactions (user_id, type, category, amount, description, transaction_date, payment_method, credit_card_id, is_recurring)
    VALUES
      (v_user_id, 'expense', 'Compras', 150.00, 'Amazon - Eletrônicos', CURRENT_DATE - INTERVAL '2 days', 'credit_card', v_card_nubank, false),
      (v_user_id, 'expense', 'Alimentação', 89.50, 'iFood - Almoço', CURRENT_DATE - INTERVAL '5 days', 'credit_card', v_card_nubank, false),
      (v_user_id, 'expense', 'Transporte', 45.00, 'Uber - Centro', CURRENT_DATE - INTERVAL '7 days', 'credit_card', v_card_nubank, false),
      (v_user_id, 'expense', 'Assinaturas', 39.90, 'Netflix', CURRENT_DATE - INTERVAL '10 days', 'credit_card', v_card_nubank, true),
      (v_user_id, 'expense', 'Compras', 250.00, 'Mercado Livre - Notebook', CURRENT_DATE - INTERVAL '12 days', 'credit_card', v_card_nubank, false);

    -- Inserir transações de exemplo vinculadas ao Inter
    INSERT INTO transactions (user_id, type, category, amount, description, transaction_date, payment_method, credit_card_id, is_recurring)
    VALUES
      (v_user_id, 'expense', 'Marketing e Publicidade', 200.00, 'Google Ads', CURRENT_DATE - INTERVAL '3 days', 'credit_card', v_card_inter, false),
      (v_user_id, 'expense', 'Assinaturas', 49.90, 'Adobe Creative Cloud', CURRENT_DATE - INTERVAL '8 days', 'credit_card', v_card_inter, true),
      (v_user_id, 'expense', 'Alimentação', 120.00, 'Restaurante', CURRENT_DATE - INTERVAL '6 days', 'credit_card', v_card_inter, false),
      (v_user_id, 'expense', 'Compras', 180.00, 'Magazine Luiza - Material', CURRENT_DATE - INTERVAL '11 days', 'credit_card', v_card_inter, false);

    -- Inserir algumas transações gerais (não vinculadas a cartões)
    INSERT INTO transactions (user_id, type, category, amount, description, transaction_date, payment_method, is_recurring)
    VALUES
      (v_user_id, 'income', 'Vendas de Produtos', 2500.00, 'Venda - Cliente João Silva', CURRENT_DATE - INTERVAL '1 day', 'pix', false),
      (v_user_id, 'income', 'Prestação de Serviços', 1800.00, 'Serviço de Consultoria', CURRENT_DATE - INTERVAL '4 days', 'transferencia', false),
      (v_user_id, 'expense', 'Tributárias (DAS, impostos)', 70.60, 'DAS - Outubro 2025', CURRENT_DATE - INTERVAL '15 days', 'debito', true),
      (v_user_id, 'expense', 'Fornecedores', 500.00, 'Fornecedor XYZ - Insumos', CURRENT_DATE - INTERVAL '9 days', 'pix', false),
      (v_user_id, 'expense', 'Contas (luz, água, internet)', 150.00, 'Energia Elétrica', CURRENT_DATE - INTERVAL '13 days', 'debito', true);

  END IF;
END $$;