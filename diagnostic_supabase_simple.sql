-- DIAGNOSTIC SIMPLE SUPABASE
-- Exécutez ce script dans Supabase SQL Editor

-- 1. Vérifier la connexion
SELECT 'Connexion OK' as test, current_user as utilisateur;

-- 2. Vérifier les tables principales
SELECT 'Tables existantes:' as test;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('sites', 'ressources', 'affaires', 'planning_taches', 'remontee_site')
ORDER BY table_name;

-- 3. Vérifier si la fonction delete_site_cascade existe
SELECT 'Fonction delete_site_cascade:' as test;
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'delete_site_cascade' 
AND routine_schema = 'public';

-- 4. Tester une requête simple sur sites
SELECT 'Test requête simple:' as test;
SELECT COUNT(*) as nb_sites FROM sites;

-- 5. Vérifier les données liées à un site spécifique
SELECT 'Données liées au site:' as test;
SELECT 
    'remontee_site' as table_name, 
    COUNT(*) as count 
FROM remontee_site 
WHERE site_id = 'ce082e2c-5484-45ca-a682-7d350badc08d'

UNION ALL

SELECT 
    'planning_taches' as table_name, 
    COUNT(*) as count 
FROM planning_taches 
WHERE site_id = 'ce082e2c-5484-45ca-a682-7d350badc08d'

UNION ALL

SELECT 
    'affaires' as table_name, 
    COUNT(*) as count 
FROM affaires 
WHERE site_id = 'ce082e2c-5484-45ca-a682-7d350badc08d'

UNION ALL

SELECT 
    'ressources' as table_name, 
    COUNT(*) as count 
FROM ressources 
WHERE site_id = 'ce082e2c-5484-45ca-a682-7d350badc08d';
