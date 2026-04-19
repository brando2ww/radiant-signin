
## Diagnóstico

O frontend está funcionando no ponto principal:
- o item é adicionado
- o botão **Enviar para Cozinha** aparece
- o `UPDATE` de `sent_to_kitchen_at` é disparado
- o roteamento por `production_center_id` está sendo resolvido

O bloqueio mais provável agora está no **Print Bridge lendo os dados para imprimir**.

## Causa mais provável

Há uma inconsistência entre o modelo de acesso do bridge e as views de impressão:

- `print-bridge/server.js` usa apenas `SUPABASE_ANON_KEY`
- o README também assume bridge com **anon key**
- porém as views `vw_print_bridge_comanda_items` e `vw_print_bridge_order_items` foram marcadas com `security_invoker = true`
- e as tabelas-base (`pdv_comandas`, `pdv_comanda_items`, etc.) têm políticas RLS voltadas a `authenticated`, não a `anon`

Na prática, isso pode fazer o bridge:
1. receber o evento Realtime
2. tentar buscar a linha na view
3. receber `null`/sem acesso
4. sair silenciosamente sem imprimir

Isso explica bem o sintoma: **“nenhuma comanda sequer foi impressa”**.

## Plano

### 1. Corrigir o acesso das views do Print Bridge
Criar uma migration para ajustar `vw_print_bridge_comanda_items` e `vw_print_bridge_order_items` para o modelo correto do bridge local:

- remover a dependência de `security_invoker = true` para essas views
- manter apenas os campos mínimos necessários para impressão
- garantir `GRANT SELECT` nas views para `anon` e `authenticated`

Objetivo: permitir que o bridge com `anon key` leia somente os dados de impressão, sem depender do RLS das tabelas operacionais.

### 2. Melhorar o diagnóstico no `print-bridge/server.js`
Hoje o bridge falha “mudo” quando a view não retorna linha.

Vou ajustar para:
- logar erro da consulta nas views
- logar quando `handleComandaItem` / `handleOrderItem` não encontra dados
- diferenciar claramente:
  - sem acesso / sem linha
  - sem `printer_ip`
  - falha TCP
  - evento ignorado por dedupe

Assim, da próxima vez o log mostrará exatamente onde parou.

### 3. Manter o reforço de IP normalizado
A normalização de IP com zeros à esquerda continua correta e deve ser mantida, porque alguns centros tinham IP inválido para TCP.

Ela não resolve sozinha o problema atual, mas evita o próximo bloqueio depois que a leitura da view voltar a funcionar.

### 4. Validar ponta a ponta
Depois da correção:
- testar 1 item simples
- testar 1 produto composto
- confirmar nos logs do bridge:
  - evento `UPDATE` recebido
  - linha da view carregada
  - IP/porta resolvidos
  - tentativa de impressão por TCP
  - sucesso ou erro explícito

### 5. Reinício obrigatório do bridge local
Como o bridge roda no PC do estabelecimento, após a atualização será necessário:
- atualizar o `print-bridge/server.js` local
- reiniciar o serviço (`pm2 restart velara-print-bridge` ou `npm start`)

## Arquivos envolvidos

- `supabase/migrations/...sql` — ajustar acesso das views `vw_print_bridge_*`
- `print-bridge/server.js` — logs e diagnóstico de consulta/impressão

## Detalhes técnicos

```text
Garçom
  -> UPDATE pdv_comanda_items.sent_to_kitchen_at
  -> Realtime chega no Print Bridge
  -> Bridge consulta vw_print_bridge_comanda_items(id)
  -> hoje: consulta pode voltar vazia por anon + security_invoker + RLS
  -> bridge sai sem imprimir
```

## Resultado esperado

Após a correção:
- o bridge local conseguirá ler a linha da view com a `anon key`
- itens enviados para a cozinha voltarão a imprimir
- se houver falha restante (IP, porta, rede ou impressora), o motivo aparecerá claramente no log
