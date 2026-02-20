
## Erro: "invalid input syntax for type date: ''"

### Causa Raiz

No `IngredientDialog.tsx`, o campo `expiration_date` é inicializado como `""` (string vazia):

```typescript
// Linha 262, 293, 319
expiration_date: ingredient?.expiration_date || "",
```

Quando o usuário deixa o campo em branco e clica em "Criar", o valor `""` é enviado para o Supabase, que tenta inserir uma string vazia em uma coluna do tipo `date` — e o PostgreSQL rejeita com o erro:

```
invalid input syntax for type date: ""
```

### Correção

A correção é simples: no `handleSubmit`, converter `expiration_date` de `""` para `null` antes de chamar `onSubmit`:

```typescript
// ANTES (linha 392-404):
onSubmit({
  ...data,
  // expiration_date vem como "" se vazio
});

// DEPOIS:
onSubmit({
  ...data,
  expiration_date: data.expiration_date || null,  // "" → null
});
```

Também vou corrigir os valores padrão de inicialização para ficarem consistentes, usando `null` em vez de `""`.

### Arquivo a Modificar

| Arquivo | Linhas | Mudança |
|---------|--------|---------|
| `src/components/pdv/IngredientDialog.tsx` | ~262, ~293, ~319 | Inicializar `expiration_date` como `null` em vez de `""` |
| `src/components/pdv/IngredientDialog.tsx` | ~392-404 | No `handleSubmit`, garantir `expiration_date: data.expiration_date || null` |

Correção pontual, sem impacto em outras partes do sistema.
