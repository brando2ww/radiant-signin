

## Plano: traduzir dias da semana no gráfico "Taxa de Conclusão (7 dias)"

### Causa
Em `src/hooks/use-checklist-dashboard.ts` (linha 57), o label do eixo X é gerado com:
```ts
const label = format(d, "EEE");
```
Sem locale, `date-fns` retorna em inglês (Tue, Wed, Thu...).

### Mudança
Em `src/hooks/use-checklist-dashboard.ts`:
1. Importar `ptBR`:
   ```ts
   import { ptBR } from "date-fns/locale";
   ```
2. Passar locale no `format`:
   ```ts
   const label = format(d, "EEE", { locale: ptBR });
   ```
3. Aplicar `.replace(".", "")` e capitalizar (opcional, para "Seg", "Ter" no lugar de "seg.").

### Resultado
Eixo X passa a mostrar: Seg, Ter, Qua, Qui, Sex, Sáb, Dom.

### Arquivo
- `src/hooks/use-checklist-dashboard.ts` — adicionar import `ptBR` e passar `{ locale: ptBR }` no `format`.

