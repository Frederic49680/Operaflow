-- ============================================================================
-- Migration 012 : Triggers Gantt (Validation & Synchronisation)
-- ============================================================================
-- Auteur : Fred Baudry
-- Date : 2025-01-18
-- Description : Triggers de validation et synchronisation pour le Gantt interactif
-- ============================================================================

-- ============================================================================
-- 1. TRIGGER : Validation avant mise à jour d'une tâche
-- ============================================================================
-- Bloque les mises à jour invalides (tâches terminées/bloquées, claims actifs)
CREATE OR REPLACE FUNCTION trigger_validate_tache_update()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    v_claims_count integer;
BEGIN
    -- Vérifier si la tâche est terminée ou bloquée
    IF OLD.statut IN ('Terminé', 'Bloqué') AND (
        NEW.date_debut_plan != OLD.date_debut_plan OR
        NEW.date_fin_plan != OLD.date_fin_plan
    ) THEN
        RAISE EXCEPTION 'Impossible de déplacer une tâche terminée ou bloquée (ID: %)', NEW.id;
    END IF;
    
    -- Vérifier si la tâche est liée à un claim actif
    SELECT COUNT(*) INTO v_claims_count
    FROM claims
    WHERE tache_id = NEW.id
    AND statut NOT IN ('Clos', 'Annulé');
    
    IF v_claims_count > 0 AND (
        NEW.date_debut_plan != OLD.date_debut_plan OR
        NEW.date_fin_plan != OLD.date_fin_plan
    ) THEN
        RAISE EXCEPTION 'Impossible de déplacer une tâche liée à une réclamation active (ID: %)', NEW.id;
    END IF;
    
    -- Vérifier que les dates sont cohérentes
    IF NEW.date_debut_plan > NEW.date_fin_plan THEN
        RAISE EXCEPTION 'La date de début ne peut pas être postérieure à la date de fin (ID: %)', NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION trigger_validate_tache_update IS 'Valide les mises à jour de tâches';

-- Créer le trigger
DROP TRIGGER IF EXISTS trg_validate_tache_update ON planning_taches;
CREATE TRIGGER trg_validate_tache_update
    BEFORE UPDATE ON planning_taches
    FOR EACH ROW
    EXECUTE FUNCTION trigger_validate_tache_update();

-- ============================================================================
-- 2. TRIGGER : Recalcul automatique après mise à jour d'une tâche
-- ============================================================================
-- Recalcule automatiquement le lot après une mise à jour
CREATE OR REPLACE FUNCTION trigger_recalc_lot_after_tache_update()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- Recalculer le lot si les dates ou l'avancement ont changé
    IF NEW.lot_id IS NOT NULL AND (
        NEW.date_debut_plan != OLD.date_debut_plan OR
        NEW.date_fin_plan != OLD.date_fin_plan OR
        NEW.avancement_pct != OLD.avancement_pct OR
        NEW.date_debut_reelle != OLD.date_debut_reelle OR
        NEW.date_fin_reelle != OLD.date_fin_reelle
    ) THEN
        PERFORM fn_recalc_lot_avancement(NEW.lot_id);
    END IF;
    
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION trigger_recalc_lot_after_tache_update IS 'Recalcule automatiquement le lot après une mise à jour de tâche';

-- Créer le trigger
DROP TRIGGER IF EXISTS trg_recalc_lot_after_tache_update ON planning_taches;
CREATE TRIGGER trg_recalc_lot_after_tache_update
    AFTER UPDATE ON planning_taches
    FOR EACH ROW
    EXECUTE FUNCTION trigger_recalc_lot_after_tache_update();

-- ============================================================================
-- 3. TRIGGER : Validation des remontées de site
-- ============================================================================
-- Vérifie que les dates planifiées sont cohérentes avec les remontées
CREATE OR REPLACE FUNCTION trigger_validate_remontee_dates()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    v_tache_date_debut date;
    v_tache_date_fin date;
