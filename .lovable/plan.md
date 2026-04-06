

## Fase 3 - Melhorar Base de Clientes (ClientsManagement)

### O que muda
Transformar a tabela simples atual em uma gestao completa com mais dados e acoes diretas, renomeando para "Base de Clientes".

### Alteracoes no arquivo `src/pages/pdv/evaluations/clients/ClientsManagement.tsx`

**Novas colunas na tabela:**
- Aniversario (de `customer_birth_date` da primeira avaliacao)
- Data de Cadastro (data da primeira avaliacao do cliente)
- Ultimo Contato (data da avaliacao mais recente)

**Botoes de acao por linha:**
- WhatsApp: link direto `wa.me` usando `formatPhoneForWhatsApp` de `@/lib/whatsapp-message`
- Detalhes: dialog/modal mostrando historico de avaliacoes do cliente (datas, NPS de cada uma, comentarios)

**Melhorias de UI:**
- Renomear titulo de "Gestao de Clientes" para "Base de Clientes"
- Adicionar icone de WhatsApp (componente `WhatsAppIcon` ja existe)
- Dialog de detalhes do cliente com timeline de avaliacoes
- Responsividade: colunas extras hidden em mobile, acoes sempre visiveis

**Dados:** Tudo ja esta disponivel no hook `useCustomerEvaluations` — `customer_birth_date`, `evaluation_date`, `created_at` — so precisa extrair na hora de agrupar no `useMemo`.

### Interface GroupedClient atualizada
```typescript
interface GroupedClient {
  name: string;
  whatsapp: string;
  birthDate: string | null;
  totalEvaluations: number;
  avgNps: number | null;
  firstEvaluation: string;   // cadastro
  lastEvaluation: string;    // ultimo contato
  npsCategory: "promoter" | "neutral" | "detractor" | "none";
  evaluations: EvaluationWithAnswers[]; // para o modal de detalhes
}
```

### Componente novo
- `ClientDetailDialog.tsx` em `src/components/pdv/evaluations/` — modal com dados do cliente e timeline de avaliacoes

