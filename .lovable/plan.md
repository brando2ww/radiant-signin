## Rascunho local por garçom — não persiste nem vaza entre sessões

### Bug raiz

Hoje `addItem` (em `usePDVComandas`, linhas ~240-329) faz `INSERT` direto em `pdv_comanda_items` com `kitchen_status = "pendente"` e `sent_to_kitchen_at = null`. Como a tabela é compartilhada e visível para todos os garçons do estabelecimento, os "itens pendentes" de um garçom aparecem na tela do próximo que abrir a mesma comanda — e somam ao novo pedido. Pior: nunca são limpos automaticamente; ficam até alguém apagar manualmente.

### Princípio da correção

Rascunho deixa de existir no banco. Vira **estado local do dispositivo do garçom**, com chave por `(userId, comandaId)`. Só vira linha em `pdv_comanda_items` no momento em que o garçom toca **Enviar para a cozinha**.

### Onde mexer

Apenas frontend, sem migração:

- `src/contexts/DraftCartContext.tsx` (novo) — provider que mantém o rascunho em memória + `sessionStorage` por dispositivo/aba.
- `src/App.tsx` — montar o `DraftCartProvider` dentro do `AuthProvider`.
- `src/hooks/use-pdv-comandas.ts` — não muda comportamento de `addItem`/`updateItem`/`removeItem` (continuam servindo o caixa via `PaymentDialog`/`OrderDetailsDialog`, que precisa persistir em correções pós-cobrança). Vamos apenas usar esses hooks pelo cashier; o garçom passa a usar o draft.
- `src/pages/garcom/GarcomAdicionarItem.tsx` — `handleAdd` grava no draft em vez de chamar `addItem`. Listagem de "itens pendentes" no rodapé vem do draft.
- `src/pages/garcom/GarcomComandaDetalhe.tsx` — grupo "Novos itens — não enviados ainda" passa a vir do draft (não mais do banco). `−`/`+`/lixeira mexem no draft. Botão **Cozinha** envia tudo do draft em uma só transação e limpa o draft.
- `src/pages/garcom/GarcomMesaDetalhe.tsx` — mesma fonte para o grupo "Não enviados ainda" (somente leitura nessa tela). Como cada draft é por garçom, a mesa de outro garçom só mostra os enviados.

### Como o draft funciona

#### Estrutura

```ts
type DraftItem = {
  draftId: string;            // uuid local
  productId: string;
  productName: string;
  unitPrice: number;          // preço base + ajustes de opções já somados
  quantity: number;
  notes?: string;
  // metadados úteis para o envio:
  selectedOptions?: SelectedOption[];
  createdAt: number;
};

type DraftCart = Record<string /*comandaId*/, DraftItem[]>;
```

Persistência: `sessionStorage` na chave `garcom-draft:<userId>`. `sessionStorage` (e não `localStorage`) garante que:
- Fechar a aba/app → some.
- Logout/expirar sessão → na re-autenticação a chave muda (ou já não existe).
- Outras abas/dispositivos não compartilham — escopo nativo do `sessionStorage` é por aba.

Para reforçar a regra "outro garçom nunca vê", a chave inclui `userId` (vinda de `useAuth().user.id`); se trocar de usuário no mesmo dispositivo, o draft do anterior fica invisível e é descartado na próxima limpeza (ver TTL).

#### TTL implícito

Cada `DraftItem` carrega `createdAt`. Ao montar o provider e a cada gravação, descartamos itens com mais de 8 horas (limite simples; cobre turno de garçom e evita lixo eterno). Não há TTL de 30s "para perguntar se quer recuperar" — em vez disso, o app sempre **mostra o rascunho próprio** quando o mesmo garçom volta para a mesma comanda no mesmo dispositivo/aba, com um botão claro **"Descartar rascunho"**. Esse padrão é mais simples e não esconde nada do garçom.

> Decisão deliberada: o prompt sugeria um modal "recuperar / descartar / 30s timeout". Trocamos por mostrar o rascunho diretamente + um botão "Descartar" sempre visível no header do grupo. Motivo: timer de 30s assusta e perde dado por inatividade. Se o usuário não quiser, basta um toque. Posso alterar para o fluxo modal com timer se preferir.

#### API do contexto

```ts
interface DraftCartContextValue {
  getItems(comandaId: string): DraftItem[];
  addItem(comandaId: string, item: Omit<DraftItem, "draftId" | "createdAt">): void;
  updateQuantity(comandaId: string, draftId: string, quantity: number): void;
  removeItem(comandaId: string, draftId: string): void;
  clear(comandaId: string): void;
  total(comandaId: string): number;   // sum quantity * unitPrice
  count(comandaId: string): number;
}
```

Tudo síncrono e in-memory; nada toca o Supabase.

#### Envio para cozinha

Em vez do fluxo atual (toca em "Enviar para Cozinha" → atualiza linhas já existentes), passa a ser:

1. `await Promise.all(draftItems.map(it => addItem({ comandaId, productId: it.productId, productName: it.productName, quantity: it.quantity, unitPrice: it.unitPrice, notes: it.notes })))` — usa o `addItem` atual do hook, que já faz o `INSERT` correto.
2. Coleta os IDs retornados.
3. `await sendToKitchenAsync(insertedIds)` — marca `sent_to_kitchen_at` e enfileira impressão.
4. `clear(comandaId)` no draft.
5. `navigate("/garcom")`.

