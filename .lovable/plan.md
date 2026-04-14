

# Cards verticais como sidebar na pagina de Checklists

Substituir as 10 tabs por uma coluna de cards retangulares na lateral esquerda, funcionando como um sidebar visual. Manter tudo na mesma pagina (sem sub-rotas), usando state para controlar a secao ativa.

## Mudanca

**Arquivo editado**: `src/pages/pdv/Tasks.tsx`

### Layout

```text
+------------------------------------------+
| Header (titulo + botoes)                 |
+--------+---------------------------------+
| Cards  |  Conteudo da secao ativa        |
| Painel |                                 |
| Check  |                                 |
| Agend  |                                 |
| Equipe |                                 |
| Hoje   |                                 |
| Config |                                 |
| Score  |                                 |
| Evid.  |                                 |
| Valid.  |                                 |
| Logs   |                                 |
+--------+---------------------------------+
```

### Implementacao

1. Remover `Tabs`/`TabsList`/`TabsTrigger`/`TabsContent` completamente
2. Usar `useState<string>("painel")` para controlar secao ativa
3. Lado esquerdo: coluna fixa (`w-56 shrink-0`) com 10 cards retangulares empilhados verticalmente, cada um com icone + label. Card ativo com fundo `bg-primary text-primary-foreground`, inativos com `bg-card hover:bg-muted`
4. Lado direito: `flex-1` renderiza o componente da secao ativa via condicional
5. Layout geral: `flex flex-row gap-4` abaixo do header, com a coluna de cards ocupando a altura total disponivel (`h-[calc(100vh-<header>)]` com `overflow-y-auto`)
6. Em mobile (`md:` breakpoint): coluna de cards vira horizontal scrollavel no topo ou colapsa em dropdown

### Icones por secao (lucide-react)

- Painel: `LayoutDashboard`
- Checklists: `ClipboardCheck`
- Agendamento: `Calendar`
- Equipe: `Users`
- Tarefas do Dia: `ListChecks`
- Configuracoes: `Settings`
- Score: `Trophy`
- Evidencias: `Camera`
- Validade: `ShieldAlert`
- Logs: `FileText`

### Arquivos

- **1 arquivo editado**: `src/pages/pdv/Tasks.tsx` (reescrever layout, remover tabs, adicionar cards laterais)
- **0 arquivos novos**
- **0 dependencias novas**

