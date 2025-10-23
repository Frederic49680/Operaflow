-- Test de la fonction de suppression en cascade d'un site
-- Remplacez l'UUID par l'ID du site que vous voulez tester

-- 1. Vérifier les données liées AVANT suppression
SELECT 'Données liées au site AVANT suppression:' as info;

WITH site_data AS (
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
    WHERE site_id = 'ce082e2c-5484-45ca-a682-7d350badc08d'
    
    UNION ALL
    
    SELECT 
        'absences' as table_name, 
        COUNT(*) as count 
    FROM absences 
    WHERE ressource_id IN (
        SELECT id FROM ressources WHERE site_id = 'ce082e2c-5484-45ca-a682-7d350badc08d'
    )
)
SELECT * FROM site_data WHERE count > 0;

-- 2. Tester la fonction de suppression
SELECT 'Test de la fonction delete_site_cascade:' as info;
SELECT delete_site_cascade('ce082e2c-5484-45ca-a682-7d350badc08d'::UUID);

-- 3. Vérifier que le site a bien été supprimé
SELECT 'Vérification après suppression:' as info;
SELECT COUNT(*) as sites_restants FROM sites WHERE id = 'ce082e2c-5484-45ca-a682-7d350badc08d';
