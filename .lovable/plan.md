

## Inverter fluxo: PDV gera o token, maquininha consome

### Problema
O fluxo atual espera que o token seja gerado em outro sistema e colado aqui. O correto e o inverso: o PDV gera o token e o usuario copia para colar no sistema da maquininha.

### Novo fluxo
1. Usuario acessa Integracoes > Ativar VelaraPay
2. Se nao tem token ativo, ve um botao "Gerar codigo de ativacao"
3. Clica no botao → sistema gera token alfanumerico de 12 caracteres e insere na `pdv_device_config` com `user_id = auth.uid()`, `is_active = true`
4. Token e exibido na tela com botao "Copiar"
5. Usuario copia o token e cola no sistema da maquininha

### Arquivo alterado
**`src/components/pdv/integrations/DeviceActivationCard.tsx`** — reescrever o componente:
- Remover o formulario de input/validacao de token
- Adicionar botao "Gerar codigo de ativacao" que:
  - Gera token: `Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')`
  - Insere na tabela `pdv_device_config` via `supabase.from('pdv_device_config').insert({ user_id, activation_token })`
- Quando ja existe token ativo (verificado no `useEffect`), exibir o token com botao "Copiar" e instrucao "Cole este codigo no sistema da maquininha"
- Manter o card de status (Ativo/Nao configurado) e a exibicao de data de ativacao

### Geracao do token
```typescript
const generateToken = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 12 }, () => 
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
};
```

