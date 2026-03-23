

## Refatorar página pública de avaliação — tudo em uma página só

### O que muda
Remover o fluxo step-by-step e mostrar tudo em uma única página com scroll suave: dados do cliente, todas as perguntas de avaliação, e o NPS — tudo visível de uma vez. Manter a tela de "done" (obrigado) após envio.

### Layout

```text
┌──────────────────────────────────────┐
│         [Logo]                       │
│    Nome da Campanha                  │
│    Mensagem de boas-vindas           │
├──────────────────────────────────────┤
│  📋 Seus Dados                       │
│  Nome ___________                    │
│  Telefone ___________                │
│  Data de Nascimento ___________      │
├──────────────────────────────────────┤
│  ⭐ Avaliação                        │
│                                      │
│  1. Como foi o atendimento?          │
│     ★ ★ ★ ★ ★                       │
│     [comentário se ≤2]               │
│                                      │
│  2. Como está a limpeza?             │
│     ★ ★ ★ ★ ★                       │
│                                      │
│  3. Você voltaria aqui?              │
│     ★ ★ ★ ★ ★                       │
├──────────────────────────────────────┤
│  📊 Recomendação (NPS)               │
│  De 0 a 10, indicaria para um amigo?│
│  [0][1][2]...[9][10]                │
├──────────────────────────────────────┤
│  [ Enviar Avaliação ]                │
└──────────────────────────────────────┘
```

### Mudanças

| Arquivo | Ação |
|---------|------|
| `src/pages/PublicEvaluation.tsx` | Reescrever removendo steps/progress. Renderizar formulário completo em seções com cards. Validar tudo antes de habilitar botão de envio |

### Detalhes
- Remover state `step`, `currentQuestionIdx`, funções `goNext/goPrev`, `Progress`
- Manter states: `name`, `phone`, `birthDate`, `answers`, `npsScore` e estado `done` (boolean)
- Seções em cards separados com títulos: "Seus Dados", cada pergunta listada, "Recomendação"
- Botão "Enviar" habilitado só quando: nome preenchido, telefone válido, data preenchida, todas as perguntas com score > 0, NPS selecionado
- Manter campo de comentário condicional (score ≤ 2)
- Manter tela de agradecimento após envio
- Largura max `max-w-lg` para boa leitura, espaçamento generoso entre seções

