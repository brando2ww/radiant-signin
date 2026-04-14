

# Configurar Credenciais Nuvem Fiscal

A API da Nuvem Fiscal usa OAuth2 (client credentials). O edge function atual espera um token estatico (`NFE_API_KEY`), mas precisa ser atualizado para obter um access token dinamicamente usando Client ID + Client Secret.

## Passo 1: Armazenar secrets

Dois novos secrets no Supabase:
- `NUVEM_FISCAL_CLIENT_ID` = `zpgceFUo6GfhAPVODigc`
- `NUVEM_FISCAL_CLIENT_SECRET` = `fyjPAjsvqT7vUemVFvu0OlD3VM2JdmlRpsrDb997`

## Passo 2: Atualizar edge function `fetch-nfe-automatica`

Substituir o uso de `NFE_API_KEY` por fluxo OAuth2:

1. Ler `NUVEM_FISCAL_CLIENT_ID` e `NUVEM_FISCAL_CLIENT_SECRET` do ambiente
2. Fazer POST para `https://auth.nuvemfiscal.com.br/oauth/token` com `grant_type=client_credentials` para obter access token
3. Usar o access token retornado como Bearer nas chamadas da API de distribuicao
4. Remover referencia ao antigo `NFE_API_KEY`

## Detalhes tecnicos

O fluxo OAuth2 client credentials:
```
POST https://auth.nuvemfiscal.com.br/oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials&client_id=...&client_secret=...&scope=empresa nfe
```

Retorna `{ access_token, token_type, expires_in }`. O token e usado como Bearer header nas chamadas subsequentes.

## Resumo

- **2 secrets novos** (client ID + secret)
- **1 arquivo editado** (fetch-nfe-automatica/index.ts)
- **0 arquivos novos**

