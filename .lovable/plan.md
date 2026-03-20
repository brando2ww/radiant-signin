

## Mural de Integrações com Logos e Páginas Dedicadas

### Estrutura

Transformar `/pdv/integracoes` em uma página mural (vitrine) com cards visuais mostrando o logo de cada integração, descrição curta e botão "Acessar". Cada integração terá sua própria rota dedicada (`/pdv/integracoes/ifood`, `/pdv/integracoes/stone`, etc.) com o card de configuração completo.

### Arquivos

| Arquivo | Mudança |
|---------|---------|
| Copiar 4 logos para `src/assets/integrations/` | iFood, PagSeguro, Stone, Goomer |
| `src/pages/pdv/IntegrationsHub.tsx` | **Novo** - Mural com grid de cards visuais (logo, nome, descrição, badge status, botão "Acessar") |
| `src/pages/pdv/IntegrationDetail.tsx` | **Novo** - Página wrapper que recebe o slug da URL e renderiza o card de configuração correspondente, com botão voltar |
| `src/pages/pdv/Integrations.tsx` | Transformar em layout de rotas aninhadas (`integracoes/` → Hub, `integracoes/:slug` → Detail) |
| `src/pages/PDV.tsx` | Alterar rota de `integracoes` para `integracoes/*` para suportar sub-rotas |

### Mural (Hub)

Grid responsivo com 5 cards, cada um contendo:
- Logo da integração (imagem importada ou ícone para NF Automática que não tem logo)
- Nome e descrição curta (ex: "Receba pedidos do iFood no seu PDV")
- Badge de categoria (Delivery, Maquininha, Fiscal, Cardápio Digital)
- Botão "Acessar" que navega para `/pdv/integracoes/ifood`

### Página Dedicada (Detail)

- Header com botão voltar e nome da integração
- Renderiza o card de configuração existente (IFoodIntegrationCard, etc.) em tela cheia

### Logos

- iFood: `user-uploads://IFood_logo.svg.png` → `src/assets/integrations/ifood.png`
- PagSeguro: `user-uploads://Logonovo_pagseguro-cinza.png` → `src/assets/integrations/pagseguro.png`
- Stone: `user-uploads://Stone_pagamentos.png` → `src/assets/integrations/stone.png`
- Goomer: `user-uploads://logo.png` → `src/assets/integrations/goomer.png`
- NF Automática: usar ícone `FileText` do Lucide (sem logo enviado)

