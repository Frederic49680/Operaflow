-- Vérifier la structure actuelle de la table roles
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'roles'
ORDER BY ordinal_position;

-- Vérifier la clé primaire
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'roles'
    AND tc.constraint_type = 'PRIMARY KEY';

-- Vérifier les données actuelles
SELECT 
    id,
    code,
    label,
    system,
    seniority_rank
FROM roles
LIMIT 20;
