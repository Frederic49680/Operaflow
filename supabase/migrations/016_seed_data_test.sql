-- ============================================================================
-- Migration 016 : Données de test pour le module Terrain
-- ============================================================================
-- Auteur : Fred Baudry
-- Date : 2025-01-18
-- Description : Données de test pour afficher les affaires et tâches
-- ============================================================================

-- ============================================================================
-- NETTOYAGE (optionnel - commenté pour ne pas supprimer les données existantes)
-- ============================================================================
-- DELETE FROM planning_taches;
-- DELETE FROM affaires_lots;
-- DELETE FROM affaires;
-- DELETE FROM clients;
-- DELETE FROM ressources;
-- DELETE FROM sites;

-- ============================================================================
-- SITES DE TEST
-- ============================================================================
INSERT INTO sites (code_site, nom, statut) VALUES
('E-03A', 'Site E-03A - Poste HTA', 'Actif'),
('DAM', 'Site DAM - Dépôt Atelier Maintenance', 'Actif'),
('PDC_FBA', 'Site PDC_FBA - Poste de Commande', 'Actif'),
('SITE-TEST', 'Site de test générique', 'Actif')
ON CONFLICT (code_site) DO NOTHING;

-- ============================================================================
-- RESSOURCES DE TEST (Responsables)
-- ============================================================================
INSERT INTO ressources (nom, prenom, site_id, actif, type_contrat, email_pro, telephone, competences) VALUES
('Dupont', 'Jean', (SELECT id FROM sites WHERE code_site = 'E-03A'), true, 'CDI', 'jean.dupont@operaflow.fr', '+33612345678', ARRAY['IEG', 'Planification']),
('Martin', 'Sophie', (SELECT id FROM sites WHERE code_site = 'DAM'), true, 'CDI', 'sophie.martin@operaflow.fr', '+33623456789', ARRAY['Maintenance', 'IEG']),
('Bernard', 'Pierre', (SELECT id FROM sites WHERE code_site = 'PDC_FBA'), true, 'CDI', 'pierre.bernard@operaflow.fr', '+33634567890', ARRAY['AUTO', 'Planification']),
('Dubois', 'Marie', (SELECT id FROM sites WHERE code_site = 'SITE-TEST'), true, 'CDI', 'marie.dubois@operaflow.fr', '+33645678901', ARRAY['IEG', 'AUTO', 'Maintenance'])
ON CONFLICT DO NOTHING;

