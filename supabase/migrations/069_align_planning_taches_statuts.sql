-- Migration 069: Aligner les statuts entre planning_taches et remontee_site
-- Date: 2025-01-27
-- Description: Ajouter les statuts manquants dans planning_taches pour correspondre à remontee_site

-- 1. Supprimer l'ancienne contrainte CHECK
ALTER TABLE planning_taches DROP CONSTRAINT IF EXISTS planning_taches_statut_check;

-- 2. Recréer la contrainte CHECK avec tous les statuts alignés
ALTER TABLE planning_taches ADD CONSTRAINT planning_taches_statut_check 
CHECK (statut IN ('Non lancé', 'En cours', 'Terminé', 'Bloqué', 'Reporté', 'Suspendu', 'Prolongé'));

-- 3. Mettre à jour les triggers qui utilisent les anciens statuts
-- Corriger le trigger update_dates_reelles
DROP TRIGGER IF EXISTS trigger_update_dates_reelles ON planning_taches;

CREATE OR REPLACE FUNCTION update_dates_reelles()
RETURNS TRIGGER AS $$
BEGIN
    -- Si avancement > 0, mettre à jour la date de début réelle
    IF NEW.avancement_pct > 0 AND OLD.avancement_pct = 0 THEN
        NEW.date_debut_reelle := CURRENT_DATE;
    END IF;
    
    -- Si avancement = 100%, mettre à jour la date de fin réelle
    IF NEW.avancement_pct = 100 AND OLD.avancement_pct < 100 THEN
        NEW.date_fin_reelle := CURRENT_DATE;
        NEW.statut := 'Terminé';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_dates_reelles
    BEFORE UPDATE ON planning_taches
    FOR EACH ROW
    EXECUTE FUNCTION update_dates_reelles();

-- 4. Corriger les vues qui utilisent les anciens statuts
-- Mettre à jour la vue v_taches_tuiles si nécessaire
CREATE OR REPLACE VIEW v_taches_tuiles AS
SELECT 
  t.id as tache_id,
  t.libelle_tache,
  t.affaire_id,
  a.code_affaire,
  t.site_id,
  s.code_site,
  s.nom as site_nom,
  t.responsable_execution_id,
  r_exec.nom as responsable_execution_nom,
  r_exec.prenom as responsable_execution_prenom,
  t.date_debut_plan,
  t.date_fin_plan,
  t.date_debut_reelle,
  t.date_fin_reelle,
  t.statut,
  t.avancement_pct,
  t.effort_plan_h,
  t.effort_reel_h,
  t.descendu_vers_execution,
  t.date_transfert_execution,
  -- Blocages actifs
  (SELECT COUNT(*) FROM site_blocages sb 
   WHERE sb.site_id = t.site_id 
   AND sb.start_at <= CURRENT_TIMESTAMP 
   AND sb.end_at >= CURRENT_TIMESTAMP) as nb_blocages_actifs,
  -- Suspensions actives
  (SELECT COUNT(*) FROM tache_suspensions ts 
   WHERE ts.tache_id = t.id 
   AND ts.suspension_end IS NULL) as nb_suspensions_actives,
  -- Confirmation en attente
  (SELECT COUNT(*) FROM confirmation_queue cq 
   WHERE cq.tache_id = t.id 
   AND cq.date_question = CURRENT_DATE 
   AND cq.reponse IS NULL) as confirmation_en_attente,
  t.date_creation,
  t.updated_at
FROM planning_taches t
LEFT JOIN affaires a ON t.affaire_id = a.id
LEFT JOIN sites s ON t.site_id = s.id
LEFT JOIN ressources r_exec ON t.responsable_execution_id = r_exec.id;

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'Migration 069 terminée avec succès !';
  RAISE NOTICE 'Statuts planning_taches alignés avec remontee_site : Non lancé, En cours, Terminé, Bloqué, Reporté, Suspendu, Prolongé';
  RAISE NOTICE 'Triggers et vues mis à jour';
END $$;
