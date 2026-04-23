

## Corrigir "Cannot coerce the result to a single JSON object" ao abrir mesa

### Diagnóstico

O erro acontece em `usePDVTables.updateTable`. O Supabase JS retorna esse erro quando `.single()` recebe **0 ou >1 linhas**. O `UPDATE` em `pdv_tables` é executado pelo papel garçom — a policy de UPDATE provavelmente passa (via `is_establishment_member`), mas a cláusula `RETURNING` aplica a policy de **SELECT**, que pode não estar liberando a linha de volta para o garçom (ou está liberando mas a linha já foi modificada por outra requisição na corrida).

Resultado: o `UPDATE` na verdade funciona no banco, mas o cliente recebe um erro 406 (`PGRST116`), exibe o toast vermelho, faz rollback otimista da UI e o fluxo de "abrir comanda" trava em "Abrindo comanda...".

### Correção

**1. `src/hooks/use-pdv-tables.ts` — `updateTable`**

Trocar `.single()` por `.maybeSingle()` e devolver um fallback `{ id, ...updates }` quando o retorno vier vazio. Isso desacopla o sucesso do mutation da capacidade do cliente de reler a linha — o que importa é o `UPDATE` ter ido sem erro.

```ts
const { data, error } = await supabase
  .from("pdv_tables")
  .update(updates)
  .eq("id", id)
  .select()
  .maybeSingle();

if (error) throw error;
return data ?? { id, ...updates };
```

**2. `GarcomMesaDetalhe.tsx` — não bloquear no resultado do updateTable**

Hoje o `useEffect` aguarda `updateTable` via `onSettled` antes de criar a comanda. Se o update der erro (mesmo que tenha funcionado no banco), `ensuringRef` fica travado e a tela fica em "Abrindo comanda…". Ajustes:

- Tornar o `updateTable` "fire-and-forget" no efeito (ou ignorar erro dele) — a criação da comanda + navegação não dependem do retorno da mesa.
- Resetar `ensuringRef.current = false` também no caminho de erro do `createComanda`, para permitir nova tentativa quando o usuário voltar à tela.

**3. (Opcional, defensivo) Verificar policies de SELECT em `pdv_tables`**

Se a policy de SELECT do garçom não inclui `is_establishment_member(user_id)`, adicionar. Sem isso, garçom nunca consegue ler a mesa de volta após o update, mesmo com o fallback acima funcionando — o que afeta também o refresh da grid.

> Vou inspecionar as policies depois da aprovação. Se faltar a policy de SELECT, incluo numa migration curta. Se já estiver lá, só os passos 1 e 2 resolvem o erro visível.

### Validação

1. Logado como garçom, tocar em mesa livre → não aparece o toast vermelho → cai direto na comanda.
2. Adicionar item → volta → mesma comanda aberta, mesa marcada como "Ocupada" na grid.
3. Conferir banco: `pdv_tables.status = 'ocupada'` e `current_order_id` preenchido.
4. Repetir com mesa que já tem comanda → redireciona direto, sem erro.

### Fora de escopo

- Realtime cross-device.
- Refatoração do PDV web (`Salon.tsx`).

