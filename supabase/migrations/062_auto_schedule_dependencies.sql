-- Migration 062: Auto-scheduling des dépendances
-- Date: 2025-01-26
-- Description: Recalculer automatiquement les dates des tâches en fonction de leurs dépendances

-- ============================================================================
-- FONCTION : Auto-scheduling d'une tâche en fonction de ses dépendances
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_auto_schedule_from_dependencies(
    p_tache_id uuid
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    v_dep tache_dependances%rowtype;
    v_tache planning_taches%rowtype;
    v_precedente planning_taches%rowtype;
    v_new_date_debut date;
    v_new_date_fin date;
    v_effort_h numeric;
    v_nb_jours integer;
BEGIN
    -- Récupérer la tâche
    SELECT * INTO v_tache FROM planning_taches WHERE id = p_tache_id;
    
    IF v_tache.id IS NULL THEN
        RAISE EXCEPTION 'Tâche non trouvée: %', p_tache_id;
    END IF;
    
    -- Parcourir toutes les dépendances de cette tâche
    FOR v_dep IN
        SELECT * FROM tache_dependances WHERE tache_id = p_tache_id
    LOOP
        -- Récupérer la tâche précédente
        SELECT * INTO v_precedente FROM planning_taches WHERE id = v_dep.tache_precedente_id;
        
        IF v_precedente.id IS NULL THEN
            CONTINUE; -- Skip si la tâche précédente n'existe pas
        END IF;
        
        -- Calculer les nouvelles dates selon le type de dépendance
        CASE v_dep.type_dependance
            WHEN 'fin-debut' THEN
                -- Fin → Début : la tâche commence après la fin de la précédente + lag
                v_new_date_debut := v_precedente.date_fin_plan + v_dep.lag_jours;
                
            WHEN 'debut-debut' THEN
                -- Début → Début : même date de début + lag
                v_new_date_debut := v_precedente.date_debut_plan + v_dep.lag_jours;
                
            WHEN 'fin-fin' THEN
                -- Fin → Fin : calculer d'abord la fin, puis remonter au début
                v_new_date_fin := v_precedente.date_fin_plan + v_dep.lag_jours;
                
            WHEN 'debut-fin' THEN
                -- Début → Fin : calculer d'abord le début, puis la fin
                v_new_date_debut := v_precedente.date_debut_plan + v_dep.lag_jours;
                
            ELSE
                CONTINUE; -- Type inconnu, skip
        END CASE;
        
        -- Si on a une nouvelle date de début, mettre à jour
        IF v_new_date_debut IS NOT NULL THEN
            -- Calculer la date de fin en conservant la durée
            v_effort_h := v_tache.effort_plan_h;
            IF v_effort_h IS NULL OR v_effort_h = 0 THEN
                v_effort_h := 8; -- Par défaut 8h si non défini
            END IF;
            
            -- Estimation: 1 jour = 8h (ajustable selon besoin)
            v_nb_jours := CEIL(v_effort_h / 8.0);
            v_new_date_fin := v_new_date_debut + (v_nb_jours - 1);
            
            -- Mettre à jour la tâche
            UPDATE planning_taches
            SET 
                date_debut_plan = v_new_date_debut,
                date_fin_plan = v_new_date_fin,
                updated_at = NOW()
            WHERE id = p_tache_id;
            
        ELSIF v_new_date_fin IS NOT NULL THEN
            -- On a seulement une date de fin, mettre à jour uniquement celle-ci
            UPDATE planning_taches
            SET 
                date_fin_plan = v_new_date_fin,
                updated_at = NOW()
            WHERE id = p_tache_id;
        END IF;
        
        -- Reset pour la prochaine itération
        v_new_date_debut := NULL;
        v_new_date_fin := NULL;
    END LOOP;
    
    RAISE NOTICE 'Auto-scheduling appliqué pour la tâche %', p_tache_id;
END;
$$;

COMMENT ON FUNCTION fn_auto_schedule_from_dependencies IS 'Recalcule automatiquement les dates d''une tâche en fonction de ses dépendances';

-- ============================================================================
-- TRIGGER : Auto-scheduling après création/modification de dépendance
-- ============================================================================
CREATE OR REPLACE FUNCTION trigger_auto_schedule_on_dependency()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Appliquer l'auto-scheduling sur la tâche qui dépend (tache_id)
    PERFORM fn_auto_schedule_from_dependencies(NEW.tache_id);
    
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION trigger_auto_schedule_on_dependency IS 'Déclenche l''auto-scheduling après création/modification de dépendance';

-- Créer le trigger
DROP TRIGGER IF EXISTS trg_auto_schedule_on_dependency ON tache_dependances;
CREATE TRIGGER trg_auto_schedule_on_dependency
    AFTER INSERT OR UPDATE ON tache_dependances
    FOR EACH ROW
    EXECUTE FUNCTION trigger_auto_schedule_on_dependency();

-- ============================================================================
-- FONCTION : Appliquer l'auto-scheduling sur toutes les tâches dépendantes
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_auto_schedule_all_dependent_tasks(
    p_tache_precedente_id uuid
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    v_dep tache_dependances%rowtype;
BEGIN
    -- Parcourir toutes les tâches qui dépendent de celle-ci
    FOR v_dep IN
        SELECT * FROM tache_dependances WHERE tache_precedente_id = p_tache_precedente_id
    LOOP
        -- Appliquer l'auto-scheduling sur chaque tâche dépendante
        PERFORM fn_auto_schedule_from_dependencies(v_dep.tache_id);
    END LOOP;
    
    RAISE NOTICE 'Auto-scheduling appliqué sur toutes les tâches dépendantes de %', p_tache_precedente_id;
END;
$$;

COMMENT ON FUNCTION fn_auto_schedule_all_dependent_tasks IS 'Applique l''auto-scheduling sur toutes les tâches qui dépendent d''une tâche donnée';
