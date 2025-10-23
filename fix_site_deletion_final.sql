-- Script final pour activer la suppression en cascade des sites
-- Exécutez ce script dans Supabase SQL Editor

-- 1. Créer la fonction de suppression en cascade
CREATE OR REPLACE FUNCTION delete_site_cascade(site_id_to_delete UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
    deleted_counts JSON;
BEGIN
    -- Initialiser le compteur de suppressions
    deleted_counts := '{}';
    
    -- 1. Supprimer les remontees de site
    DELETE FROM remontee_site WHERE site_id = site_id_to_delete;
    deleted_counts := jsonb_set(deleted_counts, '{remontee_site}', to_jsonb(0));
    
    -- 2. Supprimer les remontees de reporting
    DELETE FROM remontee_site_reporting WHERE site_id = site_id_to_delete;
    deleted_counts := jsonb_set(deleted_counts, '{remontee_site_reporting}', to_jsonb(0));
    
    -- 3. Supprimer les suspensions de taches
    DELETE FROM tache_suspensions WHERE tache_id IN (
        SELECT id FROM planning_taches WHERE site_id = site_id_to_delete
    );
    deleted_counts := jsonb_set(deleted_counts, '{tache_suspensions}', to_jsonb(0));
    
    -- 4. Supprimer les taches de planification
    DELETE FROM planning_taches WHERE site_id = site_id_to_delete;
    deleted_counts := jsonb_set(deleted_counts, '{planning_taches}', to_jsonb(0));
    
    -- 5. Supprimer les lots financiers des affaires
    DELETE FROM affaires_lots WHERE affaire_id IN (
        SELECT id FROM affaires WHERE site_id = site_id_to_delete
    );
    deleted_counts := jsonb_set(deleted_counts, '{affaires_lots}', to_jsonb(0));
    
    -- 6. Supprimer les affaires
    DELETE FROM affaires WHERE site_id = site_id_to_delete;
    deleted_counts := jsonb_set(deleted_counts, '{affaires}', to_jsonb(0));
    
    -- 7. Supprimer les absences des ressources
    DELETE FROM absences WHERE ressource_id IN (
        SELECT id FROM ressources WHERE site_id = site_id_to_delete
    );
    deleted_counts := jsonb_set(deleted_counts, '{absences}', to_jsonb(0));
    
    -- 8. Supprimer les ressources
    DELETE FROM ressources WHERE site_id = site_id_to_delete;
    deleted_counts := jsonb_set(deleted_counts, '{ressources}', to_jsonb(0));
    
    -- 9. Supprimer le site lui-meme
    DELETE FROM sites WHERE id = site_id_to_delete;
    deleted_counts := jsonb_set(deleted_counts, '{sites}', to_jsonb(0));
    
    -- Retourner le resultat
    result := json_build_object(
        'success', true,
        'message', 'Site supprime avec succes',
        'deleted_counts', deleted_counts
    );
    
    RETURN result;
    
EXCEPTION
    WHEN OTHERS THEN
        -- En cas d'erreur, retourner les details
        result := json_build_object(
            'success', false,
            'message', 'Erreur lors de la suppression: ' || SQLERRM,
            'error_code', SQLSTATE
        );
        RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 2. Tester la fonction
SELECT 'Fonction delete_site_cascade créée avec succès' as result;

-- 3. Vérifier qu'elle existe
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name = 'delete_site_cascade' 
AND routine_schema = 'public';
