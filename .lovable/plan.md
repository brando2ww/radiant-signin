## Problema

Ao tentar adicionar um item pelo PaymentDialog do caixa (botão "Adicionar item à comanda"), aparece o toast:

> **Erro ao adicionar item: Comanda não aceita novos itens (status: em_cobranca)**

A comanda foi travada como `em_cobranca` quando o operador abriu o pagamento. O front-end já permite essa edição (em `use-pdv-comandas.ts` linha 267 a lista permitida inclui `em_cobranca`), mas um **trigger de banco** bloqueia o INSERT antes que ele chegue.

## Causa raiz

Na migration `20260430191212_f9d34a86-2cb3-4272-8ae2-018a6cf08eab.sql`, linhas 556-571, o trigger `pdv_block_items_when_awaiting_payment` rejeita inserts em `pdv_comanda_items` quando a comanda está em qualquer um destes status:

```sql
IF v_status IN ('aguardando_pagamento','em_cobranca','fechada','cancelada') THEN
  RAISE EXCEPTION 'Comanda não aceita novos itens (status: %)', v_status;
END IF;
```

Isso conflita com a regra de negócio do caixa, que precisa poder corrigir o pedido (adicionar/remover itens) enquanto está no PaymentDialog. Apenas `fechada` e `cancelada` deveriam permanecer bloqueadas.

## Correção (1 migração)

Recriar a função do trigger para bloquear apenas estados terminais:

```sql
CREATE OR REPLACE FUNCTION public.pdv_block_items_when_awaiting_payment()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_status text;
BEGIN
  SELECT status INTO v_status FROM public.pdv_comandas WHERE id = NEW.comanda_id;
  IF v_status IN ('fechada','cancelada') THEN
    RAISE EXCEPTION 'Comanda não aceita novos itens (status: %)', v_status;
  END IF;
  RETURN NEW;
END;
$$;
```

O trigger continua existindo (mesmo nome) — apenas `aguardando_pagamento` e `em_cobranca` deixam de ser bloqueados. Front-end e RLS já restringem quem pode chamar essa rota (apenas operadores do caixa) — a guarda continua sendo aplicada nas camadas certas.

## Resultado esperado

Adicionar e remover itens funcionam normalmente no PaymentDialog do caixa, mesmo após a comanda estar `em_cobranca`. Comandas `fechada`/`cancelada` continuam imutáveis.

## Arquivos editados

- Nova migration aplicando o `CREATE OR REPLACE FUNCTION` acima.