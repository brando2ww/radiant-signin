

## Importar Bairros Automaticamente ao Selecionar Cidade

### Problema
Atualmente o campo de bairro é manual com autocomplete — o usuário precisa digitar um por um. O ideal é que ao selecionar a cidade, todos os bairros sejam carregados automaticamente e o usuário escolha quais atender via modal.

### Limitação técnica
Não existe API gratuita que liste todos os bairros de uma cidade brasileira. A ViaCEP só busca por nome de rua (mínimo 3 caracteres). A solução viável é fazer múltiplas buscas paralelas na ViaCEP usando termos genéricos ("Rua", "Avenida", "Travessa", "Alameda", "Estrada", "Rodovia", "Praça") para extrair o máximo de bairros únicos da cidade.

### Solução

**Fluxo do usuário:**
1. Seleciona UF → Cidade
2. Ao confirmar a cidade, abre automaticamente um **modal de seleção de bairros**
3. O modal faz buscas paralelas na ViaCEP e exibe todos os bairros encontrados com checkboxes
4. Todos vêm **marcados por padrão** — o usuário desmarca os que NÃO quer atender
5. Ao confirmar, os bairros selecionados são adicionados à lista de zonas (com taxa padrão)
6. Depois o usuário pode ajustar a taxa individual de cada bairro
7. Botão "Gerenciar bairros" permite reabrir o modal a qualquer momento

### Arquivos

**1. `src/hooks/use-ibge-lookup.ts`** — Nova função `fetchAllNeighborhoods(uf, city)`
- Faz 7 buscas paralelas na ViaCEP com termos genéricos
- Extrai valores únicos de `bairro`
- Retorna lista ordenada de strings

**2. `src/components/delivery/settings/NeighborhoodSelectorModal.tsx`** (novo)
- Dialog/modal com lista de checkboxes (todos marcados por padrão)
- Campo de busca/filtro no topo
- Botões "Selecionar todos" / "Desmarcar todos"
- Loading state enquanto busca
- Botão confirmar que retorna array de bairros selecionados

**3. `src/components/delivery/settings/DeliverySettings.tsx`**
- Ao selecionar cidade (`handleSelectCity`), abre o modal automaticamente
- Ao confirmar modal, adiciona bairros selecionados como zonas com a taxa padrão (`defaultDeliveryFee`)
- Adicionar botão "Gerenciar bairros" ao lado da badge da cidade
- Manter input manual + NeighborhoodCombobox para adicionar bairros extras que a busca não encontrou

### Estrutura do Modal

```text
┌──────────────────────────────────────┐
│  Selecionar Bairros - Farroupilha/RS │
│  ┌──────────────────────────────┐    │
│  │ 🔍 Filtrar bairros...       │    │
│  └──────────────────────────────┘    │
│  [Selecionar todos] [Desmarcar todos]│
│                                      │
│  ☑ Centro                            │
│  ☑ São Luiz                          │
│  ☑ Vila Nova                         │
│  ☐ Industrial (desmarcado)           │
│  ☑ Cinquentenário                    │
│  ...                                 │
│                                      │
│  Encontrados: 23 bairros             │
│  Selecionados: 21                    │
│                                      │
│         [Cancelar]  [Confirmar]      │
└──────────────────────────────────────┘
```

