-- Migration 034 : Ajout des champs pour les jalons dans planning_taches
-- Date : 20/10/2025
-- Description : Ajouter les champs nécessaires pour les jalons financiers

-- 1. Ajouter la colonne lot_financier_id si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'planning_taches' 
    AND column_name = 'lot_financier_id'
  ) THEN
    ALTER TABLE planning_taches 
      ADD COLUMN lot_financier_id uuid REFERENCES affaires_lots_financiers(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 2. Ajouter la colonne type si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'planning_taches' 
    AND column_name = 'type'
  ) THEN
    ALTER TABLE planning_taches 
      ADD COLUMN type text DEFAULT 'tache' CHECK (type IN ('tache', 'jalon'));
  END IF;
END $$;

-- 3. Ajouter la colonne is_parapluie_bpu si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'planning_taches' 
    AND column_name = 'is_parapluie_bpu'
  ) THEN
    ALTER TABLE planning_taches 
      ADD COLUMN is_parapluie_bpu boolean DEFAULT false;
  END IF;
END $$;

-- 4. Ajouter la colonne requiert_reception si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'planning_taches' 
    AND column_name = 'requiert_reception'
  ) THEN
    ALTER TABLE planning_taches 
      ADD COLUMN requiert_reception boolean DEFAULT false;
  END IF;
END $$;

-- 5. Ajouter la colonne montant si elle n'existe pas (pour les jalons)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'planning_taches' 
    AND column_name = 'montant'
  ) THEN
    ALTER TABLE planning_taches 
      ADD COLUMN montant numeric(12, 2);
  END IF;
END $$;

-- 6. Créer l'index sur lot_financier_id
CREATE INDEX IF NOT EXISTS idx_planning_taches_lot_financier_id 
  ON planning_taches(lot_financier_id);

-- 7. Créer l'index sur type
CREATE INDEX IF NOT EXISTS idx_planning_taches_type 
  ON planning_taches(type);

-- 8. Créer une vue pour les jalons
CREATE OR REPLACE VIEW v_planning_jalons AS
SELECT 
  t.id,
  t.affaire_id,
  a.code_affaire,
  a.nom as affaire_nom,
  t.lot_financier_id,
  l.libelle as lot_libelle,
  l.montant_ht as lot_montant,
  l.mode_facturation,
  l.numero_commande,
  t.libelle_tache,
  t.type,
  t.date_debut_plan,
  t.date_fin_plan,
  t.avancement_pct,
  t.statut,
  t.montant,
  t.requiert_reception
FROM planning_taches t
LEFT JOIN affaires a ON t.affaire_id = a.id
LEFT JOIN affaires_lots_financiers l ON t.lot_financier_id = l.id
WHERE t.type = 'jalon'
ORDER BY t.date_fin_plan;

-- 9. Créer une vue pour les tâches (non-jalons)
CREATE OR REPLACE VIEW v_planning_taches_operatives AS
SELECT 
  t.id,
  t.affaire_id,
  a.code_affaire,
  a.nom as affaire_nom,
  t.lot_id,
  t.site_id,
  s.nom as site_nom,
  t.libelle_tache,
  t.type_tache,
  t.type,
  t.date_debut_plan,
  t.date_fin_plan,
  t.date_debut_reelle,
  t.date_fin_reelle,
  t.effort_plan_h,
  t.effort_reel_h,
  t.avancement_pct,
  t.statut,
  t.competence,
  t.is_parapluie_bpu
FROM planning_taches t
LEFT JOIN affaires a ON t.affaire_id = a.id
LEFT JOIN sites s ON t.site_id = s.id
WHERE t.type = 'tache' OR t.type IS NULL
ORDER BY t.date_debut_plan;

-- 10. Commentaires
COMMENT ON COLUMN planning_taches.lot_financier_id IS 'Référence vers le lot financier (pour les jalons)';
COMMENT ON COLUMN planning_taches.type IS 'Type de tâche : tache (opérative) ou jalon (financier)';
COMMENT ON COLUMN planning_taches.is_parapluie_bpu IS 'Indique si c''est une tâche parapluie pour une affaire BPU';
COMMENT ON COLUMN planning_taches.requiert_reception IS 'Indique si le jalon nécessite une réception client';
COMMENT ON COLUMN planning_taches.montant IS 'Montant associé au jalon';

COMMENT ON VIEW v_planning_jalons IS 'Vue des jalons financiers avec leurs lots associés';
COMMENT ON VIEW v_planning_taches_operatives IS 'Vue des tâches opératives (non-jalons)';

-- 11. Mettre à jour les tâches existantes pour définir type = 'tache'
UPDATE planning_taches 
SET type = 'tache' 
WHERE type IS NULL;

