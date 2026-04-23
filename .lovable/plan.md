

## Bottom menu do garçom estilo "FloatingNav"

Substituir a barra fixa atual por uma navegação flutuante em pílula, com indicador deslizante animado (igual ao componente fornecido), mantendo as 5 ações já existentes do app de garçom.

### O que muda visualmente

- Some a barra de borda superior fixa colada ao rodapé.
- No lugar entra uma **pílula flutuante centralizada**, com fundo `bg-white/80 dark:bg-gray-900/80`, `backdrop-blur`, sombra grande e bordas arredondadas (`rounded-full`).
- Um **indicador animado** (faixa clara com sombra interna) desliza por baixo do item ativo conforme o usuário navega — usando `framer-motion` com `layout`/spring.
- Cada item exibe ícone + label embaixo. Em telas muito pequenas as labels somem (`hidden sm:inline`), igual ao componente de referência.
- Ativo fica em `text-primary`, inativos em `text-gray-600 dark:text-gray-300`.
- Posicionamento: `fixed bottom-4 left-1/2 -translate-x-1/2 z-50`, respeitando `safe-area-inset-bottom`.

### Itens da barra (preservados)

Mantém exatamente as 5 entradas atuais, na mesma ordem, com o "Novo" no centro como destaque (botão circular sobressaindo da pílula, disparando `onNewComanda`):

1. Mesas → `/garcom`
2. Comandas → `/garcom/comandas`
3. **Novo** (FAB central, sem rota — abre o sheet)
4. Itens → `/garcom/itens`
5. Cozinha → `/garcom/cozinha`

O indicador deslizante percorre apenas os 4 itens de navegação (pula o FAB central).

### Arquivos

- **Editado** `src/components/garcom/BottomTabBar.tsx`
  - Reescrito para o layout flutuante em pílula.
  - Usa `framer-motion` (`motion.div` com `layoutId` para o indicador deslizante; alternativa equivalente: refs + `useEffect` medindo `getBoundingClientRect`, idêntico ao snippet de referência).
  - Active state derivado de `useLocation()` (mesma lógica atual: `end` para `/garcom`, `startsWith` para os demais).
  - Botão central "Novo" continua chamando `onNewComanda` recebido via props.
  - Mantém `safe-area-bottom` para iPhone.

- **Editado** `src/pages/Garcom.tsx`
  - Adiciona `pb-28` (ou similar) ao container raiz para o conteúdo das páginas não ficar atrás da pílula flutuante.

### Detalhes técnicos

- `framer-motion@^12` e `lucide-react` já estão no `package.json`, sem novas dependências.
- O componente da biblioteca (`floating-nav.tsx`) traz ícones inexistentes para o nosso domínio (Home/Search/Bell/etc.) — vamos reusar **apenas o estilo/estrutura**, com nossos ícones já em uso (`LayoutGrid`, `ClipboardList`, `Plus`, `UtensilsCrossed`, `ChefHat`).
- Não vamos criar `src/components/ui/floating-nav.tsx` separado, porque o BottomTabBar do garçom tem um requisito específico (FAB central + integração com rotas + callback `onNewComanda`) que tornaria um wrapper genérico mais frágil. A estética fica 1:1 com o exemplo.
- `GarcomActionFab` (canto inferior direito, tema/sair/gerente) continua intacto e segue por cima da pílula com `z-50` próprio.

### Como o usuário valida

1. Abrir `/garcom` em mobile e desktop: a pílula aparece flutuando no rodapé centralizada.
2. Navegar entre Mesas/Comandas/Itens/Cozinha: o indicador desliza suavemente para o item ativo.
3. Tocar "Novo" no centro: abre o sheet de novo pedido (comportamento atual preservado).
4. Em telas estreitas as labels somem e ficam só os ícones.
5. Em iPhone, a pílula fica acima do gesture bar.

