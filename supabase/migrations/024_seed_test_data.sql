-- Migration 024: Données de test pour les affaires
-- Auteur: Fred Baudry
-- Date: 2025-01-18
-- Description: Insertion de données de test pour sites, clients et ressources

-- ============================================
-- 1. SITES (si pas déjà présents)
-- ============================================
INSERT INTO sites (id, code_site, nom, responsable_id, statut, created_by)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'E-03A', 'Site Est', NULL, 'Actif', NULL),
  ('550e8400-e29b-41d4-a716-446655440002', 'O-05B', 'Site Ouest', NULL, 'Actif', NULL),
  ('550e8400-e29b-41d4-a716-446655440003', 'C-07C', 'Site Centre', NULL, 'Actif', NULL)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. CLIENTS (si pas déjà présents)
-- ============================================
INSERT INTO clients (id, nom_client, siret, adresse, code_postal, ville, telephone, email, categorie, actif, created_by)
VALUES 
  ('660e8400-e29b-41d4-a716-446655440001', 'EDF Réseaux', '552 081 317 00029', '32 rue de Monceau', '75008', 'Paris', '01 40 42 22 22', 'contact@edf.fr', 'MOA', true, NULL),
  ('660e8400-e29b-41d4-a716-446655440002', 'Engie', '542 107 651 00041', '1 place Samuel de Champlain', '92400', 'Courbevoie', '01 44 22 00 00', 'contact@engie.fr', 'MOA', true, NULL),
  ('660e8400-e29b-41d4-a716-446655440003', 'RTE', '552 081 317 00029', '1 terrasse Bellini', '92807', 'Puteaux', '01 41 02 10 10', 'contact@rte-france.com', 'MOA', true, NULL),
  ('660e8400-e29b-41d4-a716-446655440004', 'Autre Client', NULL, NULL, NULL, NULL, NULL, NULL, 'Autre', true, NULL)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 3. RESSOURCES (si pas déjà présents)
-- ============================================
INSERT INTO ressources (id, nom, prenom, site, actif, type_contrat, email_pro, telephone, adresse_postale, competences, date_entree, created_by)
VALUES 
  ('770e8400-e29b-41d4-a716-446655440001', 'Dupont', 'Jean', 'E-03A', true, 'CDI', 'jean.dupont@example.com', '+33612345678', '10 rue de la Paix, 75001 Paris', ARRAY['Électricité', 'HTA'], '2020-01-15', NULL),
  ('770e8400-e29b-41d4-a716-446655440002', 'Martin', 'Marie', 'O-05B', true, 'CDI', 'marie.martin@example.com', '+33623456789', '15 avenue des Champs, 75008 Paris', ARRAY['CVC', 'Automatisme'], '2019-03-20', NULL),
  ('770e8400-e29b-41d4-a716-446655440003', 'Bernard', 'Pierre', 'C-07C', true, 'CDI', 'pierre.bernard@example.com', '+33634567890', '20 boulevard Saint-Germain, 75005 Paris', ARRAY['Électricité', 'Sûreté'], '2021-06-10', NULL),
  ('770e8400-e29b-41d4-a716-446655440004', 'Dubois', 'Sophie', 'E-03A', true, 'CDI', 'sophie.dubois@example.com', '+33645678901', '25 rue de Rivoli, 75004 Paris', ARRAY['CVC', 'Électricité'], '2020-09-01', NULL),
  ('770e8400-e29b-41d4-a716-446655440005', 'Leroy', 'Marc', 'O-05B', true, 'CDI', 'marc.leroy@example.com', '+33656789012', '30 avenue de la République, 75011 Paris', ARRAY['Automatisme', 'IEG'], '2022-01-05', NULL)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 4. MISE À JOUR DES SITES avec responsables
-- ============================================
UPDATE sites 
SET responsable_id = '770e8400-e29b-41d4-a716-446655440001'
WHERE code_site = 'E-03A' AND responsable_id IS NULL;

UPDATE sites 
SET responsable_id = '770e8400-e29b-41d4-a716-446655440002'
WHERE code_site = 'O-05B' AND responsable_id IS NULL;

UPDATE sites 
SET responsable_id = '770e8400-e29b-41d4-a716-446655440003'
WHERE code_site = 'C-07C' AND responsable_id IS NULL;

-- ============================================
-- 5. VÉRIFICATION
-- ============================================
DO $$
DECLARE
  v_sites_count INTEGER;
  v_clients_count INTEGER;
  v_ressources_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_sites_count FROM sites WHERE statut = 'Actif';
  SELECT COUNT(*) INTO v_clients_count FROM clients WHERE actif = true;
  SELECT COUNT(*) INTO v_ressources_count FROM ressources WHERE actif = true;
  
  RAISE NOTICE '✅ Données de test insérées:';
  RAISE NOTICE '   - Sites actifs: %', v_sites_count;
  RAISE NOTICE '   - Clients actifs: %', v_clients_count;
  RAISE NOTICE '   - Ressources actives: %', v_ressources_count;
END $$;


