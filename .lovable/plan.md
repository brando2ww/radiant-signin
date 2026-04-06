
## Corrigir travamento após salvar/fechar o modal de produto

### Problema confirmado
O travamento continua porque o `body` está ficando com `pointer-events: none` depois que o modal fecha. No replay da sessão:
- o produto salva com sucesso,
- o dialog é removido,
- mas o `body` permanece bloqueado.

Isso bate com um bug conhecido do Radix quando um `Dialog` é aberto a partir de um `DropdownMenuItem`: os dois `DismissableLayer`s entram em conflito, e o cleanup final restaura o `body` para `pointer-events: none`.

### Onde está acontecendo
O fluxo atual em `src/components/pdv/ProductCard.tsx` é:
- usuário abre o menu `...`
- clica em `Editar`
- o `DropdownMenuItem` chama `onEdit(product)`
- isso abre `ProductDialog` enquanto o dropdown ainda está no mesmo ciclo de fechamento

Esse padrão foi reforçado agora também com “Enviar para Delivery”, então o card de produto ficou exatamente no cenário clássico do bug.

### Implementação
1. **Ajustar `src/components/pdv/ProductCard.tsx`**
   - Trocar a abertura direta do modal a partir de `DropdownMenuItem`.
   - Em vez de abrir o dialog no mesmo ciclo do clique, adiar a ação para o próximo tick.
   - Exemplo de abordagem:
     - criar um helper local para `queueOpen(() => onEdit(product))`
     - usar `window.setTimeout(..., 0)` dentro desse helper
   - Aplicar o mesmo padrão para `onShareToDelivery(product)`.

2. **Manter `src/pages/pdv/Products.tsx` simples**
   - Continuar usando `dialogOpen`, `selectedProduct` e `shareProduct`,
   - mas garantir que o card só solicite a abertura; a abertura real acontece já fora do ciclo do dropdown.

3. **Blindagem extra no fechamento**
   - Ao fechar `ProductDialog`, limpar estado relacionado do modal:
     - `selectedProduct` quando o dialog fechar
   - Ao fechar `ShareToDeliveryDialog`, continuar limpando `shareProduct`
   - Isso reduz risco de estado pendurado entre diálogos.

4. **Não mexer no `Dialog` global agora**
   - O problema atual não parece ser o overlay do `Dialog`.
   - O replay mostra cleanup incompleto do `body`, típico da combinação Dropdown + Dialog, então a correção deve ser focada no gatilho de abertura.

### Resultado esperado
- editar produto e salvar não trava mais a tela;
- após fechar o modal, o menu superior e os cards continuam clicáveis;
- o mesmo cuidado evita travamento ao abrir “Enviar para Delivery”.

### Detalhe técnico
O bug é compatível com issues recentes do Radix sobre:
- `DropdownMenu` abrindo `Dialog` programaticamente
- `body` preso com `pointer-events: none`
- workaround recomendado: abrir o dialog no próximo ciclo/event loop, após o dropdown terminar de desmontar

### Validação
1. Abrir `...` no card de produto.
2. Clicar em `Editar`.
3. Alterar qualquer campo e salvar.
4. Fechar o modal.
5. Confirmar que:
   - o menu superior volta a responder,
   - os botões da tela funcionam,
   - o bug não reaparece em `Enviar para Delivery`.
