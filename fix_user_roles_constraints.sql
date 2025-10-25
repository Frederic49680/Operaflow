-- Script pour corriger les contraintes de clés étrangères de la table user_roles

-- 1. Supprimer les contraintes existantes si elles existent
ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;
ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_role_id_fkey;

-- 2. Ajouter les contraintes de clés étrangères correctes
ALTER TABLE user_roles 
ADD CONSTRAINT user_roles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE;

ALTER TABLE user_roles 
ADD CONSTRAINT user_roles_role_id_fkey 
FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE;

-- 3. Vérifier que les contraintes sont bien appliquées
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'user_roles';

-- 4. Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);

-- 5. Vérifier l'état final
SELECT 
    'user_roles' as table_name,
    COUNT(*) as total_records,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT role_id) as unique_roles
FROM user_roles;
