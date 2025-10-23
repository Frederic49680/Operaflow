-- SCRIPT DE NETTOYAGE COMPLET DE LA BASE DE DONNÉES
-- ⚠️ ATTENTION : Ce script supprime TOUTES les données !
-- Utilisez uniquement pour remettre la base en condition réelle

-- 1. Désactiver temporairement les contraintes FK
SET session_replication_role = replica;

-- 2. Supprimer toutes les données dans l'ordre correct

-- 2.1. Supprimer les remontées de site
DELETE FROM remontee_site;
SELECT 'Remontées de site supprimées' as result;

-- 2.2. Supprimer les remontées de reporting
DELETE FROM remontee_site_reporting;
SELECT 'Remontées de reporting supprimées' as result;

-- 2.3. Supprimer les suspensions de tâches
DELETE FROM tache_suspensions;
SELECT 'Suspensions de tâches supprimées' as result;

-- 2.4. Supprimer les tâches de planification
DELETE FROM planning_taches;
SELECT 'Tâches de planification supprimées' as result;

-- 2.5. Supprimer les lots financiers
DELETE FROM affaires_lots;
SELECT 'Lots financiers supprimés' as result;

-- 2.6. Supprimer les affaires
DELETE FROM affaires;
SELECT 'Affaires supprimées' as result;

-- 2.7. Supprimer les absences
DELETE FROM absences;
SELECT 'Absences supprimées' as result;

-- 2.8. Supprimer les formations des ressources
DELETE FROM plan_formation_ressource;
SELECT 'Formations des ressources supprimées' as result;

-- 2.9. Supprimer les sessions de formation
DELETE FROM formations_sessions;
SELECT 'Sessions de formation supprimées' as result;

-- 2.10. Supprimer les affectations de rôles
DELETE FROM resource_roles;
SELECT 'Affectations de rôles supprimées' as result;

-- 2.11. Supprimer les affectations de compétences
DELETE FROM resource_competencies;
SELECT 'Affectations de compétences supprimées' as result;

-- 2.12. Supprimer les affectations confirmées
DELETE FROM assignments;
SELECT 'Affectations confirmées supprimées' as result;

-- 2.13. Supprimer les affectations provisoires
DELETE FROM provisional_assignments;
SELECT 'Affectations provisoires supprimées' as result;

-- 2.14. Supprimer les logs d'affectations
DELETE FROM assignment_logs;
SELECT 'Logs d affectations supprimés' as result;

-- 2.15. Supprimer les règles de substitution
DELETE FROM substitution_rules;
SELECT 'Règles de substitution supprimées' as result;

-- 2.16. Supprimer les associations compétence-rôle
DELETE FROM resource_competency_roles;
SELECT 'Associations compétence-rôle supprimées' as result;

-- 2.17. Supprimer les ressources
DELETE FROM ressources;
SELECT 'Ressources supprimées' as result;

-- 2.18. Supprimer les sites
DELETE FROM sites;
SELECT 'Sites supprimés' as result;

-- 2.19. Supprimer les clients et interlocuteurs
DELETE FROM interactions_client;
SELECT 'Interactions client supprimées' as result;

DELETE FROM affaires_interlocuteurs;
SELECT 'Affaires interlocuteurs supprimées' as result;

DELETE FROM interlocuteurs;
SELECT 'Interlocuteurs supprimés' as result;

DELETE FROM clients;
SELECT 'Clients supprimés' as result;

-- 2.20. Supprimer les claims
DELETE FROM claim_comments;
SELECT 'Commentaires de claims supprimés' as result;

DELETE FROM claim_history;
SELECT 'Historique de claims supprimé' as result;

DELETE FROM claims;
SELECT 'Claims supprimés' as result;

-- 2.21. Supprimer les rôles et compétences
DELETE FROM roles;
SELECT 'Rôles supprimés' as result;

DELETE FROM competencies;
SELECT 'Compétences supprimées' as result;

-- 2.22. Supprimer les formations
DELETE FROM formations_tarifs;
SELECT 'Tarifs de formations supprimés' as result;

DELETE FROM formations_sessions;
SELECT 'Sessions de formations supprimées' as result;

DELETE FROM formations_catalogue;
SELECT 'Catalogue de formations supprimé' as result;

DELETE FROM organismes_formation;
SELECT 'Organismes de formation supprimés' as result;

-- 2.23. Supprimer les utilisateurs (garder les admins)
DELETE FROM app_users WHERE email NOT LIKE '%admin%';
SELECT 'Utilisateurs non-admin supprimés' as result;

-- 3. Réactiver les contraintes FK
SET session_replication_role = DEFAULT;

-- 4. Vérification finale
SELECT 'Vérification finale:' as info;
SELECT 
    (SELECT COUNT(*) FROM sites) as sites_restants,
    (SELECT COUNT(*) FROM ressources) as ressources_restantes,
    (SELECT COUNT(*) FROM affaires) as affaires_restantes,
    (SELECT COUNT(*) FROM planning_taches) as taches_restantes,
    (SELECT COUNT(*) FROM remontee_site) as remontees_restantes;

-- 5. Message de fin
SELECT '🎉 NETTOYAGE COMPLET TERMINÉ' as result;
SELECT 'La base de données est maintenant en condition réelle' as message;
