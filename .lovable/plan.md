

## Criar Dados Mockados para Koten Sushi (demo@demo.com.br)

### Objetivo
Inserir dados realistas de um restaurante japonês "Koten Sushi" no banco para o usuário `d0019cb8-f5a4-4e75-8bc4-4de8079afa69`, preenchendo todas as telas do sistema.

### Dados a inserir

**1. Configurações do negócio (`business_settings` + `pdv_settings` + `delivery_settings`)**
- Nome: Koten Sushi, slogan, cores temáticas (vermelho/preto japonês)
- Horário de funcionamento, endereço, CNPJ fictício
- Settings de delivery (taxa, tempo, PIX key)

**2. Setores e Mesas (`pdv_sectors` + `pdv_tables`)**
- 3 setores: Salão Principal (8 mesas), Varanda (4 mesas), Balcão Sushi (4 bancos)
- Mesas com status variados (livre, ocupada, reservada)

**3. Produtos PDV (`pdv_products`)**
- ~25 produtos em categorias: Sushis, Sashimis, Hot Rolls, Temakis, Combinados, Bebidas, Sobremesas
- Preços realistas para restaurante japonês

**4. Ingredientes (`pdv_ingredients`)**
- ~15 ingredientes: Salmão, Atum, Arroz para sushi, Nori, Cream Cheese, Camarão, Gengibre, Wasabi, etc.
- Com estoque, custo unitário, unidades

**5. Fornecedores (`pdv_suppliers`)**
- 3 fornecedores: Peixes & Cia (peixes), Distribuidora Nippon (secos), Bebidas Express

**6. Clientes PDV (`pdv_customers`)**
- 8 clientes com nomes, telefones, total gasto, visitas

**7. Pedidos PDV (`pdv_orders` + `pdv_order_items`)**
- ~15 pedidos dos últimos 30 dias (fechados, abertos, cancelados)
- Itens variados em cada pedido

**8. Comandas (`pdv_comandas` + `pdv_comanda_items`)**
- 3 comandas abertas com itens

**9. Transações financeiras (`pdv_financial_transactions`)**
- ~20 transações (receitas e despesas) dos últimos 60 dias

**10. Contas a pagar/receber (`bills`)**
- ~8 contas (fornecedores, aluguel, energia, clientes)

**11. Contas bancárias (`pdv_bank_accounts`)**
- 2 contas: Conta Corrente Itaú, Conta PJ Nubank

**12. Delivery (`delivery_categories` + `delivery_products` + `delivery_orders` + `delivery_customers`)**
- 5 categorias delivery, 15 produtos
- 10 pedidos delivery com status variados
- 5 clientes delivery

**13. Cupons (`delivery_coupons`)**
- 3 cupons: BEMVINDO10, SUSHI20, FRETE0

**14. Campanha de avaliação (`evaluation_campaigns` + `evaluation_campaign_questions` + `customer_evaluations` + `evaluation_answers`)**
- 1 campanha "Pesquisa de Satisfação Koten Sushi" com 5 perguntas
- 12 avaliações com notas e NPS variados

**15. Centros de custo e plano de contas (`pdv_cost_centers` + `pdv_chart_of_accounts`)**
- 4 centros de custo: Cozinha, Salão, Delivery, Administrativo
- Plano de contas básico

**16. Notificações (`pdv_notifications`)**
- 5 notificações recentes

### Execução
Script SQL executado via `lov-exec` com `psql`, inserindo todos os dados em sequência usando o `user_id` fixo. Dados com datas distribuídas nos últimos 30-60 dias para gráficos e relatórios ficarem populados.

### Nenhuma alteração de schema
Apenas INSERTs — sem migrations, sem alteração de tabelas ou código.

