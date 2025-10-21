-- Script SQL à exécuter dans le SQL Editor de Supabase
-- Correction du trigger pour autoriser les tâches parapluies à dépasser la fin prévue

-- Supprimer l'ancien trigger
DROP TRIGGER IF EXISTS trg_validate_tache_dates_in_affaire ON planning_taches;

-- Recréer la fonction avec une exception pour les tâches parapluies
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
    
    -- Vérifier que la tâche se termine avant la fin prévue (sauf si affaire ouverte OU si c'est une tâche parapluie)
    -- Les tâches parapluies peuvent dépasser la fin prévue car elles représentent la période réelle de planification
    IF NEW.date_fin_plan > v_affaire_date_fin 
       AND v_affaire_statut != 'Ouverte' 
       AND (NEW.is_parapluie_bpu IS NULL OR NEW.is_parapluie_bpu = false) THEN
        RAISE EXCEPTION 'La tâche ne peut pas se terminer après la fin prévue de l''affaire (ID: %)', NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Recréer le trigger
CREATE TRIGGER trg_validate_tache_dates_in_affaire
    BEFORE INSERT OR UPDATE ON planning_taches
    FOR EACH ROW
    EXECUTE FUNCTION trigger_validate_tache_dates_in_affaire();

COMMENT ON FUNCTION trigger_validate_tache_dates_in_affaire IS 'Vérifie que les dates de la tâche sont dans les bornes de l''affaire (sauf pour les tâches parapluies)';

