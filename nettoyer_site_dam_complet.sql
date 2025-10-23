-- Script de nettoyage complet pour le site "Site DAM"
-- Ce script supprime TOUTES les données liées au site

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

-- 8.1. Supprimer les formations des ressources
DELETE FROM plan_formation_ressource WHERE collaborateur_id IN (
    SELECT id FROM ressources WHERE site_id IN (
        SELECT id FROM sites WHERE nom LIKE '%DAM%' OR code_site LIKE '%DAM%'
    )
);
SELECT 'Formations des ressources supprimées' as result;

-- 8.2. Supprimer les affectations de rôles
DELETE FROM resource_roles WHERE resource_id IN (
    SELECT id FROM ressources WHERE site_id IN (
        SELECT id FROM sites WHERE nom LIKE '%DAM%' OR code_site LIKE '%DAM%'
    )
);
SELECT 'Affectations de rôles supprimées' as result;

-- 8.3. Supprimer les affectations de compétences
DELETE FROM resource_competencies WHERE resource_id IN (
    SELECT id FROM ressources WHERE site_id IN (
        SELECT id FROM sites WHERE nom LIKE '%DAM%' OR code_site LIKE '%DAM%'
    )
);
SELECT 'Affectations de compétences supprimées' as result;

-- 8.4. Supprimer les affectations confirmées
DELETE FROM assignments WHERE resource_id IN (
    SELECT id FROM ressources WHERE site_id IN (
        SELECT id FROM sites WHERE nom LIKE '%DAM%' OR code_site LIKE '%DAM%'
    )
);
SELECT 'Affectations confirmées supprimées' as result;

-- 8.5. Supprimer les affectations provisoires
DELETE FROM provisional_assignments WHERE resource_id IN (
    SELECT id FROM ressources WHERE site_id IN (
        SELECT id FROM sites WHERE nom LIKE '%DAM%' OR code_site LIKE '%DAM%'
    )
);
SELECT 'Affectations provisoires supprimées' as result;

-- 9. Supprimer les ressources
DELETE FROM ressources WHERE site_id IN (
    SELECT id FROM sites WHERE nom LIKE '%DAM%' OR code_site LIKE '%DAM%'
);
SELECT 'Ressources supprimées' as result;

-- 10. Supprimer le site lui-même
DELETE FROM sites WHERE nom LIKE '%DAM%' OR code_site LIKE '%DAM%';
SELECT 'Site DAM supprimé' as result;

-- 11. Vérification finale
SELECT 'Vérification finale:' as info;
SELECT COUNT(*) as sites_restants FROM sites WHERE nom LIKE '%DAM%' OR code_site LIKE '%DAM%';
