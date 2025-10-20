-- Script de diagnostic : Vérifier les contraintes sur la table affaires

-- 1. Voir toutes les contraintes CHECK sur la table affaires
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'affaires'::regclass
AND contype = 'c'
ORDER BY conname;

-- 2. Voir les contraintes sur la colonne statut
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'affaires'
AND tc.constraint_type = 'CHECK'
ORDER BY tc.constraint_name;

-- 3. Voir les statuts actuels dans la table affaires
SELECT 
    statut,
    COUNT(*) as nombre
FROM affaires
GROUP BY statut
ORDER BY nombre DESC;

-- 4. Voir les détails de la colonne statut
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'affaires'
AND column_name = 'statut';

