

## Tornar NF Automática 100% Funcional + Campos Completos da API

### Problema
O `NFAutomaticaIntegrationCard` usa apenas `useState` local. Nada é persistido. Quando a integração com a Nuvem Fiscal for ativada, precisa dos dados da empresa (certificado, CNPJ, IE, IM, razão social, regime, ambiente, etc.) salvos no banco.

### Campos da API Nuvem Fiscal que precisam ser configuráveis

A Nuvem Fiscal exige o cadastro completo da empresa. Além dos campos que já existem no card, precisamos adicionar:

| Campo | Descrição | Já existe em `pdv_settings`? |
|-------|-----------|------------------------------|
| CNPJ | Identificação fiscal | Sim (`business_cnpj`) |
| Razão Social | Nome oficial | Sim (`business_name`) |
| Inscrição Estadual | IE para NF-e | Sim (`state_registration`) |
| Inscrição Municipal | IM para NFS-e | Novo |
| Nome Fantasia | Nome comercial | Novo |
| Endereço completo (logradouro, numero, bairro, cidade, UF, CEP) | Endereço fiscal | Novo (JSONB) |
| Regime Tributário | Simples/Presumido/Real/MEI | Sim (`tax_regime`) |
| Certificado Digital A1 | Arquivo .pfx | Novo (URL no storage) |
| Senha do Certificado | Para uso na API | Novo |
| Série da NF-e | Número de série | Novo |
| Série da NFC-e | Série para cupom fiscal | Novo |
| Número inicial NF-e | Sequência da nota | Novo |
| CFOP Padrão | Código fiscal operação | Novo |
| Ambiente | Produção ou Homologação | Novo |
| CST/CSOSN padrão | Código tributário | Novo |
| Alíquota ICMS padrão | Percentual ICMS | Novo |
| Alíquota PIS/COFINS | Percentuais | Novo |
| Emitir NF auto ao fechar venda | Toggle | Novo |
| Enviar NF por email ao cliente | Toggle | Novo |
| Habilitar NFC-e | Toggle para cupom fiscal | Novo |

### Mudanças

| Arquivo | Acao |
|---------|------|
| Migration SQL | Adicionar ~15 colunas fiscais em `pdv_settings` + criar bucket `certificates` |
| `src/hooks/use-pdv-settings.ts` | Adicionar campos na interface |
| `src/components/pdv/integrations/NFAutomaticaIntegrationCard.tsx` | Reescrever: conectar ao `usePDVSettings`, upload real do certificado, organizar em seções (Empresa, Certificado, Dados Fiscais, Tributação, Automação) |
| `src/integrations/supabase/types.ts` | Atualizar tipos (automático) |

### Colunas novas em `pdv_settings`

```sql
-- Dados da empresa (complementares)
nfe_inscricao_municipal TEXT,
nfe_nome_fantasia TEXT,
nfe_endereco_fiscal JSONB, -- {logradouro, numero, complemento, bairro, cidade, uf, cep, codigo_municipio}

-- Certificado digital
nfe_certificate_url TEXT,
nfe_certificate_password TEXT,

-- Configurações NF-e
nfe_serie TEXT DEFAULT '1',
nfe_serie_nfce TEXT DEFAULT '1',
nfe_numero_inicial INTEGER DEFAULT 1,
nfe_cfop_padrao TEXT DEFAULT '5102',
nfe_ambiente TEXT DEFAULT 'homologacao', -- homologacao | producao

-- Tributação padrão
nfe_cst_csosn TEXT DEFAULT '102',
nfe_aliquota_icms NUMERIC(5,2) DEFAULT 0,
nfe_aliquota_pis NUMERIC(5,2) DEFAULT 0,
nfe_aliquota_cofins NUMERIC(5,2) DEFAULT 0,

-- Automação
nfe_auto_emit BOOLEAN DEFAULT false,
nfe_email_customer BOOLEAN DEFAULT true,
nfe_enable_nfce BOOLEAN DEFAULT false
```

### Storage
Criar bucket `certificates` (privado) para upload do arquivo `.pfx`.

### UI — Componente reorganizado em seções

```text
┌─────────────────────────────────────────────────────┐
│ [FileText] NF Automática               [Configurado]│
├─────────────────────────────────────────────────────┤
│                                                     │
│ ── CERTIFICADO DIGITAL ──                           │
│ [Upload .pfx]  ou  ✅ Certificado carregado [Trocar]│
│ Senha: [********]                                   │
│                                                     │
│ ── DADOS DA EMPRESA ──                              │
│ Razão Social: [____________] (pré-preenche)         │
│ Nome Fantasia: [____________]                       │
│ CNPJ: [____________] (pré-preenche)                 │
│ IE: [____________] (pré-preenche)                   │
│ IM: [____________]                                  │
│                                                     │
│ ── ENDEREÇO FISCAL ──                               │
│ Logradouro: [____________]  Nº: [___]               │
│ Complemento: [____________]                         │
│ Bairro: [____________]  Cidade: [____________]      │
│ UF: [__]  CEP: [________]  Cód. Município: [____]  │
│                                                     │
│ ── CONFIGURAÇÃO FISCAL ──                           │
│ Regime Tributário: [Simples Nacional ▼]             │
│ Ambiente: [Homologação ▼]                           │
│ Série NF-e: [1]    Série NFC-e: [1]                │
│ Nº Inicial: [1]    CFOP Padrão: [5102]             │
│                                                     │
│ ── TRIBUTAÇÃO PADRÃO ──                             │
│ CST/CSOSN: [102]                                    │
│ Alíq. ICMS: [0.00%]                                │
│ Alíq. PIS: [0.00%]   Alíq. COFINS: [0.00%]        │
│                                                     │
│ ── AUTOMAÇÃO ──                                     │
│ Emitir NF ao fechar venda        [OFF]              │
│ Enviar NF por email ao cliente   [ON]               │
│ Habilitar NFC-e (cupom fiscal)   [OFF]              │
│                                                     │
│              [Salvar Configuração]                   │
└─────────────────────────────────────────────────────┘
```

Todos os campos inicializam com valores do banco via `usePDVSettings`. O upload do certificado usa Supabase Storage. O botão salva tudo via `updateSettings`.

