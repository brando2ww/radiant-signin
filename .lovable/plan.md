

## Usar Ícones Oficiais no Hub de Integrações

### Problema
O card "WhatsApp Business" usa o ícone genérico `MessageCircle` do Lucide. O card "Delivery Próprio" usa o ícone genérico `Store`. Ambos precisam dos logos oficiais.

### Solução

**WhatsApp**: O projeto já tem o componente `WhatsAppIcon` em `src/components/icons/WhatsAppIcon.tsx` com o SVG oficial. Usar esse componente como `customIcon` (um JSX element renderizado diretamente) em vez do `fallbackIcon`.

**Delivery Próprio**: Usar o logo da Velara que já existe em `src/components/ui/logo.tsx` (importa de `src/assets/logo_velara_preto.png`). Importar e usar como `logo` (imagem).

### Mudanças na IntegrationItem interface
Adicionar campo opcional `customIcon` do tipo `React.ReactNode` para componentes JSX (como o WhatsAppIcon colorido).

### Arquivos

| Arquivo | Ação |
|---------|------|
| `src/pages/pdv/IntegrationsHub.tsx` | Importar `WhatsAppIcon` e `logo_velara_preto.png`. WhatsApp usa `customIcon: <WhatsAppIcon className="h-7 w-7 text-green-500" />`. Delivery Próprio usa `logo: velaraLogo`. Atualizar interface e renderização para suportar `customIcon`. |
| `src/pages/pdv/IntegrationDetail.tsx` | Atualizar entrada `whatsapp` para usar `WhatsAppIcon` como `fallbackIcon` customizado (renderizado com cor verde). |

