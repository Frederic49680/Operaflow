-- Migration pour créer l'utilisateur admin dans Supabase Auth
-- Cette migration utilise la fonction admin pour créer l'utilisateur

-- Créer une fonction temporaire pour créer l'utilisateur admin
CREATE OR REPLACE FUNCTION create_admin_user()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Vérifier si l'utilisateur existe déjà dans auth.users
  IF EXISTS (
    SELECT 1 FROM auth.users 
    WHERE email = 'admin@operaflow.com'
  ) THEN
    RETURN 'Utilisateur admin existe déjà dans auth.users';
  END IF;
  
  -- Créer l'utilisateur dans auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@operaflow.com',
    crypt('Admin123!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  ) RETURNING id INTO v_user_id;
  
  -- Mettre à jour app_users avec l'auth_id
  UPDATE app_users 
  SET auth_id = v_user_id
  WHERE email = 'admin@operaflow.com';
  
  RETURN 'Utilisateur admin créé avec succès: ' || v_user_id;
END;
$$;

-- Exécuter la fonction
SELECT create_admin_user();

-- Nettoyer la fonction temporaire
DROP FUNCTION create_admin_user();
