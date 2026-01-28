

## Plano: QR Code Amarelo sem Fundo Preto

### Problema Identificado
O filtro CSS atual usa `invert(1)` que inverte TODAS as cores:
- Fundo branco → Fundo preto (indesejado)
- Padrões pretos → Padrões amarelos (desejado)

### Solução
Usar `mix-blend-mode: screen` com container amarelo. O blend mode "screen" funciona assim:
- Branco + Amarelo = Branco (mantém o branco)
- Preto + Amarelo = Amarelo (transforma preto em amarelo)

---

### Alteração

**Arquivo:** `src/components/pdv/settings/WhatsAppQRCodeDialog.tsx`

**De:**
```tsx
<div className="... bg-white">
  <img 
    style={{ filter: 'invert(1) sepia(1) saturate(5) hue-rotate(5deg)' }}
  />
</div>
```

**Para:**
```tsx
<div className="... bg-yellow-400">
  <img 
    className="... mix-blend-screen"
    // Sem filter
  />
</div>
```

---

### Resultado Visual

| Elemento | Antes | Depois |
|----------|-------|--------|
| Fundo | Preto (invertido) | Branco |
| Padrões QR | Amarelo | Amarelo |
| Funcionalidade | OK | OK |

---

### Explicação Técnica

O `mix-blend-mode: screen` clareia a imagem baseado na cor de fundo:
- Pixels brancos do QR permanecem brancos (mais claros que amarelo)
- Pixels pretos do QR ficam amarelos (absorvem a cor do fundo)

