

## Criar Tenant "Garibaldi" para usuário existente

O usuário `edersonbrutti@gmail.com` (ID: `d9087102-9bff-491e-ac9d-8429f62b42dd`) já existe no auth mas não tem tenant nem registro em `establishment_users`.

### Ação

Executar uma migration que:

1. **Cria o tenant** "Garibaldi" com `owner_user_id` apontando para o usuário existente
2. **Cria o registro em `establishment_users`** com role `proprietario`
3. **Ativa o módulo `pdv`** (padrão dos outros tenants)

Nenhum dado existente será alterado ou removido.

```sql
-- 1. Criar tenant
INSERT INTO tenants (name, owner_user_id, created_by)
VALUES ('Garibaldi', 'd9087102-9bff-491e-ac9d-8429f62b42dd', '9224e12b-acdf-43d7-9fdc-99a83331cdbc')
RETURNING id;

-- 2. Criar establishment_users (usando o id retornado)
INSERT INTO establishment_users (establishment_owner_id, user_id, display_name, email, role, tenant_id)
VALUES ('d9087102-...', 'd9087102-...', 'Ederson Brutti', 'edersonbrutti@gmail.com', 'proprietario', <tenant_id>);

-- 3. Ativar módulo pdv
INSERT INTO tenant_modules (tenant_id, module, is_active)
VALUES (<tenant_id>, 'pdv', true);
```

Será feito via migration com subconsulta para capturar o `tenant_id` automaticamente.

