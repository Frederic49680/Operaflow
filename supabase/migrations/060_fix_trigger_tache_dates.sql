-- Migration 060: Correction du trigger de validation des dates de tâche
-- Date: 2025-01-25
-- Description: Autoriser les tâches sans affaire et assouplir la validation des dates

-- Supprimer le trigger existant
DROP TRIGGER IF EXISTS trg_validate_tache_dates_in_affaire ON planning_taches;

-- Recréer la fonction avec une validation plus souple
CREATE OR REPLACE FUNCTION trigger_validate_tache_dates_in_affaire()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    v_affaire_date_debut date;
    v_affaire_date_fin date;
    v_affaire_statut text;
BEGIN
    -- Si la tâche n'a pas d'affaire, on accepte toutes les dates
    IF NEW.affaire_id IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Récupérer les dates de l'affaire
    SELECT date_debut, date_fin_prevue, statut
    INTO v_affaire_date_debut, v_affaire_date_fin, v_affaire_statut
    FROM affaires
    WHERE id = NEW.affaire_id;
    
    -- Si l'affaire n'existe pas, ne pas bloquer la création
    IF NOT FOUND THEN
        RETURN NEW;
    END IF;
    
    -- Si les dates ne sont pas renseignées, on accepte
    IF NEW.date_debut_plan IS NULL OR v_affaire_date_debut IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Vérifier que la tâche commence après le début de l'affaire (avec tolérance de -30 jours)
    -- Cela permet de créer des tâches de préparation en amont
    IF NEW.date_debut_plan < (v_affaire_date_debut - INTERVAL '30 days') THEN
        RAISE EXCEPTION 'La tâche ne peut pas commencer plus de 30 jours avant le début de l''affaire (ID: %)', NEW.id;
    END IF;
    
    -- Vérifier que la tâche se termine avant la fin prévue (sauf si affaire ouverte)
    -- Avec tolérance de +30 jours pour les tâches en retard
    IF NEW.date_fin_plan IS NOT NULL AND v_affaire_date_fin IS NOT NULL THEN
        IF NEW.date_fin_plan > (v_affaire_date_fin + INTERVAL '30 days') AND v_affaire_statut != 'Ouverte' THEN
            RAISE EXCEPTION 'La tâche ne peut pas se terminer plus de 30 jours après la fin prévue de l''affaire (ID: %)', NEW.id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION trigger_validate_tache_dates_in_affaire IS 'Vérifie que les dates de la tâche sont raisonnablement dans les bornes de l''affaire (avec tolérance de 30 jours)';

-- Recréer le trigger
CREATE TRIGGER trg_validate_tache_dates_in_affaire
    BEFORE INSERT OR UPDATE ON planning_taches
    FOR EACH ROW
    EXECUTE FUNCTION trigger_validate_tache_dates_in_affaire();