Isso garante atomicidade prática: se algum `addItem` falhar, **não** chamamos `sendToKitchen` e o draft permanece intacto para o garçom tentar de novo.

#### O que muda visualmente

- `GarcomAdicionarItem`: rodapé "X itens pendentes / R$ Y" agora reflete o draft local. O botão **Enviar para a Cozinha** dispara o flush descrito acima.
- `GarcomComandaDetalhe`:
  - O grupo "Novos itens — não enviados ainda" lê do draft em vez de filtrar `comandaItems`. Os controles `−`/`+`/lixeira chamam `updateQuantity`/`removeItem` do contexto.
  - O grupo "Já enviados para a cozinha" continua lendo do banco normalmente.
  - O cabeçalho do grupo de rascunho ganha um botão pequeno **"Descartar"** ao lado do contador. Toque limpa o draft daquela comanda.
- `GarcomMesaDetalhe`: exibe o grupo "Não enviados ainda" usando `getItems(comanda.id)`. Como o draft é por usuário do dispositivo, mesas/comandas vistas por outro garçom não exibem rascunho alheio (correto por construção).

#### Limpeza do banco

Itens que hoje já estão "presos" como pendentes nas comandas (pré-correção) **continuarão aparecendo** como enviados para o garçom (pois `kitchen_status = "pendente"` e `sent_to_kitchen_at = null` é hoje a definição de rascunho). Para evitar exibir esses fantasmas como "Já enviados", vamos tratá-los como rascunho órfão:

- No `GarcomComandaDetalhe`, ao montar, se houver itens persistidos com `kitchen_status === "pendente" && !sent_to_kitchen_at`, mostrar um banner discreto **"Existem N itens não enviados pendentes nesta comanda (sessão antiga). [Apagar todos] [Enviar para a cozinha]"** com a ação que o garçom escolher. Sem esse banner, o app fica inconsistente nas comandas que já têm lixo.
- Não fazemos limpeza automática em background — o garçom decide.

### Detalhes técnicos

`DraftCartProvider` lê/escreve `sessionStorage` em todo `useEffect` de mutação. A chave inclui `userId`; se `user` mudar (login/logout), reseta o estado. Estrutura inicial:

```ts
const STORAGE_KEY = (uid: string) => `garcom-draft:${uid}`;
const TTL_MS = 8 * 60 * 60 * 1000;
```

Hidratação: ao montar, ler chave, descartar itens com `createdAt < now - TTL_MS`, manter o resto.

`GarcomAdicionarItem.handleAdd`:
```ts
const { addItem: addToDraft } = useDraftCart();
addToDraft(comandaId, {
  productId: selectedProduct.id,
  productName: selectedProduct.name,
  quantity,
  unitPrice: (selectedProduct.price_salon ?? 0) + optionsExtra,
  notes: fullNotes || undefined,
  selectedOptions,
});
resetSheet();
toast.success("Adicionado ao rascunho");
```

`GarcomComandaDetalhe`:
- Substituir `draftItems = items.filter(isDraftItem)` por `draftItems = useDraftCart().getItems(id)`.
- Manter `sentItems` como hoje, mas estendido para incluir tudo de `comandaItems` filtrado por `comanda_id` (ou seja: todos itens persistidos viram "enviados" para fins de visualização — exceto o caso do banner de fantasmas legados acima).
- `pendingIds` para o botão "Cozinha" desaparece — o botão vira "Cozinha (N)" baseado em `count(id)` do draft.
- Handler do botão Cozinha:
  ```ts
  const flush = async () => {
    const list = getItems(id);
    if (!list.length) return;
    const created = await Promise.all(
      list.map(it => addItem({
        comandaId: id, productId: it.productId, productName: it.productName,
        quantity: it.quantity, unitPrice: it.unitPrice, notes: it.notes,
      }))
    );
    await sendToKitchenAsync(created.map(c => c.id));
    clear(id);
    navigate("/garcom");
  };
  ```

`GarcomMesaDetalhe`: mesmo padrão de leitura — `draftItems = useDraftCart().getItems(comanda.id)`, sem qualquer ação de edição.

### O que NÃO muda

- `usePDVComandas.addItem` continua funcionando do jeito atual — o caixa (`PaymentDialog`, `OrderDetailsDialog`) usa para correção de itens já confirmados, fluxo onde a persistência imediata é correta.
- `sendToKitchen` continua igual.
- Banco / RLS / triggers não mudam.

### Validação

- Garçom A adiciona 3 itens à comanda X, sai sem enviar. Banco continua com 0 itens novos para X.
- Garçom B abre a mesma comanda X em outro dispositivo: vê só os itens que já foram realmente enviados antes. Não enxerga nada do rascunho de A.
- Garçom A volta para X no mesmo dispositivo/aba: rascunho intacto, com botão "Descartar" no header do grupo.
- Garçom A toca "Cozinha": os 3 itens viram linhas em `pdv_comanda_items` com `sent_to_kitchen_at` preenchido, draft fica vazio, app navega para /garcom.
- Garçom A faz logout: ao logar de novo, draft sumiu (chave do `sessionStorage` está atrelada ao user, e a aba/sessão pode até sobreviver — ainda assim, ao deslogar limpamos a chave explicitamente).
- Fechar aba/app: rascunho some.
- Comanda com fantasmas legados: banner aparece com [Apagar todos] / [Enviar para a cozinha].
