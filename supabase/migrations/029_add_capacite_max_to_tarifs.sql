-- ============================================================================
-- Migration 029 : Ajout du champ capacite_max à formations_tarifs
-- ============================================================================

-- Ajouter le champ capacite_max pour définir le nombre de personnes limite pour un tarif groupe
ALTER TABLE formations_tarifs
ADD COLUMN IF NOT EXISTS capacite_max INTEGER;

-- Commentaire
COMMENT ON COLUMN formations_tarifs.capacite_max IS 'Nombre maximum de personnes pour un tarif groupe (si cout_session renseigné)';

-- Index pour faciliter les recherches
CREATE INDEX IF NOT EXISTS idx_tarifs_capacite ON formations_tarifs(capacite_max);

