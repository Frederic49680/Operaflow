-- Test de la fonction de suppression en cascade
-- D'abord, verifier qu'un site existe
SELECT id, code_site, nom FROM sites LIMIT 1;

-- Tester la fonction (remplacer l'UUID par un vrai ID de site)
-- SELECT delete_site_cascade('ce082e2c-5484-45ca-a682-7d350badc08d');

-- Pour tester sans vraiment supprimer, on peut d'abord verifier les donnees liees
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
