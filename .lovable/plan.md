
## Plano: Usar Nome da Conexão Diretamente como Instance Name

### Problema Atual
O código atual gera o nome da instância assim:
```typescript
// Linha 54-64 de use-whatsapp-connection.ts
const generateInstanceName = (connectionName: string) => {
  const slug = connectionName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 20);
  return `velara-${user.id.slice(0, 8)}-${slug}`;  // ← Problema aqui
};
```

Resultado: `velara-a0f02206-loja-1` (feio e técnico)

O usuário quer que apareça como as outras instâncias na Evolution API: `VELARA MEI`, `DINCONNECT`, etc. (nome limpo e legível).

---

### Solucao

Mudar a função `generateInstanceName` para usar o nome da conexão diretamente, apenas formatando para ser um identificador válido:

| Antes | Depois |
|-------|--------|
| `velara-a0f02206-loja-1` | `Loja 1` |
| `velara-a0f02206-restaurante-centro` | `Restaurante Centro` |

---

### Alteracao

**Arquivo:** `src/hooks/use-whatsapp-connection.ts`

**De:**
```typescript
const generateInstanceName = (connectionName: string) => {
  if (!user) return '';
  const slug = connectionName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 20);
  return `velara-${user.id.slice(0, 8)}-${slug}`;
};
```

**Para:**
```typescript
const generateInstanceName = (connectionName: string) => {
  if (!user) return '';
  // Usar o nome da conexão diretamente, apenas removendo caracteres especiais inválidos
  // A Evolution API aceita espaços e letras maiúsculas no instanceName
  return connectionName
    .trim()
    .replace(/[^\w\s-]/g, '')  // Remove apenas caracteres especiais (mantém letras, números, espaços e hífens)
    .slice(0, 50);  // Limita o tamanho
};
```

---

### Resultado Esperado

| Nome digitado pelo usuário | Instance Name na Evolution |
|---------------------------|---------------------------|
| `Loja 1` | `Loja 1` |
| `Restaurante Centro` | `Restaurante Centro` |
| `WhatsApp Vendas` | `WhatsApp Vendas` |

O nome aparecerá exatamente como o usuário digitou no painel da Evolution API.

---

### Observacao

Se a Evolution API não aceitar espaços no nome (dependendo da versão), podemos usar uma alternativa com MAIÚSCULAS e sem espaços:

```typescript
return connectionName
  .trim()
  .toUpperCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^A-Z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 50);
```

Isso transformaria "Loja Principal" em "LOJA-PRINCIPAL" (similar ao estilo "DINCONNECT").
