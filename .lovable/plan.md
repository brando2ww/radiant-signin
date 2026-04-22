

## Melhorar UX da seleção de opções no garçom (mobile-first)

### Problemas no estado atual
- Cards das opções (Vodka / Cachaça) têm radios pequenos, área de toque apertada — ruim para mão de garçom em movimento.
- Estado "selecionado" não tem destaque visual (mesma borda neutra em ambos).
- Cabeçalho "Acompanhamento + Obrigatório" parece um aviso de erro, não um título claro.
- Botões "Voltar" e "Continuar" ocupam o mesmo peso visual; "Continuar" deveria dominar.
- Sheet sobe pouco e deixa muito espaço vazio acima dependendo do conteúdo.
- Sem feedback do total à medida que a pessoa escolhe (especialmente quando há `+R$`).
- Sem barra de progresso quando há vários grupos (ex.: Tamanho → Acompanhamento → Adicionais).

### Solução

Criar uma versão mobile do seletor (`MobileProductOptionSelector`) usada **apenas** dentro do Sheet do garçom. O `ProductOptionSelector` do PDV (desktop) não muda.

**Componente novo:** `src/components/garcom/MobileProductOptionSelector.tsx`

Mesmo contrato de props (`options`, `onConfirm`, `onBack`) e tipos do `SelectedOption` reusados de `@/components/pdv/ProductOptionSelector`.

#### Padrões visuais
- **Cards grandes e tocáveis**: `min-h-14`, `rounded-xl`, padding generoso, ícone de check à direita quando selecionado, sem usar componente `RadioGroup`/`Checkbox` do shadcn (evita radios visuais minúsculos).
- **Estado selecionado**:
  - `border-primary bg-primary/10`
  - Ícone de `Check` (lucide) à direita em primary
  - Card não selecionado: `border-border bg-card`
- **Single (radio)**: 1 toque já seleciona (e desseleciona o anterior).
- **Multiple (checkbox)**: toque alterna; mostra contador `2 de 3` no cabeçalho do grupo quando há `max_selections`.
- **Cabeçalho do grupo**:
  - Nome em `text-base font-semibold`
  - Pílula `Obrigatório` com `bg-destructive/10 text-destructive` (não vermelho sólido — não parece erro)
  - Subtítulo em `text-xs text-muted-foreground`: "Escolha 1" / "Escolha até N" / "Escolha de X a Y"
- **Preço extra por item**: alinhado à direita, antes do check, em `text-sm tabular-nums text-muted-foreground` (`+ R$ 2,00`). Itens sem ajuste não mostram nada.
- **Indicação de produto vinculado**: badge sutil `Produto` substituída por ícone `Package` pequeno em `text-muted-foreground` (menos poluição).

#### Layout do Sheet quando em "options"
```
┌──────────────────────────────────────┐
│  Caipira Cremosa            [×]      │  ← header do Sheet
│  R$ 24,00 + R$ 2,00                  │  ← preço base + extras vivos
├──────────────────────────────────────┤
│  ① de ② · Acompanhamento             │  ← progresso quando há >1 grupo
│  Escolha 1            [Obrigatório]  │
│                                       │
│  ┌────────────────────────────────┐  │
│  │ ✓ Vodka              + R$ 2,00 │  │  ← selecionado: borda primary
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │   Cachaça                       │  │
│  └────────────────────────────────┘  │
│                                       │
├──────────────────────────────────────┤
│  [ Voltar ]   [ Continuar · R$ 26 ]  │  ← Continuar = primary, peso 2
└──────────────────────────────────────┘
```

- Footer dos botões fica **sticky** no rodapé do `SheetContent` (`sticky bottom-0 bg-background pt-3 -mx-4 px-4 border-t`), com `safe-area-bottom`.
- "Continuar" mostra o total parcial ao vivo: `Continuar · R$ {(base + extras).toFixed(2)}` enquanto houver seleção válida.
- Quando inválido (faltando obrigatório), botão fica desabilitado e o subtítulo do grupo pendente muda para `text-destructive` ("Escolha 1").

#### Progresso entre grupos
- Acima do grupo atual: `<div className="text-xs text-muted-foreground">Etapa {i+1} de {options.length}</div>` (só renderiza se houver mais de 1 grupo).
- Os grupos já preenchidos rolam acima naturalmente (continuam visíveis e editáveis), mas com fundo `bg-muted/30` para indicar "concluído".

#### Sheet
Em `GarcomAdicionarItem.tsx`, no passo `options`:
- Trocar `<ProductOptionSelector ... />` por `<MobileProductOptionSelector ... />`.
- `SheetContent`: aumentar para `max-h-[92vh]`, manter `overflow-y-auto` e adicionar `pb-0` (o footer interno cuida do espaçamento).

### Microinterações
- Toque com `active:scale-[0.98]` em cada card de opção.
- Transição leve no estado: `transition-colors`.
- Quando selecionado em "single", efeito de check entra com `transition-opacity`.

### Acessibilidade
- Cada card é `<button type="button">` com `aria-pressed` indicando estado.
- `aria-required` no contêiner do grupo quando obrigatório.
- Tamanho mínimo de toque ≥ 44px (target HIG).

### Fora de escopo
- Mudar o seletor do PDV desktop (`ProductOptionSelector.tsx`).
- Imagens nos itens de opção (não há campo de imagem em `pdv_product_option_items` hoje).
- Drag-to-resize do Sheet.
- Persistir as escolhas em tabelas próprias do item (continua indo como texto em `notes` + soma em `unitPrice` — fora do escopo desta iteração de UX).

