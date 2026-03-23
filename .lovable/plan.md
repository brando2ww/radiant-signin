
## Fix: tela fica travada após fechar o modal de capacidade

### O problema real
O travamento está vindo de uma combinação de dois pontos no fluxo do salão:

1. **Empilhamento de modais do Radix**
   - `TableDetailsDialog` pode continuar aberto
   - `ComandaDialog` abre por cima
   - ao enviar, o `AlertDialog` de capacidade abre por cima de tudo

2. **Manipulação manual de `document.body.style.pointerEvents`**
   - hoje existe “forçamento” manual em `Salon.tsx`
   - isso mascara o problema e pode deixar o `body` em estado inconsistente quando um modal fecha e outro continua montado

Em resumo: não é só o botão cancelar. O fluxo inteiro de abertura/fechamento dos 3 modais precisa ser reorganizado.

### Abordagem
Vou ajustar o fluxo para existir **apenas um modal interativo por vez** e remover o hack de `pointerEvents`.

### Mudanças planejadas

| Arquivo | Ação |
|---------|------|
| `src/pages/pdv/Salon.tsx` | Centralizar abertura/fechamento dos modais, remover o hack de `document.body.style.pointerEvents`, evitar modais empilhados |
| `src/components/pdv/ComandaDialog.tsx` | Permitir preservar os dados digitados quando a validação de capacidade interromper a criação |
| `src/components/pdv/TableDetailsDialog.tsx` | Sem mudança estrutural obrigatória; o fluxo será controlado pelo `Salon.tsx` |

### Implementação
1. **Criar handlers dedicados no `Salon.tsx`**
   - substituir `setComandaDialogOpen` e `setCapacityWarningOpen` diretos por funções de cleanup
   - ao fechar qualquer modal, limpar estados relacionados:
     - `pendingComandaData`
     - `capacityWarningMessage`
     - referências temporárias da comanda em criação quando necessário

2. **Parar de empilhar modais**
   - ao clicar em “Nova” comanda dentro da mesa:
     - fechar `TableDetailsDialog`
     - abrir `ComandaDialog`
   - quando a capacidade for excedida:
     - não deixar o alerta competir com múltiplos modais abertos
     - usar o estado salvo da comanda para controlar a confirmação com segurança

3. **Preservar os dados digitados**
   - hoje o formulário da comanda é interno ao `ComandaDialog`
   - vou permitir reusar os dados enviados (`nome`, `pessoas`, `observações`) caso o alerta de capacidade apareça
   - assim o usuário não perde o preenchimento e o fluxo fica previsível

4. **Remover o hack de `pointerEvents`**
   - apagar os trechos com:
   ```ts
   document.body.style.pointerEvents = "";
   ```
   - deixar o Radix controlar foco/inert corretamente, sem intervenção manual

5. **Ajustar o cancelamento do alerta**
   - ao cancelar o alerta de capacidade:
     - fechar somente o alerta
     - manter o fluxo consistente para o usuário continuar operando normalmente
   - sem deixar overlay “fantasma” ativo

### Resultado esperado
- depois de fechar o modal de capacidade, a tela volta a aceitar clique normalmente
- não haverá mais conflito entre `TableDetailsDialog`, `ComandaDialog` e `AlertDialog`
- o fluxo de criação de comanda continua com validação de capacidade, mas sem travar a interface

### Observação técnica
O indício mais forte no código atual é este bloco em `Salon.tsx`:
```ts
document.body.style.pointerEvents = "";
```
Esse tipo de correção manual normalmente indica conflito de lifecycle entre overlays. A correção robusta é **sequenciar os modais corretamente**, não forçar o `body`.

### Validação após implementar
Vou considerar o fix correto se este fluxo funcionar sem travar:
```text
Abrir mesa
→ clicar em Nova comanda
→ preencher pessoas acima da capacidade
→ abrir alerta
→ cancelar alerta
→ conseguir clicar normalmente na tela
→ repetir e confirmar o excesso
→ criar comanda sem travamento
```
