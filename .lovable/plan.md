

## Fase 5 - Melhorar Prêmios Emitidos (CouponsManagement)

### O que muda
Transformar a tabela atual em uma gestao completa com acoes diretas, preview visual do cupom, validacao inline, WhatsApp, exportacao CSV e filtro por status.

### Alteracoes em `src/pages/pdv/evaluations/coupons/CouponsManagement.tsx`

**Renomear titulo:** "Gestao de Cupons" -> "Premios Emitidos"

**Novo filtro por status:** Select com opcoes "Todos", "Ativo", "Resgatado", "Expirado" ao lado do filtro de campanha.

**Coluna "Data Utilizacao":** Mostrar `redeemed_at` formatado quando resgatado, ou "-" quando nao.

**Botoes de acao por linha (nova coluna Acoes):**
- WhatsApp: link `wa.me` usando `formatPhoneForWhatsApp` + `WhatsAppIcon`
- Validar/Resgatar: botao que chama `useRedeemCoupon` (so aparece se status = Ativo)
- Preview: abre modal com visual do cupom (codigo, premio, validade, cliente) + botao de copiar codigo
- Deletar: confirmacao + delete

**Exportar CSV:** Botao no header que gera CSV com todos os dados filtrados (codigo, cliente, whatsapp, premio, campanha, status, data criacao, validade, data utilizacao).

**Novo componente:** `CouponPreviewDialog.tsx` em `src/components/pdv/evaluations/` — modal com visual estilizado do cupom mostrando codigo grande, premio, validade, nome do cliente, e botao "Copiar Codigo".

### Arquivos
1. `src/pages/pdv/evaluations/coupons/CouponsManagement.tsx` — reescrever com acoes e filtros
2. `src/components/pdv/evaluations/CouponPreviewDialog.tsx` — novo componente de preview

