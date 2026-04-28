# Melhorar UX da divisão das categorias no cardápio

## Problema

Na tela `/pdv/delivery/menu` os produtos "sumiram" porque todas as categorias começam fechadas (accordion com `openCategoryIds = []`). Os contadores na imagem (2, 6, 5, 4, 5, 0) confirmam que os produtos existem no banco — só não estão visíveis. Além disso, as categorias ficam todas coladas no topo sem separação visual clara.

## O que será feito

### 1. Produtos visíveis por padrão
Abrir todas as categorias automaticamente no primeiro carregamento (`useEffect` que popula `openCategoryIds` com todos os IDs assim que `categories` chega). O usuário continua podendo recolher manualmente o que quiser.

### 2. Cabeçalho de categoria sticky
Quando o usuário rola o cardápio, o nome da categoria atual fica fixo no topo (`sticky top-14`, abaixo do header de 3.5rem da app). Assim você sempre sabe em qual seção está, mesmo numa categoria longa como Sushi Express.

### 3. Separação visual clara entre categorias
- Espaçamento entre seções aumenta de `space-y-3` para `space-y-6`.
- Cada seção ganha `rounded-lg` + `overflow-hidden` para um cartão mais "fechado".
- Cabeçalho com fundo `bg-card` e `border-b` separando do conteúdo, título em `text-lg` para hierarquia mais forte.
- Mantém os tokens do design system (sem cores customizadas, conforme a memória do projeto).

### 4. Pequeno polimento
- `scroll-mt-20` em cada `AccordionItem` para que, no futuro, links/âncoras de categoria parem na posição certa abaixo do header.

## Arquivos afetados

- `src/components/delivery/MenuTab.tsx` — único arquivo alterado. Sem mudança de banco, sem novas dependências.
