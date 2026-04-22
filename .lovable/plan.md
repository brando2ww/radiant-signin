
## Corrigir definitivamente o erro de caixa para garçons/staff

### Problema exato
O erro do Gabriel continuar vendo “Abra o caixa antes de criar uma comanda” mesmo com o caixa do Ederson aberto indica que o problema não está mais só no filtro do frontend.

Hoje existem **dois bloqueios combinados**:

1. **Frontend** já passou a procurar a sessão pelo `visibleUserId` (dono).
2. **Banco/RLS** de `pdv_cashier_sessions` e `pdv_cashier_movements` ainda foi criado com regra antiga:
   - só enxerga sessão se `auth.uid() = user_id`
   - só movimenta sessão se `auth.uid() = user_id`

Resultado: o garçom tenta ler a sessão do dono, mas o Supabase bloqueia a leitura. Para o app, parece que “não há caixa aberto”.

Além disso, há um segundo problema estrutural: alguns registros operacionais ainda estão sendo gravados com `user.id` do funcionário, em vez do `visibleUserId` do estabelecimento. Isso pode quebrar fluxo de comandas/pedidos mesmo depois do caixa ser liberado.

### Implementação

#### 1. Ajustar RLS do caixa no Supabase
Criar uma migration para substituir as policies de:

- `public.pdv_cashier_sessions`
- `public.pdv_cashier_movements`

Regras novas:

- **SELECT em sessões**: permitir dono (`auth.uid() = user_id`) e staff vinculado (`public.is_establishment_member(user_id)`).
- **UPDATE em sessões**: permitir dono e staff vinculado para registrar totais/fechamento quando a operação for do estabelecimento.
- **SELECT/INSERT/UPDATE em movimentos**: permitir quando a sessão referenciada pertence ao dono logado **ou** ao dono do estabelecimento ao qual o staff está vinculado.
- **INSERT de nova sessão (abrir caixa)**: continuar restrito ao dono.
- **DELETE**: manter restrito ao dono.

Isso resolve o bloqueio real do Gabriel.

#### 2. Alinhar ownership dos registros operacionais ao estabelecimento
Revisar hooks que ainda gravam com `user.id` do funcionário e mudar para `visibleUserId` quando o registro pertence ao estabelecimento:

- `src/hooks/use-pdv-comandas.ts`
  - `generateComandaNumber()` deve contar por `visibleUserId`
  - `createComanda()` deve inserir `user_id: visibleUserId`
- `src/hooks/use-pdv-orders.ts`
  - `createOrder()` deve inserir `user_id: visibleUserId`
  - manter `opened_by: user.id` como auditoria do funcionário
- `src/hooks/use-pdv-payments.ts`
  - buscar sessão ativa por `visibleUserId`, não por `user.id`
  - registrar movimento/totais na sessão do dono
- revisar pontos parecidos onde o registro é do estabelecimento, mas o autor continua sendo o usuário logado

Isso evita cenário em que o garçom consegue abrir a comanda, mas ela fica “presa” no usuário dele e some das telas que leem por estabelecimento.

#### 3. Endurecer o hook de caixa para staff
Em `src/hooks/use-pdv-cashier.ts`:

- manter leitura por `visibleUserId`
- continuar impedindo `openCashier` para quem não é dono
- revisar se `addMovement` deve ser staff permitido ou só dono, conforme regra atual do produto
- expor loading de forma consistente para evitar falso “caixa fechado” durante bootstrap

#### 4. Melhorar o bloqueio no app do garçom
Em:

- `src/pages/Garcom.tsx`
- `src/pages/garcom/GarcomMesaDetalhe.tsx`

ajustar a validação para não disparar o toast antes da carga do caixa terminar.  
Assim o app só mostra “caixa fechado” quando realmente terminou de consultar e veio sem sessão.

### Arquivos previstos
- `src/hooks/use-pdv-cashier.ts`
- `src/hooks/use-pdv-comandas.ts`
- `src/hooks/use-pdv-orders.ts`
- `src/hooks/use-pdv-payments.ts`
- `src/pages/Garcom.tsx`
- `src/pages/garcom/GarcomMesaDetalhe.tsx`
- nova migration em `supabase/migrations/...sql`

### Detalhes técnicos
```text
Fluxo correto para staff:

garçom logado
  -> useEstablishmentId() resolve owner_id
  -> consulta caixa por owner_id
  -> RLS permite ler sessão do owner
  -> cria comanda/pedido com user_id = owner_id
  -> mantém opened_by / added_by = garçom
  -> pagamento e movimentos entram na mesma sessão do estabelecimento
```

### Validação
1. Abrir caixa com o proprietário Ederson.
2. Logar como Gabriel.
3. Entrar em `/garcom`.
4. Tocar em “Novo” > “Comanda Avulsa”:
   - não deve aparecer “Abra o caixa...”
   - a comanda deve ser criada normalmente.
5. Abrir uma mesa e criar comanda por lá:
   - mesmo comportamento, sem bloqueio.
6. Adicionar item e enviar para cozinha.
7. Finalizar/cobrar no fluxo normal:
   - a venda deve entrar em `pdv_cashier_movements` da sessão do Ederson.
8. Conferir que dono e staff visualizam os mesmos pedidos/comandas do estabelecimento.

### Fora de escopo
- Caixa simultâneo por garçom/terminal
- Redesenho do fluxo operacional do caixa
- Alterar permissões de negócio além do necessário para staff operar no caixa do estabelecimento
