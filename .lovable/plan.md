

## Plano: Deixar QR Code Sempre Amarelo

### Problema
O QR Code e uma imagem base64 gerada pela Evolution API e nao pode ser alterada na origem. A cor precisa ser modificada via CSS.

### Solucao
Aplicar filtros CSS na imagem para converter para tons amarelos. Como QR Codes sao preto e branco, usaremos uma tecnica de `mix-blend-mode` com um container amarelo.

---

### Alteracao

**Arquivo:** `src/components/pdv/settings/WhatsAppQRCodeDialog.tsx`

**Linha 101-119 - Modificar container e imagem do QR Code:**

De:
```tsx
<div className="relative flex h-64 w-64 items-center justify-center rounded-lg border-2 border-dashed bg-muted/50">
  {/* ... */}
  <img 
    src={`data:image/png;base64,${qrCode}`} 
    alt="QR Code WhatsApp" 
    className="h-full w-full object-contain p-2"
  />
```

Para:
```tsx
<div className="relative flex h-64 w-64 items-center justify-center rounded-lg border-2 border-dashed bg-yellow-400">
  {/* ... */}
  <img 
    src={`data:image/png;base64,${qrCode}`} 
    alt="QR Code WhatsApp" 
    className="h-full w-full object-contain p-2 mix-blend-multiply"
  />
```

### Explicacao Tecnica

- **`bg-yellow-400`**: Define o fundo amarelo no container
- **`mix-blend-multiply`**: Modo de mesclagem que multiplica as cores - as partes brancas do QR Code ficam amarelas, as partes pretas permanecem pretas

### Resultado Visual
- Fundo do QR Code: Amarelo
- Quadrados/padroes do QR Code: Preto
- O QR Code continua funcional para leitura

