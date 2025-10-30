-- Vérifier l'état actuel de la table roles et ses utilisations

-- 1. Structure de la table roles
SELECT 
    'Structure' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'roles'
ORDER BY ordinal_position;

-- 2. Clé primaire
SELECT 
    'Clé primaire' as info,
    kcu.column_name as pk_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'roles' 
    AND tc.constraint_type = 'PRIMARY KEY';

-- 3. Données actuelles (échantillon)
SELECT 
    'Données actuelles' as info,
    code,
    label,
    system,
    seniority_rank
FROM roles
LIMIT 15;

-- 4. Vérifier les tables qui référencent roles
SELECT 
    'Tables référençant roles' as info,
    tc.table_name,
    kcu.column_name as fk_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name IN ('user_roles', 'role_permissions', 'page_access_rules', 'component_flags', 
                          'resource_roles', 'assignments', 'substitution_rules', 'provisional_assignments')
ORDER BY tc.table_name;
