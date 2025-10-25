-- Migration 050: Ajouter les contraintes de clé étrangère
-- Cette migration s'exécute après que toutes les tables soient créées

-- Ajouter les contraintes FK pour role_permissions
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'role_permissions_role_id_fkey'
    ) THEN
        ALTER TABLE role_permissions 
        ADD CONSTRAINT role_permissions_role_id_fkey 
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'role_permissions_permission_id_fkey'
    ) THEN
        ALTER TABLE role_permissions 
        ADD CONSTRAINT role_permissions_permission_id_fkey 
        FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Ajouter les contraintes FK pour user_roles
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_roles_user_id_fkey'
    ) THEN
        ALTER TABLE user_roles 
        ADD CONSTRAINT user_roles_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_roles_role_id_fkey'
    ) THEN
        ALTER TABLE user_roles 
        ADD CONSTRAINT user_roles_role_id_fkey 
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Ajouter les contraintes FK pour page_access_rules
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'page_access_rules_role_id_fkey'
    ) THEN
        ALTER TABLE page_access_rules 
        ADD CONSTRAINT page_access_rules_role_id_fkey 
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Ajouter les contraintes FK pour component_flags
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'component_flags_role_id_fkey'
    ) THEN
        ALTER TABLE component_flags 
        ADD CONSTRAINT component_flags_role_id_fkey 
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Ajouter les contraintes FK pour user_tokens
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_tokens_user_id_fkey'
    ) THEN
        ALTER TABLE user_tokens 
        ADD CONSTRAINT user_tokens_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Ajouter les contraintes FK pour audit_log
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'audit_log_actor_id_fkey'
    ) THEN
        ALTER TABLE audit_log 
        ADD CONSTRAINT audit_log_actor_id_fkey 
        FOREIGN KEY (actor_id) REFERENCES app_users(id);
    END IF;
END $$;
