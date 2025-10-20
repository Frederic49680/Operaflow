-- ============================================================================
-- Migration 014 : Gestion du cycle de vie des affaires
-- ============================================================================
-- Auteur : Fred Baudry
-- Date : 2025-01-18
-- Description : Automatisation du cycle de vie des affaires (Brouillon → Clôturée)
-- ============================================================================

-- ============================================================================
-- FONCTION : Mise à jour automatique du statut des affaires
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_affaire_auto_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Si l'affaire vient d'être créée par un CA :
  IF (NEW.statut IS NULL OR NEW.statut = '') THEN
    NEW.statut := 'Brouillon';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION fn_affaire_auto_status IS 'Initialise le statut d''une affaire à "Brouillon" lors de sa création';

-- ============================================================================
-- FONCTION : Passage automatique à "Planifiée" quand une tâche est créée
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_affaire_planifiee()
RETURNS TRIGGER AS $$
BEGIN
  -- Si une tâche est créée pour une affaire, passer à "Planifiée"
  IF NEW.affaire_id IS NOT NULL THEN
    UPDATE affaires
    SET statut = 'Planifiée',
        updated_at = NOW()
    WHERE id = NEW.affaire_id
      AND statut IN ('Brouillon', 'Soumise');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION fn_affaire_planifiee IS 'Passe automatiquement une affaire au statut "Planifiée" quand une tâche est créée';

-- ============================================================================
-- FONCTION : Passage automatique à "En suivi" quand une remontée est enregistrée
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_affaire_en_suivi()
RETURNS TRIGGER AS $$
BEGIN
  -- Si une remontée est enregistrée, passer l'affaire à "En suivi"
  IF NEW.tache_id IS NOT NULL THEN
    UPDATE affaires
    SET statut = 'En suivi',
        updated_at = NOW()
    WHERE id IN (
      SELECT affaire_id 
      FROM planning_taches 
      WHERE id = NEW.tache_id
    )
    AND statut = 'Planifiée';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION fn_affaire_en_suivi IS 'Passe automatiquement une affaire au statut "En suivi" quand une remontée est enregistrée';

-- ============================================================================
-- FONCTION : Passage automatique à "Clôturée" quand toutes les tâches sont terminées
-- ============================================================================
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
  SELECT COUNT(*) = 0 INTO v_all_tasks_done
  FROM planning_taches
  WHERE affaire_id = v_affaire_id
    AND statut != 'Terminé';

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

COMMENT ON FUNCTION fn_affaire_cloturee IS 'Passe automatiquement une affaire au statut "Clôturée" quand toutes les tâches sont terminées et aucun claim actif';

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger : Initialisation du statut à "Brouillon" lors de la création
DROP TRIGGER IF EXISTS trg_affaire_auto_status ON affaires;
CREATE TRIGGER trg_affaire_auto_status
  BEFORE INSERT ON affaires
  FOR EACH ROW
  EXECUTE FUNCTION fn_affaire_auto_status();

-- Trigger : Passage à "Planifiée" quand une tâche est créée
DROP TRIGGER IF EXISTS trg_affaire_planifiee ON planning_taches;
CREATE TRIGGER trg_affaire_planifiee
  AFTER INSERT ON planning_taches
  FOR EACH ROW
  EXECUTE FUNCTION fn_affaire_planifiee();

-- Trigger : Passage à "En suivi" quand une remontée est enregistrée
DROP TRIGGER IF EXISTS trg_affaire_en_suivi ON remontee_site;
CREATE TRIGGER trg_affaire_en_suivi
  AFTER INSERT ON remontee_site
  FOR EACH ROW
  EXECUTE FUNCTION fn_affaire_en_suivi();

-- Trigger : Passage à "Clôturée" quand toutes les tâches sont terminées
DROP TRIGGER IF EXISTS trg_affaire_cloturee ON planning_taches;
CREATE TRIGGER trg_affaire_cloturee
  AFTER UPDATE ON planning_taches
  FOR EACH ROW
  WHEN (NEW.statut = 'Terminé' AND OLD.statut != 'Terminé')
  EXECUTE FUNCTION fn_affaire_cloturee();

-- ============================================================================
-- VUE : Affaires avec statistiques de cycle de vie
-- ============================================================================
CREATE OR REPLACE VIEW v_affaires_cycle_vie AS
SELECT 
  a.id,
  a.code_affaire,
  a.site_id,
  s.nom as site_nom,
  a.responsable_id,
  a.statut,
  a.date_debut,
  a.date_fin_prevue,
  a.date_fin_reelle,
  a.montant_total_ht,
  -- Statistiques
  (SELECT COUNT(*) FROM planning_taches WHERE affaire_id = a.id) as nb_taches,
  (SELECT COUNT(*) FROM planning_taches WHERE affaire_id = a.id AND statut = 'Terminé') as nb_taches_terminees,
  (SELECT COUNT(*) FROM planning_taches WHERE affaire_id = a.id AND statut = 'En cours') as nb_taches_en_cours,
  (SELECT COUNT(*) FROM claims WHERE affaire_id = a.id AND statut NOT IN ('Clos', 'Annulé')) as nb_claims_actifs,
  -- Calcul du pourcentage d'avancement
  CASE 
    WHEN (SELECT COUNT(*) FROM planning_taches WHERE affaire_id = a.id) > 0 
    THEN ROUND(
      (SELECT COUNT(*) FROM planning_taches WHERE affaire_id = a.id AND statut = 'Terminé')::numeric / 
      (SELECT COUNT(*) FROM planning_taches WHERE affaire_id = a.id)::numeric * 100
    )
    ELSE 0
  END as avancement_pct,
  -- Statut calculé
  CASE
    WHEN a.statut = 'Clôturée' THEN 'Clôturée'
    WHEN (SELECT COUNT(*) FROM remontee_site rs 
          JOIN planning_taches t ON t.id = rs.tache_id 
          WHERE t.affaire_id = a.id) > 0 THEN 'En suivi'
    WHEN (SELECT COUNT(*) FROM planning_taches WHERE affaire_id = a.id) > 0 THEN 'Planifiée'
    WHEN a.statut = 'Soumise' THEN 'Soumise à planif'
    ELSE 'Brouillon'
  END as statut_calcule,
  a.date_creation,
  a.updated_at
FROM affaires a
LEFT JOIN sites s ON a.site_id = s.id;

COMMENT ON VIEW v_affaires_cycle_vie IS 'Vue des affaires avec statistiques de cycle de vie et statut calculé';

-- ============================================================================
-- INDEX pour optimiser les requêtes
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_affaires_statut ON affaires(statut);
CREATE INDEX IF NOT EXISTS idx_planning_taches_affaire_statut ON planning_taches(affaire_id, statut);
CREATE INDEX IF NOT EXISTS idx_remontee_site_tache ON remontee_site(tache_id);
CREATE INDEX IF NOT EXISTS idx_claims_affaire_statut ON claims(affaire_id, statut);

-- ============================================================================
-- FIN DE LA MIGRATION
-- ============================================================================

