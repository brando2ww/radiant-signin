

## Plano: QR Code Amarelo com Fundo Branco

### Problema
A implementacao anterior deixou o fundo amarelo e o QR code preto. O usuario quer o inverso: fundo branco e o QR code (os padroes/quadrados) em amarelo.

### Solucao
Usar filtros CSS para transformar as partes pretas do QR Code em amarelo, mantendo o fundo branco.

---

### Tecnica CSS

Aplicar uma combinacao de filtros CSS que converte preto em amarelo:
- `invert(1)`: Inverte preto para branco e branco para preto
- `sepia(1)`: Aplica tom sepia
- `saturate(5)`: Aumenta saturacao
- `hue-rotate(5deg)`: Ajusta matiz para amarelo puro

---

### Alteracao

**Arquivo:** `src/components/pdv/settings/WhatsAppQRCodeDialog.tsx`

**Container do QR Code:**
```tsx
// De:
<div className="... bg-yellow-400">

// Para:
<div className="... bg-white">
```

**Imagem do QR Code:**
```tsx
// De:
<img className="... mix-blend-multiply" />

// Para:
<img 
  className="h-full w-full object-contain p-2"
  style={{ filter: 'invert(1) sepia(1) saturate(5) hue-rotate(5deg)' }}
/>
```

---

### Resultado Visual

| Elemento | Cor |
|----------|-----|
| Fundo do container | Branco |
| Padroes do QR Code | Amarelo |
| QR Code funcional | Sim |