BEGIN
    -- Récupérer les dates planifiées de la tâche
    SELECT date_debut_plan, date_fin_plan 
    INTO v_tache_date_debut, v_tache_date_fin
    FROM planning_taches
    WHERE id = NEW.tache_id;
    
    -- Vérifier que la date de saisie est dans la période planifiée
    IF NEW.date_saisie < v_tache_date_debut OR NEW.date_saisie > v_tache_date_fin THEN
        RAISE WARNING 'La date de saisie (%) est en dehors de la période planifiée (%)', 
            NEW.date_saisie, 
            format('%s - %s', v_tache_date_debut, v_tache_date_fin);
    END IF;
    
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION trigger_validate_remontee_dates IS 'Valide les dates des remontées de site';

-- Créer le trigger
DROP TRIGGER IF EXISTS trg_validate_remontee_dates ON remontee_site;
CREATE TRIGGER trg_validate_remontee_dates
    BEFORE INSERT OR UPDATE ON remontee_site
    FOR EACH ROW
    EXECUTE FUNCTION trigger_validate_remontee_dates();

-- ============================================================================
-- 4. TRIGGER : Historisation des modifications de tâches
-- ============================================================================
-- Enregistre l'historique des modifications
CREATE OR REPLACE FUNCTION trigger_historise_tache_modifications()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- Enregistrer dans l'historique si les dates ou l'avancement ont changé
    IF (
        NEW.date_debut_plan != OLD.date_debut_plan OR
        NEW.date_fin_plan != OLD.date_fin_plan OR
        NEW.avancement_pct != OLD.avancement_pct OR
        NEW.statut != OLD.statut
    ) THEN
        INSERT INTO historique_actions (
            element_type,
            action,
            valeur_avant,
            valeur_apres,
            date_action
        ) VALUES (
            'tache',
            'modification',
            jsonb_build_object(
                'date_debut_plan', OLD.date_debut_plan,
                'date_fin_plan', OLD.date_fin_plan,
                'avancement_pct', OLD.avancement_pct,
                'statut', OLD.statut
            ),
            jsonb_build_object(
                'date_debut_plan', NEW.date_debut_plan,
                'date_fin_plan', NEW.date_fin_plan,
                'avancement_pct', NEW.avancement_pct,
                'statut', NEW.statut
            ),
            NOW()
        );
    END IF;
    
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION trigger_historise_tache_modifications IS 'Historise les modifications de tâches';

-- Créer le trigger
DROP TRIGGER IF EXISTS trg_historise_tache_modifications ON planning_taches;
CREATE TRIGGER trg_historise_tache_modifications
    AFTER UPDATE ON planning_taches
    FOR EACH ROW
    EXECUTE FUNCTION trigger_historise_tache_modifications();

-- ============================================================================
-- 5. TRIGGER : Vérification des absences lors de l'affectation
-- ============================================================================
-- Vérifie les absences lors de l'affectation d'une ressource à une tâche
CREATE OR REPLACE FUNCTION trigger_check_absence_on_affectation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    v_absence_count integer;
    v_tache_date_debut date;
    v_tache_date_fin date;
BEGIN
    -- Récupérer les dates de la tâche
    SELECT date_debut_plan, date_fin_plan 
    INTO v_tache_date_debut, v_tache_date_fin
    FROM planning_taches
    WHERE id = NEW.tache_id;
    
    -- Vérifier les absences
    SELECT COUNT(*) INTO v_absence_count
    FROM absences
    WHERE ressource_id = NEW.ressource_id
    AND statut IN ('à venir', 'en cours')
    AND (
        (date_debut <= v_tache_date_debut AND date_fin >= v_tache_date_debut) OR
        (date_debut <= v_tache_date_fin AND date_fin >= v_tache_date_fin) OR
        (date_debut >= v_tache_date_debut AND date_fin <= v_tache_date_fin)
    );
    
    IF v_absence_count > 0 THEN
        RAISE WARNING 'La ressource % est absente pendant la période de la tâche (%-%)', 
            NEW.ressource_id, 
            v_tache_date_debut, 
            v_tache_date_fin;
    END IF;
    
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION trigger_check_absence_on_affectation IS 'Vérifie les absences lors de l''affectation d''une ressource';

