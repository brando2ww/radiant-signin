## Objetivo

Tornar o fluxo de adicionar itens silencioso. O garçom adiciona quantos itens quiser no cardápio, e só envia para a cozinha depois de revisar tudo na tela da comanda.

## Mudanças

### 1) `src/pages/garcom/GarcomAdicionarItem.tsx` — Cardápio
- Remover totalmente a barra fixa de "Enviar para Cozinha" (incluindo o handler `handleSendToKitchen`, estado `sending`, imports `Send`, `usePDVComandas`).
- Substituir por uma **barra fixa única** com botão **"Conferir comanda"** que:
  - Aparece somente quando `draftCount > 0`.
  - Mostra a contagem como badge: `Conferir comanda (3)`.
  - Mostra subtotal do rascunho à esquerda em texto secundário.
  - Ao clicar: `navigate(\`/garcom/comanda/${comandaId}\`)`.
- Ao adicionar um item via sheet: manter o comportamento silencioso atual (`draft.addItem` + `toast.success("Adicionado ao rascunho")` + fechar sheet). Sem nenhum prompt de envio.

### 2) `src/pages/garcom/GarcomComandaDetalhe.tsx` — Conferir / Enviar
A tela já agrupa "Novos itens — não enviados ainda" e "Já enviados para a cozinha", e já tem `handleFlushDraft`. Ajustes para virar a tela oficial de "Conferir comanda":

- Reordenar a barra inferior para deixar o botão principal claro:
  - Quando `draftCount > 0`:
    - **Botão primário em largura cheia: "Enviar para cozinha (N)"** chamando `handleFlushDraft`.
    - Botão secundário "Continuar adicionando" → `navigate(\`/garcom/comanda/${id}/adicionar\`)`. Sem descartar o rascunho.
    - Manter botão "Fechar" (cobrar) acessível, mas desabilitado enquanto houver rascunho não enviado (já é o comportamento atual via `disabled={... || draftItems.length > 0}`).
  - Quando `draftCount === 0`: manter o layout atual (botões Item + Fechar).
- Após `handleFlushDraft` bem-sucedido, **permanecer** na tela da comanda (já com os itens visíveis na seção "Já enviados") em vez de `navigate("/garcom")`. Isso atende ao requisito "garçom volta para a tela da comanda com os itens confirmados visíveis".
- A separação visual entre "Novos itens" e "Já enviados para a cozinha" já existe e fica como está.
- Os controles +/−/remover nos itens do rascunho já existem e ficam como estão (última chance de ajustar).

## Regras preservadas
- Rascunho continua local por usuário/comanda (sessionStorage via `DraftCartContext`).
- Envio para cozinha continua atômico: persiste itens + marca como enviados + limpa rascunho.
- Nenhuma mudança de schema ou backend.

## Arquivos editados
- `src/pages/garcom/GarcomAdicionarItem.tsx`
- `src/pages/garcom/GarcomComandaDetalhe.tsx`
