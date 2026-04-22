

## Garçom não consegue lançar pedido — caixa "fechado"

### Causa raiz
`usePDVCashier` busca a sessão de caixa filtrando por `user.id` do usuário logado:

```ts
.eq("user_id", user.id)   // ← user.id é o id do GARÇOM
.is("closed_at", null)
```

Como o caixa é aberto pelo **dono do estabelecimento** (não pelo garçom), o garçom nunca encontra uma sessão aberta. Resultado: `activeSession = null` → toda tela do garçom (`Garcom.tsx`, `GarcomMesaDetalhe.tsx`) bloqueia com "Abra o caixa antes de criar uma comanda".

Isso vale para todos os usuários staff vinculados via `establishment_users` (garçom, gerente, caixa, cozinheiro). O dono continua funcionando porque `user.id` dele é o mesmo da sessão.

### Correção

**1. `src/hooks/use-pdv-cashier.ts` — usar o `establishment_owner_id` em vez de `user.id` nas leituras**

- Importar `useEstablishmentId` (já existe em `src/hooks/use-establishment-id.ts` e retorna `visibleUserId` = id do dono se for staff, ou o próprio id se for o dono).
- Trocar todas as queries de leitura (`pdv-cashier-active`, `pdv-cashier-last-closed`) para filtrar por `visibleUserId`.
- Aguardar o `isLoading` do `useEstablishmentId` antes de habilitar a query (`enabled: !!visibleUserId && !establishmentLoading`) — evita primeiro render mostrando "fechado" em telas que decidem rota com base no caixa.
- Mutations que **abrem/fecham caixa** (`openCashier`, `closeCashier`) continuam usando `user.id` do dono — garçom não abre caixa. Adicional: bloquear `openCashier` e `addMovement` se o usuário logado não for o dono (`user.id !== visibleUserId`) — defesa em profundidade.
- `registerSale` (venda) precisa funcionar para garçom: a query `activeSession` agora retorna a sessão correta do dono, então o insert em `pdv_cashier_movements` e o update em `pdv_cashier_sessions` passam a referenciar a sessão certa. (RLS dessa tabela já permite staff via `is_establishment_member` — confirmado pelo memory `staff-rls-authorization`.)

**2. Expor `isLoading` corretamente no consumo**

`Garcom.tsx` e `GarcomMesaDetalhe.tsx` chamam `if (!activeSession) toast.error(...)` no clique. Como o usuário só dispara isso depois da tela carregar, basta o fix do item 1. Sem mudanças adicionais ali.

**3. Corrigir warning do React Router (Users.tsx)**

`<Route path="usuarios">` em `App.tsx` (ou similar) precisa virar `usuarios/*` para o `<Routes>` interno do `Users.tsx` funcionar. Esse warning provavelmente está relacionado ao "Rendered more hooks than during the previous render" que aparece em `UsersList` — o React Router re-monta com tree diferente entre renders. Ajustar a rota pai para `usuarios/*` resolve ambos.

### Como validar
1. Logar como dono → abrir caixa pelo PDV.
2. Logar (em outra sessão/aba) como garçom vinculado → abrir `/garcom`, tocar em "+", criar comanda avulsa **sem** receber o toast de "Abra o caixa".
3. Adicionar item, enviar para cozinha, fechar comanda — venda deve registrar em `pdv_cashier_movements` da sessão do dono.
4. Revisitar `/pdv/usuarios` — sem warning de "Rendered more hooks" no console.

### Fora de escopo
- Permitir múltiplas sessões de caixa simultâneas (1 por terminal/garçom). Hoje há 1 caixa por estabelecimento, conduzido pelo dono — isso continua igual.
- Mexer no `usePDVCashierStatement` (relatórios), que também filtra por `user.id` mas é usado apenas no painel do dono.

