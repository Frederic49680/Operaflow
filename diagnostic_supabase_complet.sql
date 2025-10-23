-- DIAGNOSTIC COMPLET SUPABASE
-- Ce script vérifie tous les aspects de la connexion et des permissions

-- 1. Vérifier que nous sommes connectés
SELECT 'Connexion Supabase:' as test, current_user as utilisateur, current_database() as base;

-- 2. Vérifier l'existence des tables principales
SELECT 'Tables existantes:' as test;
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('sites', 'ressources', 'affaires', 'planning_taches', 'remontee_site')
ORDER BY table_name;

-- 3. Vérifier les permissions sur la table sites
SELECT 'Permissions sur sites:' as test;
SELECT 
    grantee, 
    privilege_type, 
    is_grantable
FROM information_schema.table_privileges 
WHERE table_name = 'sites' 
AND table_schema = 'public';

-- 4. Vérifier si la fonction delete_site_cascade existe
SELECT 'Fonction delete_site_cascade:' as test;
SELECT 
    routine_name, 
    routine_type,
    data_type as return_type
FROM information_schema.routines 
WHERE routine_name = 'delete_site_cascade' 
AND routine_schema = 'public';

-- 5. Vérifier les contraintes de clés étrangères sur sites
SELECT 'Contraintes FK sur sites:' as test;
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
AND (tc.table_name = 'sites' OR ccu.table_name = 'sites');

-- 6. Vérifier les politiques RLS sur sites
SELECT 'Politiques RLS sur sites:' as test;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'sites';

-- 7. Tester une requête simple sur sites
SELECT 'Test requête simple:' as test;
SELECT COUNT(*) as nb_sites FROM sites;

-- 8. Vérifier les données liées à un site spécifique
SELECT 'Données liées au site:' as test;
WITH site_data AS (
    SELECT 'remontee_site' as table_name, COUNT(*) as count 
    FROM remontee_site 
    WHERE site_id = 'ce082e2c-5484-45ca-a682-7d350badc08d'
    
    UNION ALL
    
    SELECT 'planning_taches' as table_name, COUNT(*) as count 
    FROM planning_taches 
    WHERE site_id = 'ce082e2c-5484-45ca-a682-7d350badc08d'
    
    UNION ALL
    
    SELECT 'affaires' as table_name, COUNT(*) as count 
    FROM affaires 
    WHERE site_id = 'ce082e2c-5484-45ca-a682-7d350badc08d'
    
    UNION ALL
    
    SELECT 'ressources' as table_name, COUNT(*) as count 
    FROM ressources 
    WHERE site_id = 'ce082e2c-5484-45ca-a682-7d350badc08d'
)
SELECT * FROM site_data WHERE count > 0;
