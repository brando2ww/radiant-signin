# Corrigir contagem e listagem de "Não Iniciados"

## Diagnóstico

No banco, hoje existem **3 checklists em `em_andamento` + 1 `concluido`**, mas o painel mostra "Não Iniciados: 0". Dois problemas:

1. **Métrica errada após remoção do card "Em Andamento":** o hook conta apenas `pendente`/`nao_iniciado` no card "Não Iniciados". Como o card "Em Andamento" foi removido em iteração anterior, os 3 checklists `em_andamento` ficaram invisíveis no painel — o usuário os enxerga como "não iniciados ainda" porque ninguém os finalizou.
2. **Dialog filtra status fixo `"nao_iniciado"`:** mesmo se a métrica fosse correta, o dialog ignora `pendente` e `em_andamento`.

## Solução

Tratar como **"Pendentes do dia"** tudo que ainda não foi concluído nem caiu em atraso: `pendente`, `nao_iniciado` e `em_andamento`.

### Mudanças

1. `src/hooks/use-checklist-dashboard.ts` (linha 36)
   - Incluir `em_andamento` no cálculo de `naoIniciado`.

2. `src/components/pdv/checklists/CompletedExecutionsDialog.tsx`
   - Quando `status === "nao_iniciado"`, trocar o `.eq("status", ...)` por `.in("status", ["pendente", "nao_iniciado", "em_andamento"])`.
   - Renderizar badge dinâmica por linha ("Não iniciado" / "Em andamento") usando `exec.status`.
   - Manter ordenação por `created_at`.

3. (Opcional, sem alteração de label) Renomear o título da métrica de "Não Iniciados" para "Pendentes" — **NÃO** será feito agora para não introduzir mudança visual sem pedido explícito.

Sem alterações de banco.
