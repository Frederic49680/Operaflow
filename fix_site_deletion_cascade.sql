-- Fonction pour supprimer un site avec toutes ses données liées
CREATE OR REPLACE FUNCTION delete_site_cascade(site_id_to_delete UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
    site_name TEXT;
BEGIN
    -- Récupérer le nom du site avant suppression
    SELECT nom INTO site_name FROM sites WHERE id = site_id_to_delete;
    
    -- Supprimer dans l'ordre pour respecter les contraintes FK
    -- 1. Supprimer les remontées de site
    DELETE FROM remontee_site WHERE site_id = site_id_to_delete;
    
    -- 2. Supprimer les tâches de planification
    DELETE FROM planning_taches WHERE site_id = site_id_to_delete;
    
    -- 3. Supprimer les lots d'affaires liés au site
    DELETE FROM affaires_lots WHERE affaire_id IN (
        SELECT id FROM affaires WHERE site_id = site_id_to_delete
    );
    
    -- 4. Supprimer les affaires du site
    DELETE FROM affaires WHERE site_id = site_id_to_delete;
    
    -- 5. Supprimer les absences liées aux ressources du site
    DELETE FROM absences WHERE ressource_id IN (
        SELECT id FROM ressources WHERE site = (
            SELECT code_site FROM sites WHERE id = site_id_to_delete
        )
    );
    
    -- 6. Supprimer les affectations de ressources
    DELETE FROM taches_ressources WHERE ressource_id IN (
        SELECT id FROM ressources WHERE site = (
            SELECT code_site FROM sites WHERE id = site_id_to_delete
        )
    );
    
    -- 7. Supprimer les ressources du site
    DELETE FROM ressources WHERE site = (
        SELECT code_site FROM sites WHERE id = site_id_to_delete
    );
    
    -- 8. Supprimer les interlocuteurs liés aux affaires du site
    DELETE FROM affaires_interlocuteurs WHERE affaire_id IN (
        SELECT id FROM affaires WHERE site_id = site_id_to_delete
    );
    
    -- 9. Supprimer les interactions client liées
    DELETE FROM interactions_client WHERE affaire_id IN (
        SELECT id FROM affaires WHERE site_id = site_id_to_delete
    );
    
    -- 10. Supprimer les claims liés aux affaires du site
    DELETE FROM claims WHERE site_id = site_id_to_delete;
    
    -- 11. Supprimer les suspensions de tâches
    DELETE FROM tache_suspensions WHERE tache_id IN (
        SELECT id FROM planning_taches WHERE site_id = site_id_to_delete
    );
    
    -- 12. Supprimer les remontées de reporting
    DELETE FROM remontee_site_reporting WHERE site_id = site_id_to_delete;
    
    -- 13. Supprimer les batteries de maintenance
    DELETE FROM maintenance_batteries WHERE site_id = site_id_to_delete;
    
    -- 14. Supprimer le journal de maintenance
    DELETE FROM maintenance_journal WHERE site_id = site_id_to_delete;
    
    -- 15. Supprimer les digest mensuels
    DELETE FROM maintenance_monthly_digest WHERE site_id = site_id_to_delete;
    
    -- 16. Supprimer les formations liées aux ressources
    DELETE FROM plan_formation_ressource WHERE collaborateur_id IN (
        SELECT id FROM ressources WHERE site = (
            SELECT code_site FROM sites WHERE id = site_id_to_delete
        )
    );
    
    -- 17. Supprimer les sessions de formation
    DELETE FROM formations_sessions WHERE site_id = site_id_to_delete;
    
    -- 18. Supprimer les affectations de rôles
    DELETE FROM resource_roles WHERE resource_id IN (
        SELECT id FROM ressources WHERE site = (
            SELECT code_site FROM sites WHERE id = site_id_to_delete
        )
    );
    
    -- 19. Supprimer les affectations de compétences
    DELETE FROM resource_competencies WHERE resource_id IN (
        SELECT id FROM ressources WHERE site = (
            SELECT code_site FROM sites WHERE id = site_id_to_delete
        )
    );
    
    -- 20. Supprimer les affectations confirmées
    DELETE FROM assignments WHERE resource_id IN (
        SELECT id FROM ressources WHERE site = (
            SELECT code_site FROM sites WHERE id = site_id_to_delete
        )
    );
    
    -- 21. Supprimer les affectations provisoires
    DELETE FROM provisional_assignments WHERE resource_id IN (
        SELECT id FROM ressources WHERE site = (
            SELECT code_site FROM sites WHERE id = site_id_to_delete
        )
    );
    
    -- 22. Supprimer les logs d'affectation
    DELETE FROM assignment_logs WHERE resource_id IN (
        SELECT id FROM ressources WHERE site = (
            SELECT code_site FROM sites WHERE id = site_id_to_delete
        )
    );
    
    -- 23. Supprimer les règles de substitution
    DELETE FROM substitution_rules WHERE can_play_role IN (
        SELECT id FROM ressources WHERE site = (
            SELECT code_site FROM sites WHERE id = site_id_to_delete
        )
    ) OR when_missing_role IN (
        SELECT id FROM ressources WHERE site = (
            SELECT code_site FROM sites WHERE id = site_id_to_delete
        )
    );
    
    -- 24. Supprimer les relations compétence-rôle
    DELETE FROM resource_competency_roles WHERE resource_id IN (
        SELECT id FROM ressources WHERE site = (
            SELECT code_site FROM sites WHERE id = site_id_to_delete
        )
    );
    
    -- 25. Supprimer les alertes liées au site
    DELETE FROM alerts WHERE site_id = site_id_to_delete;
    
    -- 26. Supprimer les historiques d'actions
    DELETE FROM historique_actions WHERE entity_id = site_id_to_delete;
    
    -- 27. Enfin, supprimer le site lui-même
    DELETE FROM sites WHERE id = site_id_to_delete;
    
    -- Retourner un résultat de succès
    result := json_build_object(
        'success', true,
        'message', 'Site "' || COALESCE(site_name, 'inconnu') || '" et toutes ses données liées supprimés avec succès',
        'deleted_site', site_name
    );
    
    RETURN result;
    
EXCEPTION
    WHEN OTHERS THEN
        -- En cas d'erreur, retourner les détails
        result := json_build_object(
            'success', false,
            'error', SQLERRM,
            'message', 'Erreur lors de la suppression du site'
        );
        RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Donner les permissions d'exécution
GRANT EXECUTE ON FUNCTION delete_site_cascade(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_site_cascade(UUID) TO anon;
