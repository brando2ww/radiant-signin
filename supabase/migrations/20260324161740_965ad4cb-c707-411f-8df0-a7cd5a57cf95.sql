
DO $$
DECLARE
  _tenant_id uuid;
BEGIN
  -- 1. Create tenant Garibaldi
  INSERT INTO tenants (name, owner_user_id, created_by)
  VALUES ('Garibaldi', 'd9087102-9bff-491e-ac9d-8429f62b42dd', '9224e12b-acdf-43d7-9fdc-99a83331cdbc')
  RETURNING id INTO _tenant_id;

  -- 2. Link user as proprietario
  INSERT INTO establishment_users (establishment_owner_id, user_id, display_name, email, role, tenant_id)
  VALUES ('d9087102-9bff-491e-ac9d-8429f62b42dd', 'd9087102-9bff-491e-ac9d-8429f62b42dd', 'Ederson Brutti', 'edersonbrutti@gmail.com', 'proprietario', _tenant_id);

  -- 3. Activate pdv module
  INSERT INTO tenant_modules (tenant_id, module, is_active)
  VALUES (_tenant_id, 'pdv', true);
END;
$$;
