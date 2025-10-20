-- Script pour vérifier les colonnes de la table affaires

-- 1. Voir toutes les colonnes de la table affaires
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'affaires'
ORDER BY ordinal_position;

-- 2. Voir les statuts actuels
SELECT 
    statut,
    COUNT(*) as nombre
FROM affaires
GROUP BY statut
ORDER BY nombre DESC;

-- 3. Voir les contraintes CHECK
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'affaires'::regclass
AND contype = 'c'
ORDER BY conname;

