-- Migration 061: Correction finale de la contrainte CHECK du statut des affaires
-- Date: 2025-01-25
-- Description: S'assurer que la contrainte CHECK accepte les bons statuts

-- Supprimer toutes les contraintes existantes
ALTER TABLE affaires DROP CONSTRAINT IF EXISTS affaires_statut_check;

-- Recréer la contrainte avec les bons statuts
ALTER TABLE affaires ADD CONSTRAINT affaires_statut_check 
CHECK (statut IN ('Brouillon', 'A_planifier', 'Validée', 'Planifiée', 'En suivi', 'Clôturée'));

-- Remplacer les anciens statuts "Soumise" par "A_planifier" s'ils existent
UPDATE affaires 
SET statut = 'A_planifier' 
WHERE statut = 'Soumise';

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'Contrainte CHECK corrigée avec succès !';
  RAISE NOTICE 'Statuts disponibles : Brouillon, A_planifier, Validée, Planifiée, En suivi, Clôturée';
  RAISE NOTICE 'Les statuts "Soumise" ont été remplacés par "A_planifier"';
END $$;
