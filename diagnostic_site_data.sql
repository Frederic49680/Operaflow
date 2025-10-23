-- Diagnostic des données liées à un site
-- Remplacez l'UUID par l'ID du site que vous voulez supprimer
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
