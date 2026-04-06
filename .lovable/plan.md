

## Importar Avaliações do iFood para o Sistema

### Contexto
O iFood possui uma API de Reviews (v2) que permite listar avaliações dos clientes: `GET /review/v2.0/merchants/{merchantId}/reviews`. Cada review contém score (1-5), comentário, data, e dados do pedido. A ideia e criar um job que puxa essas avaliações periodicamente e insere na tabela `customer_evaluations` do sistema.

### Implementação

**1. Nova Edge Function `ifood-sync-reviews`**
- Busca todos os usuários com `ifood_enabled = true` na `pdv_settings`
- Para cada um, chama a API do iFood: `GET /review/v2.0/merchants/{merchantId}/reviews`
- Faz refresh do token automaticamente se expirado
- Mapeia cada review do iFood para um registro em `customer_evaluations`:
  - `customer_name` = nome do cliente no pedido (ou "Cliente iFood")
  - `nps_score` = score do iFood convertido (1-5 → escala 0-10)
  - `evaluation_date` = data da review
- Insere em `evaluation_answers` o score como resposta a uma pergunta padrão "Avaliação iFood"
- Controle de duplicatas: salvar `ifood_review_id` para não reimportar

**2. Migration: adicionar campos de controle**
- `customer_evaluations`: adicionar `source` (text, default 'manual') e `external_id` (text, nullable, unique)
- Isso permite diferenciar avaliações do iFood das manuais e evitar duplicatas

**3. Cron Job (pg_cron + pg_net)**
- Agendar a function para rodar a cada 30 minutos
- Usa `pg_cron` para chamar a edge function automaticamente

**4. Botão de sync manual na UI**
- No card de integração iFood (`IFoodIntegrationCard`), adicionar botão "Sincronizar Avaliações"
- Chama a edge function sob demanda
- Mostra última data de sync e contagem importada

**5. Filtro no Dashboard**
- No dashboard de avaliações, mostrar badge "iFood" nas avaliações importadas
- Permitir filtrar por fonte (manual vs iFood)

### Arquivos alterados/criados
1. **Migration SQL** — `source` e `external_id` em `customer_evaluations`
2. **`supabase/functions/ifood-sync-reviews/index.ts`** — nova edge function
3. **`src/hooks/use-ifood-integration.ts`** — adicionar mutation `syncReviews`
4. **`src/components/pdv/integrations/IFoodIntegrationCard.tsx`** — botão de sync
5. **SQL insert (pg_cron)** — agendar job automático

### Limitações importantes
- A API de Reviews do iFood requer homologação separada do módulo de Review — o cliente precisa ter esse módulo ativo no iFood
- O token OAuth já existente precisa ter permissão para o escopo de reviews
- Reviews do iFood não trazem WhatsApp/data de nascimento do cliente, esses campos ficarão vazios ou com valores padrão

