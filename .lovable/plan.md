

## Plano: exigir caixa aberto para criar comanda

### Regra
Criar comanda (avulsa ou vinculada a mesa) só é permitido se houver sessão de caixa ativa. Caso contrário, exibir `toast.error("Abra o caixa antes de criar uma comanda")` e bloquear a ação.

O Salão (`Salon.tsx`) já implementa essa verificação. Falta aplicar nos demais pontos de criação.

### Correções

**1. `src/pages/pdv/Comandas.tsx`**
- Importar `usePDVCashier` e obter `activeSession`
- No `handleCreateComanda`, verificar `if (!activeSession)` antes de prosseguir — se não houver sessão, exibir toast e retornar
- No botão "Nova Comanda" (que abre `setCreateDialogOpen(true)`), aplicar a mesma verificação antes de abrir o dialog

**2. `src/pages/Garcom.tsx`**
- Importar `usePDVCashier` e obter `activeSession`
- Em `handleSelectComandaAvulsa`, verificar `if (!activeSession)` antes de abrir o `ComandaDialog`
- Em `handleSelectMesa`, manter livre (navegar para mesas é apenas visualização)

**3. `src/pages/garcom/GarcomMesaDetalhe.tsx`**
- Importar `usePDVCashier` e obter `activeSession`
- Em `handleNewComanda`, verificar `if (!activeSession)` antes de criar

### Arquivos
- **Editado:** `src/pages/pdv/Comandas.tsx`
- **Editado:** `src/pages/Garcom.tsx`
- **Editado:** `src/pages/garcom/GarcomMesaDetalhe.tsx`

