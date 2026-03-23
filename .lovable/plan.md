

## Adicionar senha de desconto e limite máximo no formulário de usuário

### O que será feito
Adicionar dois campos no card "Dados Pessoais" do `UserForm.tsx`:
1. **Senha de operador para desconto** — campo numérico (4-6 dígitos), com toggle de visibilidade
2. **Desconto máximo permitido (%)** — campo numérico de 0 a 100, default 100

Esses campos já existem no banco (`discount_password`, `max_discount_percent` na tabela `establishment_users`) e no hook `usePDVUsers` (create/update mutations). Falta apenas o formulário exibi-los.

### Arquivo

| Arquivo | Ação |
|---------|------|
| `src/pages/pdv/UserForm.tsx` | Adicionar estados `discountPassword` e `maxDiscountPercent`. Carregar valores no `useEffect` de edição. Incluir os dois campos no card de dados pessoais (abaixo do telefone). Passar os valores no `data` do `handleSubmit` |

### Detalhes

**Novos estados:**
```tsx
const [discountPassword, setDiscountPassword] = useState("");
const [maxDiscountPercent, setMaxDiscountPercent] = useState(100);
```

**No useEffect de edição** — carregar `user.discount_password` e `user.max_discount_percent`.

**No handleSubmit** — incluir `discount_password: discountPassword, max_discount_percent: maxDiscountPercent` no objeto `data`.

**Campos no formulário** (abaixo do Telefone, dentro do card "Dados Pessoais"):
- Separador visual "Autorização de Desconto"
- Input numérico para senha (maxLength 6, placeholder "0000") com toggle eye/eyeOff
- Input numérico para limite % (min 0, max 100, sufixo visual "%")

