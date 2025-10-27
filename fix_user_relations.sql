-- Script pour corriger les relations entre les tables de gestion des utilisateurs

-- 1. Vérifier et créer les clés étrangères manquantes
DO $$
BEGIN
    -- Vérifier si la clé étrangère user_roles -> app_users existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_roles_user_id_fkey' 
        AND table_name = 'user_roles'
    ) THEN
        ALTER TABLE user_roles 
        ADD CONSTRAINT user_roles_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Clé étrangère user_roles -> app_users créée';
    ELSE
        RAISE NOTICE 'Clé étrangère user_roles -> app_users existe déjà';
    END IF;

    -- Vérifier si la clé étrangère user_roles -> roles existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_roles_role_id_fkey' 
        AND table_name = 'user_roles'
    ) THEN
        ALTER TABLE user_roles 
        ADD CONSTRAINT user_roles_role_id_fkey 
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE;
        RAISE NOTICE 'Clé étrangère user_roles -> roles créée';
    ELSE
        RAISE NOTICE 'Clé étrangère user_roles -> roles existe déjà';
    END IF;

    -- Vérifier si la clé étrangère role_permissions -> roles existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'role_permissions_role_id_fkey' 
        AND table_name = 'role_permissions'
    ) THEN
        ALTER TABLE role_permissions 
        ADD CONSTRAINT role_permissions_role_id_fkey 
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE;
        RAISE NOTICE 'Clé étrangère role_permissions -> roles créée';
    ELSE
        RAISE NOTICE 'Clé étrangère role_permissions -> roles existe déjà';
    END IF;

    -- Vérifier si la clé étrangère role_permissions -> permissions existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'role_permissions_permission_id_fkey' 
        AND table_name = 'role_permissions'
    ) THEN
        ALTER TABLE role_permissions 
        ADD CONSTRAINT role_permissions_permission_id_fkey 
        FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE;
        RAISE NOTICE 'Clé étrangère role_permissions -> permissions créée';
    ELSE
        RAISE NOTICE 'Clé étrangère role_permissions -> permissions existe déjà';
    END IF;

    -- Vérifier si la clé étrangère page_access_rules -> roles existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'page_access_rules_role_id_fkey' 
        AND table_name = 'page_access_rules'
    ) THEN
        ALTER TABLE page_access_rules 
        ADD CONSTRAINT page_access_rules_role_id_fkey 
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE;
        RAISE NOTICE 'Clé étrangère page_access_rules -> roles créée';
    ELSE
        RAISE NOTICE 'Clé étrangère page_access_rules -> roles existe déjà';
    END IF;

    -- Vérifier si la clé étrangère component_flags -> roles existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'component_flags_role_id_fkey' 
        AND table_name = 'component_flags'
    ) THEN
        ALTER TABLE component_flags 
        ADD CONSTRAINT component_flags_role_id_fkey 
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE;
        RAISE NOTICE 'Clé étrangère component_flags -> roles créée';
    ELSE
        RAISE NOTICE 'Clé étrangère component_flags -> roles existe déjà';
    END IF;

    -- Vérifier si la clé étrangère user_tokens -> app_users existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_tokens_user_id_fkey' 
        AND table_name = 'user_tokens'
    ) THEN
        ALTER TABLE user_tokens 
        ADD CONSTRAINT user_tokens_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Clé étrangère user_tokens -> app_users créée';
    ELSE
        RAISE NOTICE 'Clé étrangère user_tokens -> app_users existe déjà';
    END IF;

END $$;

-- 2. Rafraîchir le cache de schéma de Supabase
NOTIFY pgrst, 'reload schema';

-- 3. Vérifier que les relations sont bien créées
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public'
  AND tc.table_name IN ('user_roles', 'role_permissions', 'page_access_rules', 'component_flags', 'user_tokens')
ORDER BY tc.table_name, tc.constraint_name;
