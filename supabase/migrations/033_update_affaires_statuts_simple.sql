-- Migration 033 SIMPLE : Modification des statuts d'affaires
-- Date : 20/10/2025
-- Description : Ajouter le statut 'A_planifier' et remplacer 'Soumise' par 'A_planifier'

-- ============================================================================
-- ÉTAPE 1 : SUPPRESSION DE TOUTES LES CONTRAINTES CHECK
-- ============================================================================

DO $$
DECLARE
  v_constraint_name text;
BEGIN
  -- Supprimer toutes les contraintes CHECK sur la table affaires
  FOR v_constraint_name IN
    SELECT conname 
    FROM pg_constraint
    WHERE conrelid = 'affaires'::regclass
    AND contype = 'c'
  LOOP
    EXECUTE format('ALTER TABLE affaires DROP CONSTRAINT IF EXISTS %I CASCADE', v_constraint_name);
  END LOOP;
END $$;

-- ============================================================================
-- ÉTAPE 2 : MISE À JOUR DES STATUTS EXISTANTS
-- ============================================================================

-- Remplacer 'Soumise' par 'A_planifier'
UPDATE affaires 
SET statut = 'A_planifier' 
WHERE statut = 'Soumise';

-- Remplacer 'Validée' par 'Validee' (normalisation)
UPDATE affaires 
SET statut = 'Validee' 
WHERE statut = 'Validée';

-- Remplacer 'Clôturée' par 'Cloturee' (normalisation)
UPDATE affaires 
SET statut = 'Cloturee' 
WHERE statut = 'Clôturée';

-- Remplacer 'Annulée' par 'Annulee' (normalisation)
UPDATE affaires 
SET statut = 'Annulee' 
WHERE statut = 'Annulée';

-- Si d'autres statuts existent, les mapper vers 'Brouillon' par défaut
UPDATE affaires 
SET statut = 'Brouillon' 
WHERE statut NOT IN ('Brouillon', 'A_planifier', 'Validee', 'Cloturee', 'Annulee');

-- ============================================================================
-- ÉTAPE 3 : CRÉATION DE LA NOUVELLE CONTRAINTE CHECK
-- ============================================================================

-- Créer la nouvelle contrainte CHECK
-- Les statuts possibles : Brouillon, A_planifier, Validee, Cloturee, Annulee
ALTER TABLE affaires 
  ADD CONSTRAINT affaires_statut_check 
  CHECK (statut IN ('Brouillon', 'A_planifier', 'Validee', 'Cloturee', 'Annulee'));

-- ============================================================================
-- ÉTAPE 4 : DÉFINIR LE STATUT PAR DÉFAUT
-- ============================================================================

-- Définir le statut par défaut à 'Brouillon' pour les nouvelles affaires
ALTER TABLE affaires 
  ALTER COLUMN statut SET DEFAULT 'Brouillon';

-- ============================================================================
-- ÉTAPE 5 : FONCTION ET TRIGGER
-- ============================================================================

-- Créer une fonction pour gérer automatiquement le statut à la création
CREATE OR REPLACE FUNCTION fn_affaire_status_created()
RETURNS TRIGGER AS $$
BEGIN
  -- Si aucun statut n'est fourni, définir 'Brouillon' par défaut
  IF NEW.statut IS NULL THEN
    NEW.statut := 'Brouillon';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger pour appliquer la fonction
DROP TRIGGER IF EXISTS trg_affaire_status_created ON affaires;

CREATE TRIGGER trg_affaire_status_created
  BEFORE INSERT ON affaires
  FOR EACH ROW
  EXECUTE FUNCTION fn_affaire_status_created();

-- ============================================================================
-- FIN DE LA MIGRATION
-- ============================================================================

-- Les vues seront créées dans une migration séparée après vérification des colonnes

