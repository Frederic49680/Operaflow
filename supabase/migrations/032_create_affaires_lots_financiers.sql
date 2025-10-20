-- Migration 032 : Création de la table affaires_lots_financiers
-- Date : 20/10/2025
-- Description : Table pour gérer les lots financiers d'une affaire

-- 1. Créer la table affaires_lots_financiers
CREATE TABLE IF NOT EXISTS affaires_lots_financiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affaire_id uuid NOT NULL REFERENCES affaires(id) ON DELETE CASCADE,
  libelle text NOT NULL,
  montant_ht numeric(12, 2) NOT NULL CHECK (montant_ht >= 0),
  mode_facturation text NOT NULL CHECK (mode_facturation IN ('a_la_reception', 'a_l_avancement', 'echeancier')),
  echeance_prevue date NOT NULL,
  numero_commande text,
  commentaire text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid,
  updated_by uuid
);

-- 2. Créer les index
CREATE INDEX idx_affaires_lots_financiers_affaire_id ON affaires_lots_financiers(affaire_id);
CREATE INDEX idx_affaires_lots_financiers_echeance ON affaires_lots_financiers(echeance_prevue);

-- 3. Créer le trigger pour updated_at
CREATE OR REPLACE FUNCTION update_affaires_lots_financiers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_affaires_lots_financiers_updated_at
  BEFORE UPDATE ON affaires_lots_financiers
  FOR EACH ROW
  EXECUTE FUNCTION update_affaires_lots_financiers_updated_at();

-- 4. Créer la vue pour faciliter les requêtes
CREATE OR REPLACE VIEW v_affaires_lots_financiers AS
SELECT 
  l.id,
  l.affaire_id,
  a.code_affaire,
  a.nom as affaire_nom,
  l.libelle,
  l.montant_ht,
  l.mode_facturation,
  l.echeance_prevue,
  l.numero_commande,
  l.commentaire,
  l.created_at,
  l.updated_at,
  CASE 
    WHEN l.echeance_prevue < CURRENT_DATE THEN 'En retard'
    WHEN l.echeance_prevue <= CURRENT_DATE + INTERVAL '7 days' THEN 'À échéance'
    ELSE 'À venir'
  END as statut_echeance
FROM affaires_lots_financiers l
LEFT JOIN affaires a ON l.affaire_id = a.id;

-- 5. Commentaires sur la table
COMMENT ON TABLE affaires_lots_financiers IS 'Lots financiers d''une affaire pour la facturation';
COMMENT ON COLUMN affaires_lots_financiers.id IS 'Identifiant unique du lot';
COMMENT ON COLUMN affaires_lots_financiers.affaire_id IS 'Référence vers l''affaire';
COMMENT ON COLUMN affaires_lots_financiers.libelle IS 'Libellé du lot';
COMMENT ON COLUMN affaires_lots_financiers.montant_ht IS 'Montant HT du lot';
COMMENT ON COLUMN affaires_lots_financiers.mode_facturation IS 'Mode de facturation : a_la_reception, a_l_avancement, echeancier';
COMMENT ON COLUMN affaires_lots_financiers.echeance_prevue IS 'Date d''échéance prévue pour le jalon';
COMMENT ON COLUMN affaires_lots_financiers.numero_commande IS 'Numéro de commande client';
COMMENT ON COLUMN affaires_lots_financiers.commentaire IS 'Commentaire libre';

-- 6. RLS (Row Level Security) - Désactivé pour l'instant
-- Les politiques seront ajoutées plus tard avec le module Auth
-- ALTER TABLE affaires_lots_financiers ENABLE ROW LEVEL SECURITY;

-- 7. Données de test (optionnel)
-- INSERT INTO affaires_lots_financiers (affaire_id, libelle, montant_ht, mode_facturation, echeance_prevue, numero_commande)
-- VALUES 
--   (
--     (SELECT id FROM affaires WHERE code_affaire = 'AFF-2025-001' LIMIT 1),
--     'Lot 1 - Étude et conception',
--     50000.00,
--     'a_l_avancement',
--     '2025-10-15',
--     'CMD-2025-001'
--   ),
--   (
--     (SELECT id FROM affaires WHERE code_affaire = 'AFF-2025-001' LIMIT 1),
--     'Lot 2 - Réalisation',
--     120000.00,
--     'a_la_reception',
--     '2025-11-30',
--     'CMD-2025-002'
--   );

