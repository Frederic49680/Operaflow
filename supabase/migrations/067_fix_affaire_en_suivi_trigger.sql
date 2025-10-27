-- Migration 067: Correction du trigger fn_affaire_en_suivi
-- Date: 2025-01-27
-- Description: Corriger le trigger qui essaie d'utiliser le statut "En suivi" supprimé

-- Supprimer l'ancien trigger
DROP TRIGGER IF EXISTS trg_affaire_en_suivi ON remontee_site;

-- Recréer la fonction avec le bon statut
CREATE OR REPLACE FUNCTION fn_affaire_en_suivi()
RETURNS TRIGGER AS $$
BEGIN
  -- Si une remontée est enregistrée, passer l'affaire à "Planifiée" (au lieu de "En suivi")
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

-- Recréer le trigger
CREATE TRIGGER trg_affaire_en_suivi
  AFTER INSERT ON remontee_site
  FOR EACH ROW
  EXECUTE FUNCTION fn_affaire_en_suivi();

-- Mettre à jour le commentaire
COMMENT ON FUNCTION fn_affaire_en_suivi IS 'Passe automatiquement une affaire au statut "Planifiée" quand une remontée est enregistrée';

-- Corriger aussi le trigger fn_affaire_cloturee qui utilise "Terminé" au lieu de "Terminée"
DROP TRIGGER IF EXISTS trg_affaire_cloturee ON planning_taches;

CREATE OR REPLACE FUNCTION fn_affaire_cloturee()
RETURNS TRIGGER AS $$
DECLARE
  v_affaire_id UUID;
  v_all_tasks_done BOOLEAN;
  v_has_active_claims BOOLEAN;
BEGIN
  -- Récupérer l'ID de l'affaire
  v_affaire_id := NEW.affaire_id;

  -- Vérifier si toutes les tâches sont terminées (utiliser "Terminée" au lieu de "Terminé")
  SELECT COUNT(*) = 0 INTO v_all_tasks_done
  FROM planning_taches
  WHERE affaire_id = v_affaire_id
    AND statut != 'Terminée';

  -- Vérifier s'il y a des claims actifs
  SELECT COUNT(*) > 0 INTO v_has_active_claims
  FROM claims
  WHERE affaire_id = v_affaire_id
    AND statut NOT IN ('Clos', 'Annulé');

  -- Si toutes les tâches sont terminées et aucun claim actif
  IF v_all_tasks_done AND NOT v_has_active_claims THEN
    UPDATE affaires
    SET statut = 'Clôturée',
        date_fin_reelle = NOW(),
        updated_at = NOW()
    WHERE id = v_affaire_id
    AND statut != 'Clôturée';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recréer le trigger avec la bonne condition
CREATE TRIGGER trg_affaire_cloturee
  AFTER UPDATE ON planning_taches
  FOR EACH ROW
  WHEN (NEW.statut = 'Terminée' AND OLD.statut != 'Terminée')
  EXECUTE FUNCTION fn_affaire_cloturee();

COMMENT ON FUNCTION fn_affaire_cloturee IS 'Passe automatiquement une affaire au statut "Clôturée" quand toutes les tâches sont terminées et aucun claim actif';

-- Corriger aussi le trigger trigger_sync_date_reelle_on_completion
DROP TRIGGER IF EXISTS trg_sync_date_reelle_on_completion ON planning_taches;

CREATE OR REPLACE FUNCTION trigger_sync_date_reelle_on_completion()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- Si la tâche est terminée, mettre à jour les dates réelles (utiliser "Terminée")
    IF NEW.statut = 'Terminée' AND OLD.statut != 'Terminée' THEN
        UPDATE planning_taches
        SET 
            date_debut_reelle = COALESCE(date_debut_reelle, NEW.date_debut_plan),
            date_fin_reelle = COALESCE(date_fin_reelle, NEW.date_fin_plan),
            avancement_pct = 100
        WHERE id = NEW.id;
    END IF;
    
    -- Si l'avancement atteint 100%, marquer comme terminé (utiliser "Terminée")
    IF NEW.avancement_pct = 100 AND NEW.statut != 'Terminée' THEN
        UPDATE planning_taches
        SET statut = 'Terminée'
        WHERE id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_sync_date_reelle_on_completion
    AFTER UPDATE ON planning_taches
    FOR EACH ROW
    EXECUTE FUNCTION trigger_sync_date_reelle_on_completion();

-- Corriger aussi le trigger update_dates_reelles
DROP TRIGGER IF EXISTS trigger_update_dates_reelles ON planning_taches;

CREATE OR REPLACE FUNCTION update_dates_reelles()
RETURNS TRIGGER AS $$
BEGIN
    -- Si avancement > 0, mettre à jour la date de début réelle
    IF NEW.avancement_pct > 0 AND OLD.avancement_pct = 0 THEN
        NEW.date_debut_reelle := CURRENT_DATE;
    END IF;
    
    -- Si avancement = 100%, mettre à jour la date de fin réelle (utiliser "Terminée")
    IF NEW.avancement_pct = 100 AND OLD.avancement_pct < 100 THEN
        NEW.date_fin_reelle := CURRENT_DATE;
        NEW.statut := 'Terminée';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_dates_reelles
    BEFORE UPDATE ON planning_taches
    FOR EACH ROW
    EXECUTE FUNCTION update_dates_reelles();

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'Migration 067 terminée avec succès !';
  RAISE NOTICE 'Trigger fn_affaire_en_suivi corrigé : utilise maintenant "Planifiée" au lieu de "En suivi"';
  RAISE NOTICE 'Trigger fn_affaire_cloturee corrigé : utilise maintenant "Terminée" au lieu de "Terminé"';
  RAISE NOTICE 'Trigger trigger_sync_date_reelle_on_completion corrigé : utilise maintenant "Terminée"';
  RAISE NOTICE 'Trigger update_dates_reelles corrigé : utilise maintenant "Terminée"';
END $$;
