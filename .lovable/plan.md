

## Fase 4 - Melhorar Aniversariantes

### O que muda
Enriquecer a pagina `ClientsBirthdays.tsx` com mais dados, acoes diretas (WhatsApp, detalhes, bonus), e busca.

### Alteracoes em `src/pages/pdv/evaluations/clients/ClientsBirthdays.tsx`

**Interface BirthdayClient ampliada:**
```typescript
interface BirthdayClient {
  name: string;
  whatsapp: string;
  birthDate: string;
  age: number;
  daysUntil: number;
  firstEvaluation: string;  // data cadastro
  lastEvaluation: string;   // ultimo contato
  evaluations: EvaluationWithAnswers[];
}
```

**Novas colunas na tabela:**
- Data de Cadastro (primeira avaliacao)
- Ultimo Contato (avaliacao mais recente)

**Botoes de acao por linha:**
- WhatsApp: link `wa.me` usando `formatPhoneForWhatsApp`
- Detalhes: reutiliza `ClientDetailDialog` ja criado na Fase 3 (com historico de avaliacoes)

**Melhorias de UI:**
- Campo de busca por nome/telefone
- Colunas de Cadastro e Ultimo Contato com `hidden md:table-cell` para responsividade
- Coluna de acoes sempre visivel com botoes compactos

**Dados:** Expandir o `useMemo` para guardar `firstEvaluation`, `lastEvaluation` e `evaluations[]` ao agrupar por whatsapp — mesmo pattern usado no `ClientsManagement`.

### Arquivos editados
1. `src/pages/pdv/evaluations/clients/ClientsBirthdays.tsx` — reescrever com novos dados e acoes

### Nao inclui nesta fase
- Modal de gerar bonus/cupom (requer logica de selecionar campanha/premio — fica para fase futura se necessario)

