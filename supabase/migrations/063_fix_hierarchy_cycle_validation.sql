-- Migration 063: Correction de la validation des cycles hiérarchiques
-- Date: 2025-01-26
-- Description: Corriger la validation pour autoriser les relations parent-enfant valides

-- Supprimer l'ancien trigger
DROP TRIGGER IF EXISTS trigger_validate_task_hierarchy ON planning_taches;

-- Recréer la fonction avec une logique corrigée
CREATE OR REPLACE FUNCTION fn_validate_task_hierarchy()
RETURNS TRIGGER AS $$
DECLARE
    v_parent parent_id%TYPE;
    v_depth INTEGER := 0;
    v_visited UUID[] := ARRAY[]::UUID[];
BEGIN
    -- Vérifier que le niveau ne dépasse pas 3
    IF NEW.level > 3 THEN
        RAISE EXCEPTION 'Impossible d''indenter au-delà du 4ème niveau (level > 3)';
    END IF;
    
    -- Vérifier que le parent existe et est valide
    IF NEW.parent_id IS NOT NULL THEN
        -- Vérifier que le parent existe
        IF NOT EXISTS (SELECT 1 FROM planning_taches WHERE id = NEW.parent_id) THEN
            RAISE EXCEPTION 'Tâche parent inexistante';
        END IF;
        
        -- Vérifier qu'on ne crée pas une tâche parent d'elle-même
        IF NEW.parent_id = NEW.id THEN
            RAISE EXCEPTION 'Une tâche ne peut pas être parent d''elle-même';
        END IF;
        
        -- Vérifier les cycles: remonter la chaîne de parents pour détecter un cycle
        v_parent := NEW.parent_id;
        v_visited := ARRAY[NEW.id];
        
        -- Remonter jusqu'à trouver un cycle ou atteindre la racine
        WHILE v_parent IS NOT NULL AND v_depth < 100 LOOP
            -- Si on a déjà visité ce parent, c'est un cycle
            IF v_parent = ANY(v_visited) THEN
                RAISE EXCEPTION 'Cycle détecté dans la hiérarchie des tâches';
            END IF;
            
            -- Ajouter ce parent à la liste des visités
            v_visited := v_visited || v_parent;
            
            -- Récupérer le parent suivant
            SELECT parent_id INTO v_parent
            FROM planning_taches
            WHERE id = v_parent;
            
            v_depth := v_depth + 1;
        END LOOP;
        
        -- Si on a dépassé 100 niveaux, il y a probablement un cycle
        IF v_depth >= 100 THEN
            RAISE EXCEPTION 'Profondeur hiérarchique excessive, possible cycle';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recréer le trigger
CREATE TRIGGER trigger_validate_task_hierarchy
    BEFORE INSERT OR UPDATE ON planning_taches
    FOR EACH ROW
    EXECUTE FUNCTION fn_validate_task_hierarchy();

COMMENT ON FUNCTION fn_validate_task_hierarchy IS 'Valide la hiérarchie des tâches et détecte les cycles réels (pas les relations parent-enfant normales)';