-- Créer le trigger (si la table taches_ressources existe)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'taches_ressources') THEN
        DROP TRIGGER IF EXISTS trg_check_absence_on_affectation ON taches_ressources;
        CREATE TRIGGER trg_check_absence_on_affectation
            BEFORE INSERT OR UPDATE ON taches_ressources
            FOR EACH ROW
            EXECUTE FUNCTION trigger_check_absence_on_affectation();
    END IF;
END $$;

-- ============================================================================
-- 6. TRIGGER : Synchronisation des dates réelles
-- ============================================================================
-- Met à jour automatiquement les dates réelles si l'avancement atteint 100%
CREATE OR REPLACE FUNCTION trigger_sync_date_reelle_on_completion()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- Si la tâche est terminée, mettre à jour les dates réelles
    IF NEW.statut = 'Terminé' AND OLD.statut != 'Terminé' THEN
        UPDATE planning_taches
        SET 
            date_debut_reelle = COALESCE(date_debut_reelle, NEW.date_debut_plan),
            date_fin_reelle = COALESCE(date_fin_reelle, NEW.date_fin_plan),
            avancement_pct = 100
        WHERE id = NEW.id;
    END IF;
    
    -- Si l'avancement atteint 100%, marquer comme terminé
    IF NEW.avancement_pct = 100 AND NEW.statut != 'Terminé' THEN
        UPDATE planning_taches
        SET statut = 'Terminé'
        WHERE id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION trigger_sync_date_reelle_on_completion IS 'Synchronise les dates réelles lors de la complétion';

-- Créer le trigger
DROP TRIGGER IF EXISTS trg_sync_date_reelle_on_completion ON planning_taches;
CREATE TRIGGER trg_sync_date_reelle_on_completion
    AFTER UPDATE ON planning_taches
    FOR EACH ROW
    EXECUTE FUNCTION trigger_sync_date_reelle_on_completion();

-- ============================================================================
-- 7. TRIGGER : Vérification des dates de l'affaire
-- ============================================================================
-- Vérifie que les dates de la tâche sont dans les bornes de l'affaire
CREATE OR REPLACE FUNCTION trigger_validate_tache_dates_in_affaire()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    v_affaire_date_debut date;
    v_affaire_date_fin date;
    v_affaire_statut text;
BEGIN
    -- Récupérer les dates de l'affaire
    SELECT date_debut, date_fin_prevue, statut
    INTO v_affaire_date_debut, v_affaire_date_fin, v_affaire_statut
    FROM affaires
    WHERE id = NEW.affaire_id;
    
    -- Vérifier que la tâche commence après le début de l'affaire
    IF NEW.date_debut_plan < v_affaire_date_debut THEN
        RAISE EXCEPTION 'La tâche ne peut pas commencer avant le début de l''affaire (ID: %)', NEW.id;
    END IF;
    
    -- Vérifier que la tâche se termine avant la fin prévue (sauf si affaire ouverte)
    IF NEW.date_fin_plan > v_affaire_date_fin AND v_affaire_statut != 'Ouverte' THEN
        RAISE EXCEPTION 'La tâche ne peut pas se terminer après la fin prévue de l''affaire (ID: %)', NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION trigger_validate_tache_dates_in_affaire IS 'Vérifie que les dates de la tâche sont dans les bornes de l''affaire';

-- Créer le trigger
DROP TRIGGER IF EXISTS trg_validate_tache_dates_in_affaire ON planning_taches;
CREATE TRIGGER trg_validate_tache_dates_in_affaire
    BEFORE INSERT OR UPDATE ON planning_taches
    FOR EACH ROW
    EXECUTE FUNCTION trigger_validate_tache_dates_in_affaire();

-- ============================================================================
-- FIN DE LA MIGRATION
-- ============================================================================

