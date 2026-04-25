## Remover badges de status no painel Salão do caixa

No card de cada comanda/mesa do painel "Salão", remover completamente os badges de status ("Aguardando", "Aberta", "Em cobrança") que aparecem ao lado do título.

### Mudança

**`src/components/pdv/cashier/SalonQueueCard.tsx`**

- Remover todo o bloco de Badge (linhas ~97-110), incluindo o "Em cobrança".
- Ajustar o layout para o título ocupar a linha inteira.
- Remover imports não utilizados (`Badge`, `Loader2`) se não forem usados em outro lugar do arquivo.

A indicação visual de "em cobrança" continua existindo via outros elementos (borda/destaque do card e ações disponíveis), então os badges deixam de ser necessários.