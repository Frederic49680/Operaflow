-- SCRIPT DE NETTOYAGE ULTRA SIMPLE
-- Ce script supprime toutes les données de test

-- 1. Supprimer les données de test

DELETE FROM remontee_site;
SELECT 'Remontees supprimees' as result;

DELETE FROM remontee_site_reporting;
SELECT 'Remontees reporting supprimees' as result;

DELETE FROM tache_suspensions;
SELECT 'Suspensions supprimees' as result;

DELETE FROM planning_taches;
SELECT 'Taches supprimees' as result;

DELETE FROM affaires_lots;
SELECT 'Lots supprimes' as result;

DELETE FROM affaires;
SELECT 'Affaires supprimees' as result;

DELETE FROM absences;
SELECT 'Absences supprimees' as result;

DELETE FROM plan_formation_ressource;
SELECT 'Formations supprimees' as result;

DELETE FROM formations_sessions;
SELECT 'Sessions supprimees' as result;

DELETE FROM resource_roles;
SELECT 'Roles supprimes' as result;

DELETE FROM resource_competencies;
SELECT 'Competences supprimees' as result;

DELETE FROM assignments;
SELECT 'Assignments supprimes' as result;

DELETE FROM provisional_assignments;
SELECT 'Provisoires supprimes' as result;

DELETE FROM assignment_logs;
SELECT 'Logs supprimes' as result;

DELETE FROM substitution_rules;
SELECT 'Regles supprimees' as result;

DELETE FROM resource_competency_roles;
SELECT 'Associations supprimees' as result;

DELETE FROM ressources;
SELECT 'Ressources supprimees' as result;

DELETE FROM sites;
SELECT 'Sites supprimes' as result;

DELETE FROM interactions_client;
SELECT 'Interactions supprimees' as result;

DELETE FROM affaires_interlocuteurs;
SELECT 'Affaires interlocuteurs supprimees' as result;

DELETE FROM interlocuteurs;
SELECT 'Interlocuteurs supprimes' as result;

DELETE FROM clients;
SELECT 'Clients supprimes' as result;

DELETE FROM claim_comments;
SELECT 'Comments supprimes' as result;

DELETE FROM claim_history;
SELECT 'History supprime' as result;

DELETE FROM claims;
SELECT 'Claims supprimes' as result;

-- 2. Vérification finale
SELECT 'Verification finale:' as info;
SELECT 
    (SELECT COUNT(*) FROM sites) as sites,
    (SELECT COUNT(*) FROM ressources) as ressources,
    (SELECT COUNT(*) FROM affaires) as affaires,
    (SELECT COUNT(*) FROM planning_taches) as taches,
    (SELECT COUNT(*) FROM remontee_site) as remontees;

-- 3. Message de fin
SELECT 'NETTOYAGE TERMINE' as result;
