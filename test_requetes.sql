-- ============================================
-- SCRIPT DE TEST COMPLET DES REQUÊTES
-- Date: 2025-01-20
-- Objectif: Vérifier que toutes les requêtes envoient vers les bonnes tables
-- ============================================

-- Test 1: CollaborateursTable
-- Vérifie: ressources + sites
SELECT '✅ Test 1: CollaborateursTable' as test_name;
SELECT 
  r.id,
  r.nom,
  r.prenom,
  r.site_id,
  s.code_site,
  s.nom as site_nom,
  r.type_contrat,
  r.actif
FROM ressources r
LEFT JOIN sites s ON r.site_id = s.id
ORDER BY r.nom
LIMIT 5;

-- Test 2: AbsencesTable
-- Vérifie: absences + ressources
SELECT '✅ Test 2: AbsencesTable' as test_name;
SELECT 
  a.id,
  a.ressource_id,
  r.nom as ressource_nom,
  r.prenom as ressource_prenom,
  a.type,
  a.site,
  a.date_debut,
  a.date_fin,
  a.statut
FROM absences a
LEFT JOIN ressources r ON a.ressource_id = r.id
ORDER BY a.date_debut DESC
LIMIT 5;

-- Test 3: ClaimsTable
-- Vérifie: claims + affaires + clients
SELECT '✅ Test 3: ClaimsTable' as test_name;
SELECT 
  c.id,
  c.affaire_id,
  a.code_affaire,
  cl.nom_client,
  c.type,
  c.titre,
  c.montant_estime,
  c.statut
FROM claims c
LEFT JOIN affaires a ON c.affaire_id = a.id
LEFT JOIN clients cl ON a.client_id = cl.id
ORDER BY c.date_detection DESC
LIMIT 5;

-- Test 4: MaintenanceTable
-- Vérifie: maintenance_journal
SELECT '✅ Test 4: MaintenanceTable' as test_name;
SELECT 
  id,
  site_id,
  date_jour,
  systeme,
  elementaire,
  type_maintenance,
  etat_reel,
  heures_metal
FROM maintenance_journal
ORDER BY date_jour DESC
LIMIT 5;

-- Test 5: FormsTable
-- Vérifie: forms
SELECT '✅ Test 5: FormsTable' as test_name;
SELECT 
  id,
  name,
  description,
  version,
  published,
  created_at
FROM forms
ORDER BY created_at DESC
LIMIT 5;

-- Test 6: InterlocuteursTable
-- Vérifie: interlocuteurs + clients + sites
SELECT '✅ Test 6: InterlocuteursTable' as test_name;
SELECT 
  i.id,
  i.client_id,
  c.nom_client,
  i.nom,
  i.prenom,
  i.type_interlocuteur,
  i.site_id,
  s.nom as site_nom,
  i.actif
FROM interlocuteurs i
LEFT JOIN clients c ON i.client_id = c.id
LEFT JOIN sites s ON i.site_id = s.id
ORDER BY i.nom
LIMIT 5;

-- Test 7: RemonteesTable
-- Vérifie: remontee_site + planning_taches + affaires + sites
SELECT '✅ Test 7: RemonteesTable' as test_name;
SELECT 
  rs.id,
  rs.tache_id,
  pt.libelle_tache,
  rs.affaire_id,
  a.code_affaire,
  rs.site_id,
  s.nom as site_nom,
  rs.statut_reel,
  rs.avancement_pct,
  rs.heures_metal
FROM remontee_site rs
LEFT JOIN planning_taches pt ON rs.tache_id = pt.id
LEFT JOIN affaires a ON rs.affaire_id = a.id
LEFT JOIN sites s ON rs.site_id = s.id
ORDER BY rs.date_saisie DESC
LIMIT 5;

-- Test 8: GanttTable
-- Vérifie: planning_taches + affaires + affaires_lots + sites
SELECT '✅ Test 8: GanttTable' as test_name;
SELECT 
  pt.id,
  pt.affaire_id,
  a.code_affaire,
  pt.lot_id,
  al.libelle_lot,
  pt.site_id,
  s.nom as site_nom,
  pt.libelle_tache,
  pt.statut,
  pt.avancement_pct
FROM planning_taches pt
LEFT JOIN affaires a ON pt.affaire_id = a.id
LEFT JOIN affaires_lots al ON pt.lot_id = al.id
LEFT JOIN sites s ON pt.site_id = s.id
ORDER BY pt.date_debut_plan
LIMIT 5;

-- Test 9: SitesTable
-- Vérifie: sites + ressources
SELECT '✅ Test 9: SitesTable' as test_name;
SELECT 
  s.id,
  s.code_site,
  s.nom,
  s.statut,
  s.responsable_id,
  r.nom as responsable_nom,
  r.prenom as responsable_prenom
FROM sites s
LEFT JOIN ressources r ON s.responsable_id = r.id
ORDER BY s.nom
LIMIT 5;

-- ============================================
-- RÉSUMÉ DES TESTS
-- ============================================
SELECT 
  '📊 RÉSUMÉ DES TABLES' as info,
  COUNT(*) as nb_tables
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE';

-- Liste de toutes les tables
SELECT 
  '📋 Liste des tables' as info,
  table_name
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

