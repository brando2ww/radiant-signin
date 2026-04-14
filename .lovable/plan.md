

# Sidebar com container visual delimitado

Pelo desenho, voce quer que os cards de navegacao fiquem dentro de um container com borda visivel na lateral esquerda, ocupando toda a altura disponivel (do header ate o fim da pagina), como uma "caixa" delimitada.

## Mudanca

**Arquivo editado**: `src/pages/pdv/Tasks.tsx`

1. Envolver a `nav` desktop em um container com borda (`border rounded-lg bg-card p-2`) que ocupe a altura total disponivel
2. Usar `min-h-[calc(100vh-12rem)]` para o container do sidebar esticar ate o fim da pagina
3. Os botoes internos perdem a borda individual (ficam sem `border`) -- a borda fica no container externo
4. Manter o layout `flex flex-row gap-4` existente, apenas adicionar o wrapper visual

### Resultado visual

```text
+------------------------------------------+
| Header (titulo + botoes)                 |
+------------+-----------------------------+
| ┌────────┐ |  Conteudo da secao ativa    |
| │ Painel │ |                             |
| │ Check  │ |                             |
| │ Agend  │ |                             |
| │ Equipe │ |                             |
| │ Hoje   │ |                             |
| │ Config │ |                             |
| │ Score  │ |                             |
| │ Evid.  │ |                             |
| │ Valid.  │ |                             |
| │ Logs   │ |                             |
| └────────┘ |                             |
+------------+-----------------------------+
```

### Detalhes

- Container externo: `rounded-lg border bg-card p-2 min-h-[calc(100vh-12rem)]`
- Botoes internos: sem `border`, com `rounded-md` e padding menor
- Item ativo: `bg-primary text-primary-foreground`
- Itens inativos: `hover:bg-muted text-card-foreground`
- 1 arquivo editado, 0 novos, 0 dependencias