-- ============================================================================
-- CLIENTS DE TEST
-- ============================================================================
INSERT INTO clients (nom_client, siret, adresse, code_postal, ville, telephone, email, categorie, actif) VALUES
('EDF Réseaux', '55208131700029', '22-30 Avenue de Wagram', '75008', 'Paris', '+33142012222', 'contact@edf.fr', 'MOA', true),
('Enedis', '55208131700037', '34 Place des Corolles', '92400', 'Courbevoie', '+33149014000', 'contact@enedis.fr', 'MOA', true),
('RTE', '55208131700045', 'Immeuble Windows - 1 terrasse Bellini', '92800', 'Puteaux', '+33141602345', 'contact@rte-france.com', 'MOA', true),
('Client Test', '12345678901234', '123 Rue de Test', '75001', 'Paris', '+33123456789', 'test@client.fr', 'Autre', true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- AFFAIRES DE TEST
-- ============================================================================
INSERT INTO affaires (code_affaire, site_id, responsable_id, client_id, num_commande, competence_principale, type_contrat, montant_total_ht, statut, date_debut, date_fin_prevue) VALUES
('AFF-2025-001', 
 (SELECT id FROM sites WHERE code_site = 'E-03A'),
 (SELECT id FROM ressources WHERE nom = 'Dupont' AND prenom = 'Jean'),
 (SELECT id FROM clients WHERE nom_client = 'EDF Réseaux'),
 'CMD-EDF-2025-001',
 'IEG',
 'Forfait',
 150000.00,
 'Planifiée',
 CURRENT_DATE - INTERVAL '10 days',
 CURRENT_DATE + INTERVAL '30 days'),

('AFF-2025-002',
 (SELECT id FROM sites WHERE code_site = 'DAM'),
 (SELECT id FROM ressources WHERE nom = 'Martin' AND prenom = 'Sophie'),
 (SELECT id FROM clients WHERE nom_client = 'Enedis'),
 'CMD-ENEDIS-2025-002',
 'Maintenance',
 'Régie',
 85000.00,
 'En suivi',
 CURRENT_DATE - INTERVAL '20 days',
 CURRENT_DATE + INTERVAL '15 days'),

('AFF-2025-003',
 (SELECT id FROM sites WHERE code_site = 'PDC_FBA'),
 (SELECT id FROM ressources WHERE nom = 'Bernard' AND prenom = 'Pierre'),
 (SELECT id FROM clients WHERE nom_client = 'RTE'),
 'CMD-RTE-2025-003',
 'AUTO',
 'Forfait',
 200000.00,
 'Planifiée',
 CURRENT_DATE - INTERVAL '5 days',
 CURRENT_DATE + INTERVAL '45 days'),

('AFF-2025-004',
 (SELECT id FROM sites WHERE code_site = 'SITE-TEST'),
 (SELECT id FROM ressources WHERE nom = 'Dubois' AND prenom = 'Marie'),
 (SELECT id FROM clients WHERE nom_client = 'Client Test'),
 'CMD-TEST-2025-004',
 'IEG',
 'Forfait',
 120000.00,
 'En suivi',
 CURRENT_DATE - INTERVAL '15 days',
 CURRENT_DATE + INTERVAL '25 days')
ON CONFLICT (code_affaire) DO NOTHING;

-- ============================================================================
-- LOTS FINANCIERS
-- ============================================================================
INSERT INTO affaires_lots (affaire_id, libelle_lot, budget_ht, cout_estime, marge_prevue, ponderation) VALUES
-- Lots pour AFF-2025-001
((SELECT id FROM affaires WHERE code_affaire = 'AFF-2025-001'), 'Lot 1 - Préparation', 40000.00, 35000.00, 5000.00, 'heures'),
((SELECT id FROM affaires WHERE code_affaire = 'AFF-2025-001'), 'Lot 2 - Exécution', 80000.00, 75000.00, 5000.00, 'heures'),
((SELECT id FROM affaires WHERE code_affaire = 'AFF-2025-001'), 'Lot 3 - Contrôle', 30000.00, 28000.00, 2000.00, 'heures'),

-- Lots pour AFF-2025-002
((SELECT id FROM affaires WHERE code_affaire = 'AFF-2025-002'), 'Lot 1 - Maintenance préventive', 35000.00, 32000.00, 3000.00, 'heures'),
((SELECT id FROM affaires WHERE code_affaire = 'AFF-2025-002'), 'Lot 2 - Maintenance corrective', 50000.00, 48000.00, 2000.00, 'heures'),

-- Lots pour AFF-2025-003
((SELECT id FROM affaires WHERE code_affaire = 'AFF-2025-003'), 'Lot 1 - Installation', 100000.00, 95000.00, 5000.00, 'heures'),
((SELECT id FROM affaires WHERE code_affaire = 'AFF-2025-003'), 'Lot 2 - Mise en service', 60000.00, 58000.00, 2000.00, 'heures'),
((SELECT id FROM affaires WHERE code_affaire = 'AFF-2025-003'), 'Lot 3 - Formation', 40000.00, 38000.00, 2000.00, 'heures'),

-- Lots pour AFF-2025-004
((SELECT id FROM affaires WHERE code_affaire = 'AFF-2025-004'), 'Lot 1 - Études', 30000.00, 28000.00, 2000.00, 'heures'),
((SELECT id FROM affaires WHERE code_affaire = 'AFF-2025-004'), 'Lot 2 - Réalisation', 60000.00, 57000.00, 3000.00, 'heures'),
((SELECT id FROM affaires WHERE code_affaire = 'AFF-2025-004'), 'Lot 3 - Tests', 30000.00, 29000.00, 1000.00, 'heures')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- TÂCHES PLANIFIÉES
-- ============================================================================
INSERT INTO planning_taches (
  affaire_id, 
  lot_id, 
  site_id, 
  libelle_tache, 
  type_tache, 
  competence, 
  date_debut_plan, 
  date_fin_plan, 
  effort_plan_h, 
  statut,
  avancement_pct,
  responsable_execution_id
) VALUES
-- Tâches pour AFF-2025-001 - Lot 1
((SELECT id FROM affaires WHERE code_affaire = 'AFF-2025-001'),
 (SELECT id FROM affaires_lots WHERE affaire_id = (SELECT id FROM affaires WHERE code_affaire = 'AFF-2025-001') AND libelle_lot = 'Lot 1 - Préparation'),
 (SELECT id FROM sites WHERE code_site = 'E-03A'),
 'Étude de faisabilité', 'Préparation', 'IEG',
 CURRENT_DATE - INTERVAL '8 days', CURRENT_DATE - INTERVAL '5 days', 40, 'Terminé', 100,
 (SELECT id FROM ressources WHERE nom = 'Dupont' AND prenom = 'Jean')),

((SELECT id FROM affaires WHERE code_affaire = 'AFF-2025-001'),
 (SELECT id FROM affaires_lots WHERE affaire_id = (SELECT id FROM affaires WHERE code_affaire = 'AFF-2025-001') AND libelle_lot = 'Lot 1 - Préparation'),
 (SELECT id FROM sites WHERE code_site = 'E-03A'),
 'Commande matériel', 'Préparation', 'IEG',
 CURRENT_DATE - INTERVAL '4 days', CURRENT_DATE - INTERVAL '2 days', 16, 'Terminé', 100,
 (SELECT id FROM ressources WHERE nom = 'Dupont' AND prenom = 'Jean')),

-- Tâches pour AFF-2025-001 - Lot 2
((SELECT id FROM affaires WHERE code_affaire = 'AFF-2025-001'),
 (SELECT id FROM affaires_lots WHERE affaire_id = (SELECT id FROM affaires WHERE code_affaire = 'AFF-2025-001') AND libelle_lot = 'Lot 2 - Exécution'),
 (SELECT id FROM sites WHERE code_site = 'E-03A'),
 'Installation équipements', 'Exécution', 'IEG',
 CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days', 56, 'En cours', 45,
 (SELECT id FROM ressources WHERE nom = 'Dupont' AND prenom = 'Jean')),

((SELECT id FROM affaires WHERE code_affaire = 'AFF-2025-001'),
 (SELECT id FROM affaires_lots WHERE affaire_id = (SELECT id FROM affaires WHERE code_affaire = 'AFF-2025-001') AND libelle_lot = 'Lot 2 - Exécution'),
 (SELECT id FROM sites WHERE code_site = 'E-03A'),
 'Câblage et raccordements', 'Exécution', 'IEG',
 CURRENT_DATE + INTERVAL '8 days', CURRENT_DATE + INTERVAL '15 days', 56, 'Non lancé', 0,
 (SELECT id FROM ressources WHERE nom = 'Dupont' AND prenom = 'Jean')),

-- Tâches pour AFF-2025-001 - Lot 3
((SELECT id FROM affaires WHERE code_affaire = 'AFF-2025-001'),
 (SELECT id FROM affaires_lots WHERE affaire_id = (SELECT id FROM affaires WHERE code_affaire = 'AFF-2025-001') AND libelle_lot = 'Lot 3 - Contrôle'),
 (SELECT id FROM sites WHERE code_site = 'E-03A'),
 'Tests et contrôles', 'Contrôle', 'IEG',
 CURRENT_DATE + INTERVAL '16 days', CURRENT_DATE + INTERVAL '22 days', 40, 'Non lancé', 0,
 (SELECT id FROM ressources WHERE nom = 'Dupont' AND prenom = 'Jean')),

-- Tâches pour AFF-2025-002 - Lot 1
((SELECT id FROM affaires WHERE code_affaire = 'AFF-2025-002'),
 (SELECT id FROM affaires_lots WHERE affaire_id = (SELECT id FROM affaires WHERE code_affaire = 'AFF-2025-002') AND libelle_lot = 'Lot 1 - Maintenance préventive'),
 (SELECT id FROM sites WHERE code_site = 'DAM'),
 'Maintenance batteries', 'Exécution', 'Maintenance',
 CURRENT_DATE - INTERVAL '18 days', CURRENT_DATE - INTERVAL '12 days', 40, 'Terminé', 100,
 (SELECT id FROM ressources WHERE nom = 'Martin' AND prenom = 'Sophie')),

((SELECT id FROM affaires WHERE code_affaire = 'AFF-2025-002'),
 (SELECT id FROM affaires_lots WHERE affaire_id = (SELECT id FROM affaires WHERE code_affaire = 'AFF-2025-002') AND libelle_lot = 'Lot 1 - Maintenance préventive'),
 (SELECT id FROM sites WHERE code_site = 'DAM'),
 'Contrôle équipements', 'Contrôle', 'Maintenance',
 CURRENT_DATE - INTERVAL '11 days', CURRENT_DATE - INTERVAL '8 days', 24, 'Terminé', 100,
 (SELECT id FROM ressources WHERE nom = 'Martin' AND prenom = 'Sophie')),

-- Tâches pour AFF-2025-002 - Lot 2
((SELECT id FROM affaires WHERE code_affaire = 'AFF-2025-002'),
 (SELECT id FROM affaires_lots WHERE affaire_id = (SELECT id FROM affaires WHERE code_affaire = 'AFF-2025-002') AND libelle_lot = 'Lot 2 - Maintenance corrective'),
 (SELECT id FROM sites WHERE code_site = 'DAM'),
 'Réparation TGBT', 'Exécution', 'Maintenance',
 CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE + INTERVAL '3 days', 64, 'En cours', 60,
 (SELECT id FROM ressources WHERE nom = 'Martin' AND prenom = 'Sophie')),

((SELECT id FROM affaires WHERE code_affaire = 'AFF-2025-002'),
 (SELECT id FROM affaires_lots WHERE affaire_id = (SELECT id FROM affaires WHERE code_affaire = 'AFF-2025-002') AND libelle_lot = 'Lot 2 - Maintenance corrective'),
 (SELECT id FROM sites WHERE code_site = 'DAM'),
 'Remplacement composants', 'Exécution', 'Maintenance',
 CURRENT_DATE + INTERVAL '4 days', CURRENT_DATE + INTERVAL '10 days', 40, 'Non lancé', 0,
 (SELECT id FROM ressources WHERE nom = 'Martin' AND prenom = 'Sophie')),

-- Tâches pour AFF-2025-003 - Lot 1
((SELECT id FROM affaires WHERE code_affaire = 'AFF-2025-003'),
 (SELECT id FROM affaires_lots WHERE affaire_id = (SELECT id FROM affaires WHERE code_affaire = 'AFF-2025-003') AND libelle_lot = 'Lot 1 - Installation'),
 (SELECT id FROM sites WHERE code_site = 'PDC_FBA'),
 'Préparation site', 'Préparation', 'AUTO',
 CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE + INTERVAL '2 days', 32, 'En cours', 70,
 (SELECT id FROM ressources WHERE nom = 'Bernard' AND prenom = 'Pierre')),

((SELECT id FROM affaires WHERE code_affaire = 'AFF-2025-003'),
 (SELECT id FROM affaires_lots WHERE affaire_id = (SELECT id FROM affaires WHERE code_affaire = 'AFF-2025-003') AND libelle_lot = 'Lot 1 - Installation'),
 (SELECT id FROM sites WHERE code_site = 'PDC_FBA'),
 'Installation automates', 'Exécution', 'AUTO',
 CURRENT_DATE + INTERVAL '3 days', CURRENT_DATE + INTERVAL '15 days', 80, 'Non lancé', 0,
 (SELECT id FROM ressources WHERE nom = 'Bernard' AND prenom = 'Pierre')),

-- Tâches pour AFF-2025-004 - Lot 1
((SELECT id FROM affaires WHERE code_affaire = 'AFF-2025-004'),
 (SELECT id FROM affaires_lots WHERE affaire_id = (SELECT id FROM affaires WHERE code_affaire = 'AFF-2025-004') AND libelle_lot = 'Lot 1 - Études'),
 (SELECT id FROM sites WHERE code_site = 'SITE-TEST'),
 'Étude technique', 'Préparation', 'IEG',
 CURRENT_DATE - INTERVAL '13 days', CURRENT_DATE - INTERVAL '8 days', 40, 'Terminé', 100,
 (SELECT id FROM ressources WHERE nom = 'Dubois' AND prenom = 'Marie')),

-- Tâches pour AFF-2025-004 - Lot 2
((SELECT id FROM affaires WHERE code_affaire = 'AFF-2025-004'),
 (SELECT id FROM affaires_lots WHERE affaire_id = (SELECT id FROM affaires WHERE code_affaire = 'AFF-2025-004') AND libelle_lot = 'Lot 2 - Réalisation'),
 (SELECT id FROM sites WHERE code_site = 'SITE-TEST'),
 'Réalisation travaux', 'Exécution', 'IEG',
 CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE + INTERVAL '8 days', 96, 'En cours', 35,
 (SELECT id FROM ressources WHERE nom = 'Dubois' AND prenom = 'Marie')),

((SELECT id FROM affaires WHERE code_affaire = 'AFF-2025-004'),
 (SELECT id FROM affaires_lots WHERE affaire_id = (SELECT id FROM affaires WHERE code_affaire = 'AFF-2025-004') AND libelle_lot = 'Lot 2 - Réalisation'),
 (SELECT id FROM sites WHERE code_site = 'SITE-TEST'),
 'Mise en service', 'Exécution', 'IEG',
 CURRENT_DATE + INTERVAL '9 days', CURRENT_DATE + INTERVAL '12 days', 24, 'Non lancé', 0,
 (SELECT id FROM ressources WHERE nom = 'Dubois' AND prenom = 'Marie')),

-- Tâches pour AFF-2025-004 - Lot 3
((SELECT id FROM affaires WHERE code_affaire = 'AFF-2025-004'),
 (SELECT id FROM affaires_lots WHERE affaire_id = (SELECT id FROM affaires WHERE code_affaire = 'AFF-2025-004') AND libelle_lot = 'Lot 3 - Tests'),
 (SELECT id FROM sites WHERE code_site = 'SITE-TEST'),
 'Tests finaux', 'Contrôle', 'IEG',
 CURRENT_DATE + INTERVAL '13 days', CURRENT_DATE + INTERVAL '18 days', 40, 'Non lancé', 0,
 (SELECT id FROM ressources WHERE nom = 'Dubois' AND prenom = 'Marie'))
ON CONFLICT DO NOTHING;

-- ============================================================================
-- REMONTÉES TERRAIN DE TEST
-- ============================================================================
INSERT INTO remontee_site (site_id, affaire_id, tache_id, date_saisie, statut_reel, avancement_pct, nb_present, nb_planifie, heures_presence, heures_metal, motif, commentaire, etat_confirme) VALUES
-- Remontées pour AFF-2025-002 (En suivi)
((SELECT id FROM sites WHERE code_site = 'DAM'),
 (SELECT id FROM affaires WHERE code_affaire = 'AFF-2025-002'),
 (SELECT id FROM planning_taches WHERE libelle_tache = 'Réparation TGBT'),
 CURRENT_DATE - INTERVAL '1 day',
 'En cours', 55, 3, 3, 24, 24, NULL, 'Travail normal, zone dégagée', true),

-- Remontées pour AFF-2025-004 (En suivi)
((SELECT id FROM sites WHERE code_site = 'SITE-TEST'),
 (SELECT id FROM affaires WHERE code_affaire = 'AFF-2025-004'),
 (SELECT id FROM planning_taches WHERE libelle_tache = 'Réalisation travaux'),
 CURRENT_DATE - INTERVAL '1 day',
 'En cours', 30, 2, 2, 16, 16, NULL, 'Avancement conforme', true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- FIN DE LA MIGRATION
-- ============================================================================

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'Données de test insérées avec succès !';
  RAISE NOTICE 'Nombre de sites : %', (SELECT COUNT(*) FROM sites);
  RAISE NOTICE 'Nombre de ressources : %', (SELECT COUNT(*) FROM ressources);
  RAISE NOTICE 'Nombre de clients : %', (SELECT COUNT(*) FROM clients);
  RAISE NOTICE 'Nombre d''affaires : %', (SELECT COUNT(*) FROM affaires);
  RAISE NOTICE 'Nombre de lots : %', (SELECT COUNT(*) FROM affaires_lots);
  RAISE NOTICE 'Nombre de tâches : %', (SELECT COUNT(*) FROM planning_taches);
  RAISE NOTICE 'Nombre de remontées : %', (SELECT COUNT(*) FROM remontee_site);
END $$;

