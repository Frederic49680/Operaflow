-- Script de nettoyage SIMPLE pour le site DAM
-- Ce script ne supprime que les tables qui existent vraiment

-- 1. Identifier le site DAM
SELECT 'Site DAM identifié:' as info;
SELECT id, nom, code_site FROM sites WHERE nom LIKE '%DAM%' OR code_site LIKE '%DAM%';

-- 2. Supprimer les remontées de site
DELETE FROM remontee_site WHERE site_id IN (
    SELECT id FROM sites WHERE nom LIKE '%DAM%' OR code_site LIKE '%DAM%'
);
SELECT 'Remontées de site supprimées' as result;

-- 3. Supprimer les remontées de reporting
DELETE FROM remontee_site_reporting WHERE site_id IN (
    SELECT id FROM sites WHERE nom LIKE '%DAM%' OR code_site LIKE '%DAM%'
);
SELECT 'Remontées de reporting supprimées' as result;

-- 4. Supprimer les suspensions de tâches
DELETE FROM tache_suspensions WHERE tache_id IN (
    SELECT id FROM planning_taches WHERE site_id IN (
        SELECT id FROM sites WHERE nom LIKE '%DAM%' OR code_site LIKE '%DAM%'
    )
);
SELECT 'Suspensions de tâches supprimées' as result;

-- 5. Supprimer les tâches de planification
DELETE FROM planning_taches WHERE site_id IN (
    SELECT id FROM sites WHERE nom LIKE '%DAM%' OR code_site LIKE '%DAM%'
);
SELECT 'Tâches de planification supprimées' as result;

-- 6. Supprimer les lots financiers des affaires
DELETE FROM affaires_lots WHERE affaire_id IN (
    SELECT id FROM affaires WHERE site_id IN (
        SELECT id FROM sites WHERE nom LIKE '%DAM%' OR code_site LIKE '%DAM%'
    )
);
SELECT 'Lots financiers supprimés' as result;

-- 7. Supprimer les affaires
DELETE FROM affaires WHERE site_id IN (
    SELECT id FROM sites WHERE nom LIKE '%DAM%' OR code_site LIKE '%DAM%'
);
SELECT 'Affaires supprimées' as result;

-- 8. Supprimer les absences des ressources
DELETE FROM absences WHERE ressource_id IN (
    SELECT id FROM ressources WHERE site_id IN (
        SELECT id FROM sites WHERE nom LIKE '%DAM%' OR code_site LIKE '%DAM%'
    )
);
SELECT 'Absences supprimées' as result;

-- 9. Supprimer les formations des ressources (si la table existe)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'plan_formation_ressource' AND table_schema = 'public') THEN
        DELETE FROM plan_formation_ressource WHERE collaborateur_id IN (
            SELECT id FROM ressources WHERE site_id IN (
                SELECT id FROM sites WHERE nom LIKE '%DAM%' OR code_site LIKE '%DAM%'
            )
        );
        RAISE NOTICE 'Formations des ressources supprimées';
    END IF;
END $$;

-- 9.1. Supprimer les sessions de formation (si la table existe)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'formations_sessions' AND table_schema = 'public') THEN
        DELETE FROM formations_sessions WHERE site_id IN (
            SELECT id FROM sites WHERE nom LIKE '%DAM%' OR code_site LIKE '%DAM%'
        );
        RAISE NOTICE 'Sessions de formation supprimées';
    END IF;
END $$;

-- 10. Supprimer les affectations de rôles (si la table existe)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'resource_roles' AND table_schema = 'public') THEN
        DELETE FROM resource_roles WHERE resource_id IN (
            SELECT id FROM ressources WHERE site_id IN (
                SELECT id FROM sites WHERE nom LIKE '%DAM%' OR code_site LIKE '%DAM%'
            )
        );
        RAISE NOTICE 'Affectations de rôles supprimées';
    END IF;
END $$;

-- 11. Supprimer les affectations de compétences (si la table existe)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'resource_competencies' AND table_schema = 'public') THEN
        DELETE FROM resource_competencies WHERE resource_id IN (
            SELECT id FROM ressources WHERE site_id IN (
                SELECT id FROM sites WHERE nom LIKE '%DAM%' OR code_site LIKE '%DAM%'
            )
        );
        RAISE NOTICE 'Affectations de compétences supprimées';
    END IF;
END $$;

-- 12. Supprimer les ressources
DELETE FROM ressources WHERE site_id IN (
    SELECT id FROM sites WHERE nom LIKE '%DAM%' OR code_site LIKE '%DAM%'
);
SELECT 'Ressources supprimées' as result;

-- 13. Supprimer le site lui-même
DELETE FROM sites WHERE nom LIKE '%DAM%' OR code_site LIKE '%DAM%';
SELECT 'Site DAM supprimé' as result;

-- 14. Vérification finale
SELECT 'Vérification finale:' as info;
SELECT COUNT(*) as sites_restants FROM sites WHERE nom LIKE '%DAM%' OR code_site LIKE '%DAM%';
