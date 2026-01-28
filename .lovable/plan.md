

## Plano: Corrigir QR Code para Padroes Amarelos

### Problema Atual
O codigo atual usa:
```tsx
<div className="... bg-accent">
  <img className="... mix-blend-screen" />
</div>
```

O `bg-accent` no tema claro e uma cor muito clara (quase branca), entao o `mix-blend-screen` nao tem efeito visivel - o QR Code aparece com padrao branco/transparente.

### Solucao

Usar um fundo **amarelo solido** (`bg-yellow-400`) para que o blend mode funcione corretamente:

| Cor do Fundo | Pixel Preto do QR | Pixel Branco do QR |
|--------------|-------------------|-------------------|
| Amarelo | Vira amarelo | Permanece branco |

### Alteracao

**Arquivo:** `src/components/pdv/settings/WhatsAppQRCodeDialog.tsx`

**Linha 204 - De:**
```tsx
<div className="relative flex h-64 w-64 items-center justify-center rounded-lg border-2 border-dashed bg-accent">
```

**Para:**
```tsx
<div className="relative flex h-64 w-64 items-center justify-center rounded-lg border-2 border-dashed bg-yellow-400">
```

### Resultado Visual

| Elemento | Antes | Depois |
|----------|-------|--------|
| Fundo do container | Cor do accent (quase branco) | Amarelo (#facc15) |
| Padroes do QR | Branco/invisivel | Amarelo |
| Fundo do QR | Branco | Branco |

O `mix-blend-screen` ja esta aplicado na imagem (linha 214), entao a unica mudanca necessaria e trocar a cor de fundo do container para amarelo solido.

