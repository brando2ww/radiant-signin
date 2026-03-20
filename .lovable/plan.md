

## Bottom Tab Bar: Centralizar FAB + Adicionar aba "Itens"

### Mudança
Atualmente são 4 colunas (Mesas, Comandas, Novo, Cozinha). O "Novo" não fica exatamente no centro. Para centralizar, passar para **5 colunas**:

```text
  Mesas   Comandas   (+)   Itens   Cozinha
```

### Nova aba "Itens"
Tela `/garcom/itens` que mostra o catálogo de produtos (usando `usePDVProducts`) com:
- Navegação por categorias (horizontal)
- Cards com imagem, nome, preço
- Ao tocar num item, abre detalhe com botão "Adicionar em Comanda/Mesa"
- O botão abre o mesmo `NewOrderSheet` para escolher destino

### Arquivos

| Arquivo | Ação |
|---------|------|
| `src/components/garcom/BottomTabBar.tsx` | Mudar para `grid-cols-5`, adicionar tab "Itens" com ícone `UtensilsCrossed` após o FAB |
| `src/pages/garcom/GarcomItens.tsx` | **Criar** — Catálogo de produtos mobile com categorias, busca, cards com imagem/preço |
| `src/pages/garcom/GarcomItemDetalhe.tsx` | **Criar** — Detalhe do produto com imagem, descrição, preços, botão "Adicionar" que abre sheet de destino |
| `src/pages/Garcom.tsx` | Adicionar rotas `itens` e `itens/:id` |
| `src/App.tsx` | Sem mudança (rotas já são wildcard `/garcom/*`) |

