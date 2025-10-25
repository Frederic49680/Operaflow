-- Script de test pour vérifier l'état des tables de gestion des utilisateurs

-- Vérifier l'existence des tables
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('app_users', 'roles', 'permissions', 'role_permissions', 'user_roles', 'page_access_rules', 'component_flags', 'user_tokens', 'audit_log') 
        THEN '✅ Existe'
        ELSE '❌ Manquante'
    END as statut
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('app_users', 'roles', 'permissions', 'role_permissions', 'user_roles', 'page_access_rules', 'component_flags', 'user_tokens', 'audit_log')
ORDER BY table_name;

-- Vérifier les colonnes de la table roles
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'roles' 
ORDER BY ordinal_position;

-- Vérifier les colonnes de la table permissions
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'permissions' 
ORDER BY ordinal_position;

-- Vérifier les colonnes de la table role_permissions
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'role_permissions' 
ORDER BY ordinal_position;

-- Compter les données dans chaque table
SELECT 'roles' as table_name, COUNT(*) as count FROM roles
UNION ALL
SELECT 'permissions' as table_name, COUNT(*) as count FROM permissions
UNION ALL
SELECT 'role_permissions' as table_name, COUNT(*) as count FROM role_permissions
UNION ALL
SELECT 'app_users' as table_name, COUNT(*) as count FROM app_users
UNION ALL
SELECT 'user_roles' as table_name, COUNT(*) as count FROM user_roles
UNION ALL
SELECT 'page_access_rules' as table_name, COUNT(*) as count FROM page_access_rules;

-- Vérifier les contraintes de clé étrangère
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
AND tc.table_name IN ('role_permissions', 'user_roles', 'page_access_rules', 'component_flags', 'user_tokens', 'audit_log')
ORDER BY tc.table_name, tc.constraint_name;
