-- Migration 068: Vérification et correction forcée des triggers
-- Date: 2025-01-27
-- Description: Vérifier et corriger tous les triggers qui utilisent des statuts supprimés

-- 1. Vérifier les contraintes CHECK actuelles
DO $$
BEGIN
    RAISE NOTICE 'Vérification des contraintes CHECK...';
    
    -- Vérifier la contrainte affaires_statut_check
    PERFORM constraint_name 
    FROM information_schema.table_constraints 
    WHERE table_name = 'affaires' 
    AND constraint_name = 'affaires_statut_check';
    
    IF FOUND THEN
        RAISE NOTICE 'Contrainte affaires_statut_check trouvée';
    ELSE
        RAISE NOTICE 'Contrainte affaires_statut_check manquante';
    END IF;
    
    -- Vérifier la contrainte remontee_site_statut_reel_check
    PERFORM constraint_name 
    FROM information_schema.table_constraints 
    WHERE table_name = 'remontee_site' 
    AND constraint_name = 'remontee_site_statut_reel_check';
    
    IF FOUND THEN
        RAISE NOTICE 'Contrainte remontee_site_statut_reel_check trouvée';
    ELSE
        RAISE NOTICE 'Contrainte remontee_site_statut_reel_check manquante';
    END IF;
END $$;

-- 2. Supprimer TOUS les triggers problématiques
DROP TRIGGER IF EXISTS trg_affaire_en_suivi ON remontee_site;
DROP TRIGGER IF EXISTS trg_affaire_cloturee ON planning_taches;
DROP TRIGGER IF EXISTS trg_sync_date_reelle_on_completion ON planning_taches;
DROP TRIGGER IF EXISTS trg_update_dates_reelles ON planning_taches;

-- 3. Recréer les fonctions avec les bons statuts
CREATE OR REPLACE FUNCTION fn_affaire_en_suivi()
RETURNS TRIGGER AS $$
BEGIN
  -- Si une remontée est enregistrée, passer l'affaire à "Planifiée"
  IF NEW.tache_id IS NOT NULL THEN
    UPDATE affaires
    SET statut = 'Planifiée',
        updated_at = NOW()
    WHERE id IN (
      SELECT affaire_id 
      FROM planning_taches 
      WHERE id = NEW.tache_id
    )
    AND statut IN ('Brouillon', 'A_planifier');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_affaire_cloturee()
RETURNS TRIGGER AS $$
DECLARE
  v_affaire_id UUID;
  v_all_tasks_done BOOLEAN;
  v_has_active_claims BOOLEAN;
BEGIN
  -- Récupérer l'ID de l'affaire
  v_affaire_id := NEW.affaire_id;
  
  -- Vérifier si toutes les tâches sont terminées
  SELECT NOT EXISTS (
    SELECT 1 FROM planning_taches 
    WHERE affaire_id = v_affaire_id 
    AND statut != 'Terminée'
  ) INTO v_all_tasks_done;
  
  -- Vérifier s'il y a des claims actifs
  SELECT EXISTS (
    SELECT 1 FROM claims 
    WHERE affaire_id = v_affaire_id 
    AND statut IN ('Ouvert', 'En analyse', 'Validé', 'Transmis')
  ) INTO v_has_active_claims;
  
  -- Si toutes les tâches sont terminées ET aucun claim actif
  IF v_all_tasks_done AND NOT v_has_active_claims THEN
    UPDATE affaires
    SET statut = 'Clôturée',
        updated_at = NOW()
    WHERE id = v_affaire_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION trigger_sync_date_reelle_on_completion()
RETURNS trigger AS $$
BEGIN
  -- Si la tâche passe à "Terminée", mettre à jour la date de fin réelle
  IF NEW.statut = 'Terminée' AND OLD.statut != 'Terminée' THEN
    NEW.date_fin_reelle := CURRENT_DATE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_dates_reelles()
RETURNS trigger AS $$
BEGIN
  -- Si la tâche est terminée, mettre à jour les dates réelles
  IF NEW.statut = 'Terminée' THEN
    IF NEW.date_debut_reelle IS NULL THEN
      NEW.date_debut_reelle := NEW.date_debut_plan;
    END IF;
    IF NEW.date_fin_reelle IS NULL THEN
      NEW.date_fin_reelle := CURRENT_DATE;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Recréer les triggers
CREATE TRIGGER trg_affaire_en_suivi
  AFTER INSERT ON remontee_site
  FOR EACH ROW
  EXECUTE FUNCTION fn_affaire_en_suivi();

CREATE TRIGGER trg_affaire_cloturee
  AFTER UPDATE ON planning_taches
  FOR EACH ROW
  WHEN (NEW.statut = 'Terminée' AND OLD.statut != 'Terminée')
  EXECUTE FUNCTION fn_affaire_cloturee();

CREATE TRIGGER trg_sync_date_reelle_on_completion
  BEFORE UPDATE ON planning_taches
  FOR EACH ROW
  EXECUTE FUNCTION trigger_sync_date_reelle_on_completion();

CREATE TRIGGER trg_update_dates_reelles
  BEFORE UPDATE ON planning_taches
  FOR EACH ROW
  EXECUTE FUNCTION update_dates_reelles();

-- 5. Vérifier que les contraintes CHECK sont correctes
DO $$
BEGIN
    -- Vérifier et corriger la contrainte affaires_statut_check
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'affaires' 
        AND constraint_name = 'affaires_statut_check'
    ) THEN
        ALTER TABLE affaires DROP CONSTRAINT affaires_statut_check;
    END IF;
    
    ALTER TABLE affaires ADD CONSTRAINT affaires_statut_check 
    CHECK (statut IN ('Brouillon', 'A_planifier', 'Planifiée', 'Clôturée'));
    
    RAISE NOTICE 'Contrainte affaires_statut_check recréée avec succès';
END $$;

-- 6. Message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'Migration 068 terminée avec succès !';
  RAISE NOTICE 'Tous les triggers ont été corrigés et recréés';
  RAISE NOTICE 'Les contraintes CHECK ont été vérifiées et corrigées';
END $$;
