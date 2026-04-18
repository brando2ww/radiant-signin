

## Objetivo
Permitir ao garçom enviar itens para a cozinha **direto da tela de adicionar itens** (`/garcom/comanda/:id/adicionar`), sem precisar voltar para a tela de detalhe da comanda. Os itens enviados disparam automaticamente a impressão via Print Bridge (já implementado — basta atualizar `sent_to_kitchen_at` que o Realtime escuta o INSERT/UPDATE).

## Contexto atual
- `GarcomAdicionarItem.tsx` hoje só adiciona itens (cria com `kitchen_status='pendente'` e `sent_to_kitchen_at=null`).
- `GarcomComandaDetalhe.tsx` já tem o botão "Cozinha" que chama `sendToKitchen(pendingIds)` — mesma lógica vai ser replicada na tela de adicionar.
- O hook `usePDVComandas` já expõe `sendToKitchen`, `comandaItems`, `getItemsByComanda` e o estado `production_center_id` por item.
- Print Bridge já escuta `pdv_comanda_items` no Realtime — assim que `sent_to_kitchen_at` é preenchido, ele imprime no centro de produção certo.

## Mudança proposta

Editar **apenas** `src/pages/garcom/GarcomAdicionarItem.tsx` para:

1. **Trazer mais coisas do hook**: `comandaItems`, `sendToKitchen`, `getItemsByComanda`.
2. **Calcular itens pendentes** da comanda atual (mesma regra do Detalhe: `kitchen_status === "pendente" && !sent_to_kitchen_at`).
3. **Adicionar barra inferior fixa** quando houver pendentes:
   - Mostra contador: "X item(ns) pendente(s) — R$ Y,YY"
   - Botão **"Enviar para Cozinha"** que chama `sendToKitchen(pendingIds)` e mostra toast de sucesso (+ aviso se houver itens sem `production_center_id`).
4. **Ajustar `pb-24` → `pb-32`** para a lista não ficar atrás da nova barra.
5. Após enviar, opcionalmente mostrar feedback visual sutil (já basta o toast).

A barra fica acima da bottom nav do garçom (`bottom-16`), no mesmo padrão visual de `GarcomComandaDetalhe`.

## Layout (mobile, 390x844)

```text
┌──────────────────────────────────┐
│ ← Adicionar Item                 │
├──────────────────────────────────┤
│ 🔍 Buscar produto...             │
│ [Cat1] [Cat2] [Cat3] ...         │
├──────────────────────────────────┤
│ [img] Produto A    R$ 12,00      │
│ [img] Produto B    R$ 18,50      │
│       ...                         │
├──────────────────────────────────┤  ← nova barra (só se houver pendentes)
│ 3 itens pendentes · R$ 48,50     │
│ [   📤 Enviar para Cozinha    ]  │
├──────────────────────────────────┤  ← bottom nav garçom
│ Mesas  Comandas  +  Cozinha  ⋯  │
└──────────────────────────────────┘
```

## Por que assim
- **Zero mudança de schema, hook ou Print Bridge** — toda a infra já existe.
- **Um único arquivo alterado**, mínimo de risco.
- Fluxo natural: garçom adiciona vários itens em sequência e dispara a cozinha sem trocar de tela.
- Mantém o botão atual em `GarcomComandaDetalhe` intocado (redundância proposital — dois pontos de entrada para a mesma ação).

## Arquivos
- `src/pages/garcom/GarcomAdicionarItem.tsx` — editar.

