

## Autocomplete de Bairros via ViaCEP

### Problema
O campo de bairro é um input de texto livre — não sugere bairros reais da cidade selecionada.

### Solução
Substituir o `Input` de bairro por um **Combobox com autocomplete** que busca bairros reais via ViaCEP. Quando o usuário digita 3+ caracteres, faz uma busca `viacep.com.br/ws/{UF}/{cidade}/{texto}/json/` e extrai os valores únicos do campo `bairro` dos resultados como sugestões.

### Arquivos alterados

**1. `src/hooks/use-ibge-lookup.ts`** — Nova função `searchNeighborhoods`
- Recebe `uf`, `city`, `query` (texto digitado)
- Busca ViaCEP por rua (`/ws/{UF}/{city}/{query}/json/`)
- Extrai valores únicos de `bairro` dos resultados
- Retorna lista de strings (nomes de bairros)

**2. `src/components/delivery/settings/NeighborhoodCombobox.tsx`** (novo)
- Componente com input + dropdown de sugestões
- Debounce de 400ms no input antes de buscar
- Mostra loading spinner durante busca
- Lista de bairros filtrados como opções clicáveis
- Ao selecionar, preenche o valor no input
- Permite também digitar nome manualmente (caso não encontre)

**3. `src/components/delivery/settings/DeliverySettings.tsx`**
- Substituir o `<Input placeholder="Nome do bairro">` (linha 232-235) pelo novo `<NeighborhoodCombobox>`
- Passar `uf` e `city` da cidade selecionada como props

### Fluxo do usuário
1. Seleciona cidade (já implementado)
2. Começa a digitar o nome do bairro → após 3 caracteres, aparece dropdown com sugestões reais
3. Clica na sugestão ou continua digitando manualmente
4. Define a taxa e clica em `+` para adicionar

