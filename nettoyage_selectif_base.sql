-- SCRIPT DE NETTOYAGE SÉLECTIF DE LA BASE DE DONNÉES
-- Ce script supprime les données de test mais garde les données essentielles

-- 1. Supprimer les données de test et de développement

-- 1.1. Supprimer les remontées de site
DELETE FROM remontee_site;
SELECT 'Remontées de site supprimées' as result;

-- 1.2. Supprimer les remontées de reporting
DELETE FROM remontee_site_reporting;
SELECT 'Remontées de reporting supprimées' as result;

-- 1.3. Supprimer les suspensions de tâches
DELETE FROM tache_suspensions;
SELECT 'Suspensions de tâches supprimées' as result;

-- 1.4. Supprimer les tâches de planification
DELETE FROM planning_taches;
SELECT 'Tâches de planification supprimées' as result;

-- 1.5. Supprimer les lots financiers
DELETE FROM affaires_lots;
SELECT 'Lots financiers supprimés' as result;

-- 1.6. Supprimer les affaires
DELETE FROM affaires;
SELECT 'Affaires supprimées' as result;

-- 1.7. Supprimer les absences
DELETE FROM absences;
SELECT 'Absences supprimées' as result;

-- 1.8. Supprimer les formations des ressources
DELETE FROM plan_formation_ressource;
SELECT 'Formations des ressources supprimées' as result;

-- 1.9. Supprimer les sessions de formation
DELETE FROM formations_sessions;
SELECT 'Sessions de formation supprimées' as result;

-- 1.10. Supprimer les affectations de rôles
DELETE FROM resource_roles;
SELECT 'Affectations de rôles supprimées' as result;

-- 1.11. Supprimer les affectations de compétences
DELETE FROM resource_competencies;
SELECT 'Affectations de compétences supprimées' as result;

-- 1.12. Supprimer les affectations confirmées
DELETE FROM assignments;
SELECT 'Affectations confirmées supprimées' as result;

-- 1.13. Supprimer les affectations provisoires
DELETE FROM provisional_assignments;
SELECT 'Affectations provisoires supprimées' as result;

-- 1.14. Supprimer les logs d'affectations
DELETE FROM assignment_logs;
SELECT 'Logs d affectations supprimés' as result;

-- 1.15. Supprimer les règles de substitution
DELETE FROM substitution_rules;
SELECT 'Règles de substitution supprimées' as result;

-- 1.16. Supprimer les associations compétence-rôle
DELETE FROM resource_competency_roles;
SELECT 'Associations compétence-rôle supprimées' as result;

-- 1.17. Supprimer les ressources
DELETE FROM ressources;
SELECT 'Ressources supprimées' as result;

-- 1.18. Supprimer les sites
DELETE FROM sites;
SELECT 'Sites supprimés' as result;

-- 1.19. Supprimer les interactions client
DELETE FROM interactions_client;
SELECT 'Interactions client supprimées' as result;

-- 1.20. Supprimer les affaires interlocuteurs
DELETE FROM affaires_interlocuteurs;
SELECT 'Affaires interlocuteurs supprimées' as result;

-- 1.21. Supprimer les interlocuteurs
DELETE FROM interlocuteurs;
SELECT 'Interlocuteurs supprimés' as result;

-- 1.22. Supprimer les clients
DELETE FROM clients;
SELECT 'Clients supprimés' as result;

-- 1.23. Supprimer les claims
DELETE FROM claim_comments;
SELECT 'Commentaires de claims supprimés' as result;

DELETE FROM claim_history;
SELECT 'Historique de claims supprimé' as result;

DELETE FROM claims;
SELECT 'Claims supprimés' as result;

-- 2. GARDER les données essentielles (rôles, compétences)

-- 2.1. Vérifier les rôles restants
SELECT 'Roles conserves:' as info;
SELECT code, label FROM roles;

-- 2.2. Vérifier les compétences restantes
SELECT 'Competences conservees:' as info;
SELECT code, label FROM competencies;

-- 3. Vérification finale
SELECT 'Verification finale:' as info;
SELECT 
    (SELECT COUNT(*) FROM sites) as sites_restants,
    (SELECT COUNT(*) FROM ressources) as ressources_restantes,
    (SELECT COUNT(*) FROM affaires) as affaires_restantes,
    (SELECT COUNT(*) FROM planning_taches) as taches_restantes,
    (SELECT COUNT(*) FROM remontee_site) as remontees_restantes,
    (SELECT COUNT(*) FROM roles) as roles_restants,
    (SELECT COUNT(*) FROM competencies) as competences_restantes;

-- 4. Message de fin
SELECT 'NETTOYAGE SELECTIF TERMINE' as result;
SELECT 'Les donnees de test sont supprimees, les donnees essentielles sont conservees' as message;
