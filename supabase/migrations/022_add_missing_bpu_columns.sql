-- ============================================================================
-- Migration 022 : Ajout des colonnes BPU manquantes dans affaires
-- ============================================================================
-- Auteur : Fred Baudry
-- Date : 2025-01-21
-- Description : Ajout des colonnes de calcul BPU manquantes
-- ============================================================================

-- Ajouter les colonnes de calcul BPU manquantes
ALTER TABLE affaires
  ADD COLUMN IF NOT EXISTS heures_capacite NUMERIC(12, 2),
  ADD COLUMN IF NOT EXISTS heures_vendues_total NUMERIC(12, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS heures_consommes_total NUMERIC(12, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS montant_reconnu_total NUMERIC(12, 2) DEFAULT 0;

-- Commentaires
COMMENT ON COLUMN affaires.heures_capacite IS 'Capacité totale en heures (calculée : nb_ressources_ref × heures_semaine_ref × nb_semaines)';
COMMENT ON COLUMN affaires.heures_vendues_total IS 'Heures vendues totales (somme des heures équivalentes des lignes BPU vendues)';
COMMENT ON COLUMN affaires.heures_consommes_total IS 'Heures consommées totales (somme des heures_metal des réalisations)';
COMMENT ON COLUMN affaires.montant_reconnu_total IS 'Montant reconnu total (€) - somme des montants reconnus des réalisations terminées';

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_affaires_heures_capacite ON affaires(heures_capacite) WHERE type_affaire = 'BPU';
CREATE INDEX IF NOT EXISTS idx_affaires_montant_reconnu ON affaires(montant_reconnu_total) WHERE type_affaire = 'BPU';

