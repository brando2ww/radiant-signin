

# Sidebar real na pagina de Checklists

O usuario quer que o menu ocupe a lateral esquerda inteira, do header ate o fim da pagina, como um sidebar verdadeiro -- nao contido dentro do `container` do conteudo.

## Problema atual

O sidebar esta dentro de `<div className="container mx-auto p-4 md:p-6">`, entao ele fica limitado ao container central com padding. Na imagem de referencia, a area vermelha mostra o sidebar colado na borda esquerda da pagina, sem padding, do topo ao fundo.

## Solucao

**Arquivo editado**: `src/pages/pdv/Tasks.tsx`

Reestruturar o layout para que o sidebar fique **fora** do container:

```text
+----------------------------------------------------------+
| Header (dentro do container, com padding)                |
+----------+-----------------------------------------------+
|          |                                               |
| Sidebar  |  container mx-auto p-4                        |
| border-r |  (conteudo da secao ativa)                    |
| w-52     |                                               |
| sem pad  |                                               |
| esquerdo |                                               |
|          |                                               |
|          |                                               |
|          |                                               |
|          |                                               |
+----------+-----------------------------------------------+
```

### Mudancas

1. Trocar o wrapper raiz de `<div className="container mx-auto p-4">` por um layout `flex`:
   - Wrapper externo: `<div className="flex min-h-[calc(100vh-3.5rem)]">`
   - Sidebar: `<nav className="hidden md:flex flex-col w-52 shrink-0 border-r bg-card p-3">` -- sem `rounded-lg`, com `border-r` em vez de `border` (colado na borda esquerda)
   - Conteudo: `<div className="flex-1 overflow-auto p-4 md:p-6">` -- o padding fica so no conteudo

2. O header (`ResponsivePageHeader`) fica dentro da area de conteudo (lado direito), nao no topo geral

3. Mobile: manter scroll horizontal no topo do conteudo (sem mudanca)

4. Remover `rounded-lg` e `border` do sidebar, usar apenas `border-r` para dar o efeito de barra lateral continua

### Resultado

- Sidebar colado na esquerda, altura total, com `border-r` separando do conteudo
- Conteudo com padding proprio
- Visual identico a area vermelha do desenho

### Detalhes

- 1 arquivo editado: `src/pages/pdv/Tasks.tsx`
- 0 arquivos novos, 0 dependencias

