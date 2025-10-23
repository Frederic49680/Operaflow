-- SCRIPT DE NETTOYAGE SIMPLE DE LA BASE DE DONNÉES
-- Ce script supprime les données de test de manière sécurisée

-- 1. Supprimer les données de test

-- 1.1. Supprimer les remontées de site
DELETE FROM remontee_site;
SELECT 'Remontees de site supprimees' as result;

-- 1.2. Supprimer les remontées de reporting
DELETE FROM remontee_site_reporting;
SELECT 'Remontees de reporting supprimees' as result;

-- 1.3. Supprimer les suspensions de tâches
DELETE FROM tache_suspensions;
SELECT 'Suspensions de taches supprimees' as result;

-- 1.4. Supprimer les tâches de planification
DELETE FROM planning_taches;
SELECT 'Taches de planification supprimees' as result;

-- 1.5. Supprimer les lots financiers
DELETE FROM affaires_lots;
SELECT 'Lots financiers supprimes' as result;

-- 1.6. Supprimer les affaires
DELETE FROM affaires;
SELECT 'Affaires supprimees' as result;

-- 1.7. Supprimer les absences
DELETE FROM absences;
SELECT 'Absences supprimees' as result;

-- 1.8. Supprimer les formations des ressources
DELETE FROM plan_formation_ressource;
SELECT 'Formations des ressources supprimees' as result;

-- 1.9. Supprimer les sessions de formation
DELETE FROM formations_sessions;
SELECT 'Sessions de formation supprimees' as result;

-- 1.10. Supprimer les affectations de rôles
DELETE FROM resource_roles;
SELECT 'Affectations de roles supprimees' as result;

-- 1.11. Supprimer les affectations de compétences
DELETE FROM resource_competencies;
SELECT 'Affectations de competences supprimees' as result;

-- 1.12. Supprimer les affectations confirmées
DELETE FROM assignments;
SELECT 'Affectations confirmees supprimees' as result;

-- 1.13. Supprimer les affectations provisoires
DELETE FROM provisional_assignments;
SELECT 'Affectations provisoires supprimees' as result;

-- 1.14. Supprimer les logs d'affectations
DELETE FROM assignment_logs;
SELECT 'Logs d affectations supprimes' as result;

-- 1.15. Supprimer les règles de substitution
DELETE FROM substitution_rules;
SELECT 'Regles de substitution supprimees' as result;

-- 1.16. Supprimer les associations compétence-rôle
DELETE FROM resource_competency_roles;
SELECT 'Associations competence-role supprimees' as result;

-- 1.17. Supprimer les ressources
DELETE FROM ressources;
SELECT 'Ressources supprimees' as result;

-- 1.18. Supprimer les sites
DELETE FROM sites;
SELECT 'Sites supprimes' as result;

-- 1.19. Supprimer les interactions client
DELETE FROM interactions_client;
SELECT 'Interactions client supprimees' as result;

-- 1.20. Supprimer les affaires interlocuteurs
DELETE FROM affaires_interlocuteurs;
SELECT 'Affaires interlocuteurs supprimees' as result;

-- 1.21. Supprimer les interlocuteurs
DELETE FROM interlocuteurs;
SELECT 'Interlocuteurs supprimes' as result;

-- 1.22. Supprimer les clients
DELETE FROM clients;
SELECT 'Clients supprimes' as result;

-- 1.23. Supprimer les claims
DELETE FROM claim_comments;
SELECT 'Commentaires de claims supprimes' as result;

DELETE FROM claim_history;
SELECT 'Historique de claims supprime' as result;

DELETE FROM claims;
SELECT 'Claims supprimes' as result;

-- 2. Vérification finale
SELECT 'Verification finale:' as info;
SELECT 
    (SELECT COUNT(*) FROM sites) as sites_restants,
    (SELECT COUNT(*) FROM ressources) as ressources_restantes,
    (SELECT COUNT(*) FROM affaires) as affaires_restantes,
    (SELECT COUNT(*) FROM planning_taches) as taches_restantes,
    (SELECT COUNT(*) FROM remontee_site) as remontees_restantes;

-- 3. Message de fin
SELECT 'NETTOYAGE SIMPLE TERMINE' as result;
SELECT 'Les donnees de test sont supprimees' as message;
