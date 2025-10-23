-- Script de nettoyage COMPLET de tous les sites
-- ATTENTION : Ce script supprime TOUTES les données !

-- 1. Supprimer toutes les remontées
DELETE FROM remontee_site;
SELECT 'Toutes les remontées supprimées' as result;

-- 2. Supprimer toutes les remontées de reporting
DELETE FROM remontee_site_reporting;
SELECT 'Toutes les remontées de reporting supprimées' as result;

-- 3. Supprimer toutes les suspensions
DELETE FROM tache_suspensions;
SELECT 'Toutes les suspensions supprimées' as result;

-- 4. Supprimer toutes les tâches
DELETE FROM planning_taches;
SELECT 'Toutes les tâches supprimées' as result;

-- 5. Supprimer tous les lots financiers
DELETE FROM affaires_lots;
SELECT 'Tous les lots financiers supprimés' as result;

-- 6. Supprimer toutes les affaires
DELETE FROM affaires;
SELECT 'Toutes les affaires supprimées' as result;

-- 7. Supprimer toutes les absences
DELETE FROM absences;
SELECT 'Toutes les absences supprimées' as result;

-- 8. Supprimer toutes les ressources
DELETE FROM ressources;
SELECT 'Toutes les ressources supprimées' as result;

-- 9. Supprimer tous les sites
DELETE FROM sites;
SELECT 'Tous les sites supprimés' as result;

-- 10. Vérification finale
SELECT 'Vérification finale:' as info;
SELECT COUNT(*) as sites_restants FROM sites;
SELECT COUNT(*) as ressources_restantes FROM ressources;
SELECT COUNT(*) as affaires_restantes FROM affaires;
