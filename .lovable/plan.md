## Objetivo

O botão **"Fechar"** (cobrar comanda) na tela de detalhe da comanda do garçom deve ficar sempre ativo, mesmo sem itens enviados ainda.

## Mudança

### `src/pages/garcom/GarcomComandaDetalhe.tsx`
- Na barra de ação inferior, no ramo `draftCount === 0`, remover o `disabled={sentItems.length === 0}` do botão "Fechar".
- O botão fica sempre clicável e dispara `closeComanda(comanda.id)` + `navigate(-1)` normalmente.

Nenhuma outra mudança de comportamento. O fluxo de envio para a cozinha (botão primário quando há rascunho) permanece igual.
