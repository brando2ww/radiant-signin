

## Abertura de mesa com nome obrigatório + múltiplas comandas

Hoje, ao abrir uma mesa livre, o sistema só pergunta "Abrir Mesa X?" e cria automaticamente **uma comanda sem nome** (`customer_name = null`). Para criar comandas adicionais, o garçom precisa entrar na mesa e tocar em "Dividir em comanda nominal". Isso gera o efeito feio de várias entradas "— Mesa Mesa 12" no histórico e força um passo extra para dividir.

A proposta: **toda comanda da mesa tem nome obrigatório**, e dá pra abrir várias comandas de uma vez no momento da abertura.

### Mudanças

**1. `src/pages/garcom/GarcomMesaDetalhe.tsx` — novo dialog de abertura**

Substituir o `AlertDialog` "Abrir Mesa X?" por um `Dialog` chamado **"Abrir Mesa X"** com:

- Lista dinâmica de inputs "Comanda N" (uma linha por comanda).
- Começa com **1 input** focado, placeholder `Ex: João, Casal, Mesa frente...`.
- Botão `+ Adicionar comanda` para acrescentar mais inputs (limite 10).
- Botão `×` em cada input extra para removê-lo (o primeiro não pode ser removido).
- Botão primário **"Abrir mesa"** desabilitado enquanto qualquer input estiver vazio.
- Botão secundário **"Cancelar"** volta para a tela anterior.

Ao confirmar:
1. Cria/garante o `pdv_orders` da mesa (lógica atual já faz isso).
2. Marca a mesa como `ocupada` com `current_order_id`.
3. Para cada nome digitado, chama `createComanda({ orderId, customerName: nome })` em sequência.
4. Se houver **1 só** → navega direto para `/garcom/comanda/{id}`.
5. Se houver **2+** → fica na tela da mesa mostrando a lista das comandas criadas.

**2. Auto-redirect mantido só para continuação de atendimento**

O `useEffect` atual redireciona quando `tableComandas.length === 1`. Mantenho o comportamento — só dispara quando o dialog não está aberto. Mesa que já tinha 1 comanda aberta continua sendo aberta direto.

**3. Botão "Dividir em comanda nominal" → "+ Nova comanda"**

Renomear o botão da tela detalhe da mesa para `+ Nova comanda` (já que agora toda comanda é nominal). O `Dialog` `splitOpen` existente continua funcionando — pede um nome e cria mais 1 comanda no mesmo `order_id`.

### Diagrama do novo dialog

```text
Mesa livre → toca no card
   ↓
┌──────────────────────────────────┐
│ Abrir Mesa 5                     │
│                                  │
│ Comanda 1                        │
│ ┌────────────────────────┐       │
│ │ João                   │       │
│ └────────────────────────┘       │
│ Comanda 2                        │
│ ┌────────────────────────┐  ┌─┐  │
│ │ Maria                  │  │×│  │
│ └────────────────────────┘  └─┘  │
│                                  │
│   + Adicionar comanda            │
│                                  │
│       [Cancelar]   [Abrir mesa]  │
└──────────────────────────────────┘
   ↓
Mesa ocupada → lista as 2 comandas com seus nomes
```

### Compatibilidade

- Não muda o schema do banco.
- Mesas já abertas sem nome continuam funcionando (fallback exibe "Mesa X").
- Criação via FAB → "Comanda avulsa" (`NewOrderSheet`) já pede nome — sem alteração.

### Validação

- `/garcom` → tocar em mesa livre → modal "Abrir Mesa X" com 1 input vazio e botão "Abrir mesa" desabilitado.
- Digitar "João" → botão habilita → "Abrir mesa" → mesa ocupada, redireciona pra comanda do João.
- Repetir com 2 nomes (João + Maria) → mesa fica ocupada listando 2 comandas, cada uma com seu nome.
- Botão `+ Nova comanda` na tela da mesa → dialog de nome → cria 3ª comanda.
- Mesa já aberta com 1 comanda → continua redirecionando direto, sem dialog.
- Cancelar no dialog → volta sem criar nada.

