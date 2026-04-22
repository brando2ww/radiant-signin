

## Tornar o modal de Fechar Caixa responsivo

O modal atualmente usa `max-w-2xl` sem controle de altura nem scroll interno, então em telas com zoom alto (caso da imagem, devicePixelRatio 1.6) ou alturas menores ele estoura a viewport — o cabeçalho e o rodapé com os botões "Cancelar" e "Fechar Caixa" ficam fora da tela e o usuário não consegue concluir a ação.

### O que vai mudar

Arquivo único: `src/components/pdv/CloseCashierDialog.tsx`

1. **Limitar altura do modal e adicionar scroll interno**
   - `DialogContent` recebe: `max-w-2xl w-[95vw] max-h-[90vh] p-0 flex flex-col gap-0`
   - Isso garante que o modal nunca passe de 90% da altura da tela e se adapte à largura em qualquer viewport.

2. **Estruturar header / corpo / footer com áreas independentes**
   - `DialogHeader` fica fixo no topo com `px-6 pt-6 pb-4 border-b`.
   - O bloco do conteúdo (resumo + saldo final + alertas + justificativa + checkbox + bloqueio) vira a única área rolável: `flex-1 overflow-y-auto px-6 py-4 space-y-4`.
   - `DialogFooter` fica fixo no rodapé com `px-6 py-4 border-t`, sempre visível — assim os botões "Cancelar" e "Fechar Caixa" nunca somem.

3. **Reduzir densidade visual em telas menores**
   - Card de resumo financeiro: `pt-6` → `pt-4 pb-4` e `space-y-3` → `space-y-2` para encurtar o bloco vertical.
   - Tipografia dos cards de alerta/bloqueio: manter `text-sm`, mas garantir `break-words` na descrição para evitar overflow horizontal.
   - `DialogTitle` e `DialogDescription` mantêm tamanho atual (já estão bons).

4. **Footer empilhável no mobile**
   - `DialogFooter` recebe `flex-col-reverse sm:flex-row sm:justify-end gap-2` para que em telas estreitas o botão primário fique acima do "Cancelar" e ambos ocupem a largura cheia (`w-full sm:w-auto` nos dois `Button`).

### Resultado esperado

- Em desktop normal: aparência idêntica à atual, só com bordas separando header/footer.
- Em telas com zoom alto (como a do print) ou alturas reduzidas: o conteúdo central rola, o header e os botões ficam sempre visíveis, e o usuário consegue digitar o saldo, justificar e fechar o caixa sem precisar dar zoom out no navegador.
- Em mobile (<640px): modal ocupa 95% da largura, botões empilhados em coluna inversa (ação principal acima).

### Fora de escopo

- Nenhuma alteração na lógica de cálculo, antifraude, impressão ou nas mutações do `usePDVCashier`.
- O `OpenCashierDialog` não tem o mesmo problema (conteúdo curto), então fica como está.

