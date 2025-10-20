-- Migration 033 : Modification des statuts d'affaires
-- Date : 20/10/2025
-- Description : Ajouter le statut 'A_planifier' et remplacer 'Soumise' par 'A_planifier'

-- 1. Vérifier les statuts actuels dans la table
DO $$
DECLARE
  v_statuts text[];
BEGIN
  -- Récupérer tous les statuts distincts
  SELECT array_agg(DISTINCT statut) INTO v_statuts
  FROM affaires;
  
  RAISE NOTICE 'Statuts actuels dans affaires: %', v_statuts;
END $$;

-- 2. Mettre à jour les statuts existants AVANT de créer la contrainte
-- Mapper les anciens statuts vers les nouveaux

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
-- (à adapter selon vos besoins)
UPDATE affaires 
SET statut = 'Brouillon' 
WHERE statut NOT IN ('Brouillon', 'A_planifier', 'Validee', 'Cloturee', 'Annulee');

-- 3. Supprimer TOUTES les contraintes CHECK existantes sur statut
DO $$
DECLARE
  v_constraint_name text;
BEGIN
  -- Récupérer le nom de toutes les contraintes CHECK sur la colonne statut
  FOR v_constraint_name IN
    SELECT constraint_name 
    FROM information_schema.constraint_column_usage 
    WHERE table_name = 'affaires' 
    AND column_name = 'statut'
    AND constraint_name LIKE '%check%'
  LOOP
    EXECUTE format('ALTER TABLE affaires DROP CONSTRAINT IF EXISTS %I', v_constraint_name);
    RAISE NOTICE 'Contrainte supprimée: %', v_constraint_name;
  END LOOP;
END $$;

-- 4. Maintenant, créer la nouvelle contrainte CHECK
-- Les statuts possibles : Brouillon, A_planifier, Validee, Cloturee, Annulee
ALTER TABLE affaires 
  ADD CONSTRAINT affaires_statut_check 
  CHECK (statut IN ('Brouillon', 'A_planifier', 'Validee', 'Cloturee', 'Annulee'));

-- 5. Définir le statut par défaut à 'Brouillon' pour les nouvelles affaires
ALTER TABLE affaires 
  ALTER COLUMN statut SET DEFAULT 'Brouillon';

-- 6. Créer une fonction pour gérer automatiquement le statut à la création
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

-- 7. Créer le trigger pour appliquer la fonction
DROP TRIGGER IF EXISTS trg_affaire_status_created ON affaires;

CREATE TRIGGER trg_affaire_status_created
  BEFORE INSERT ON affaires
  FOR EACH ROW
  EXECUTE FUNCTION fn_affaire_status_created();

-- 8. Créer une vue pour les affaires en attente de planification
CREATE OR REPLACE VIEW v_affaires_a_planifier AS
SELECT 
  a.id,
  a.code_affaire,
  a.nom,
  a.site_id,
  s.nom as site_nom,
  a.responsable_id,
  r.nom || ' ' || r.prenom as responsable_nom,
  a.type_contrat,
  a.montant_total_ht,
  a.statut,
  a.date_debut_prevue,
  a.date_fin_prevue,
  a.created_at,
  -- Compter le nombre de lots financiers
  (SELECT COUNT(*) FROM affaires_lots_financiers WHERE affaire_id = a.id) as nb_lots_financiers,
  -- Calculer le montant total des lots
  (SELECT COALESCE(SUM(montant_ht), 0) FROM affaires_lots_financiers WHERE affaire_id = a.id) as montant_lots_ht
FROM affaires a
LEFT JOIN sites s ON a.site_id = s.id
LEFT JOIN ressources r ON a.responsable_id = r.id
WHERE a.statut = 'A_planifier'
ORDER BY a.created_at DESC;

-- 9. Créer une vue pour les affaires validées avec leurs lots
CREATE OR REPLACE VIEW v_affaires_validees AS
SELECT 
  a.id,
  a.code_affaire,
  a.nom,
  a.site_id,
  s.nom as site_nom,
  a.responsable_id,
  r.nom || ' ' || r.prenom as responsable_nom,
  a.type_contrat,
  a.montant_total_ht,
  a.statut,
  a.date_debut_prevue,
  a.date_fin_prevue,
  -- Compter le nombre de tâches planifiées
  (SELECT COUNT(*) FROM planning_taches WHERE affaire_id = a.id) as nb_taches,
  -- Compter le nombre de lots financiers
  (SELECT COUNT(*) FROM affaires_lots_financiers WHERE affaire_id = a.id) as nb_lots_financiers,
  -- Compter le nombre de jalons
  (SELECT COUNT(*) FROM planning_taches WHERE affaire_id = a.id AND type = 'jalon') as nb_jalons
FROM affaires a
LEFT JOIN sites s ON a.site_id = s.id
LEFT JOIN ressources r ON a.responsable_id = r.id
WHERE a.statut = 'Validee'
ORDER BY a.date_debut_prevue;

-- 10. Commentaires
COMMENT ON VIEW v_affaires_a_planifier IS 'Vue des affaires en attente de planification';
COMMENT ON VIEW v_affaires_validees IS 'Vue des affaires validées avec leurs tâches et jalons';

-- 11. RLS sur les vues
ALTER VIEW v_affaires_a_planifier SET (security_barrier = true);
ALTER VIEW v_affaires_validees SET (security_barrier = true);

-- 12. Vérification finale
DO $$
DECLARE
  v_statuts text[];
BEGIN
  -- Récupérer tous les statuts distincts après migration
  SELECT array_agg(DISTINCT statut) INTO v_statuts
  FROM affaires;
  
  RAISE NOTICE 'Statuts après migration: %', v_statuts;
END $$;
